import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/db/client";
import { applications, eligibility_rules } from "../../src/db/schema";
import { eq } from "drizzle-orm";
import { resetDb } from "../setup";
import { makeUser, makeOpportunity, makeForm, makeRule } from "../factories";

/** A complete legacy application body — every NOT NULL column the insert requires. */
function legacyApplicationBody(overrides: Record<string, unknown> = {}) {
  return {
    first_name: "Jane",
    last_name: "Doe",
    email: "jane@example.com",
    phone: "+250700000000",
    national_id: "1199000000000000",
    city: "Kigali",
    country: "Rwanda",
    education_level: "bachelors_degree",
    field_of_study: "Computer Science",
    career_experience: "3 years",
    cv_url: "https://files.example.com/cv.pdf",
    motivation: "I care about the mission.",
    five_year_vision: "Lead a team.",
    desired_impact: "Impact.",
    community_role: "Mentor.",
    national_strategy: "Aligned.",
    how_ganzafrica_can_help: "Growth.",
    contribution_to_ganzafrica: "Skills.",
    data_processing_consent: true,
    ...overrides,
  };
}

describe("REC-01 apply guardrail + eligibility", () => {
  let creatorId: number;

  beforeEach(async () => {
    await resetDb();
    const creator = await makeUser({ role: "admin" });
    creatorId = creator.id;
  });

  // §6.1 CHARACTERIZATION — a pre-spec opportunity (no form, no rules) applies exactly as before.
  it("characterization: legacy opportunity with no form/rules submits unchanged", async () => {
    const opp = await makeOpportunity({ createdBy: creatorId });

    const res = await supertest(app)
      .post(`/api/opportunities/${opp.id}/apply`)
      .send(legacyApplicationBody());

    expect(res.status).toBe(201);
    expect(res.body.application).toBeTruthy();
    expect(res.body.application.opportunity_id).toBe(opp.id);
    // New columns default to null for legacy submissions.
    expect(res.body.application.form_version).toBeNull();
    expect(res.body.application.date_of_birth).toBeNull();

    const rows = await db
      .select()
      .from(applications)
      .where(eq(applications.opportunity_id, opp.id));
    expect(rows).toHaveLength(1);
  });

  // §6.4 apply with failing answers → 422, no applications row
  it("apply with a failing eligibility rule → 422 and no application row", async () => {
    const opp = await makeOpportunity({ createdBy: creatorId });
    const rule = await makeRule({
      opportunityId: opp.id,
      field_key: "age",
      operator: "gt",
      value: 30,
      reject_message: "This role has an age cap.",
    });

    const res = await supertest(app)
      .post(`/api/opportunities/${opp.id}/apply`)
      .send(legacyApplicationBody({ date_of_birth: "1980-01-01" }));

    expect(res.status).toBe(422);
    expect(res.body.eligible).toBe(false);
    expect(res.body.failed).toEqual([
      { field_key: "age", reject_message: "This role has an age cap." },
    ]);

    const rows = await db
      .select()
      .from(applications)
      .where(eq(applications.opportunity_id, opp.id));
    expect(rows).toHaveLength(0);

    // hit recorded once (defense-in-depth path still counts).
    const [ruleRow] = await db
      .select()
      .from(eligibility_rules)
      .where(eq(eligibility_rules.id, rule.id));
    expect(ruleRow.hit_count).toBe(1);
  });

  // §6.5 apply with passing answers → row has form_version + standard columns
  it("apply passing answers → row persists form_version + standard columns", async () => {
    const opp = await makeOpportunity({ createdBy: creatorId });
    await makeForm({
      opportunityId: opp.id,
      createdBy: creatorId,
      version: 2,
      status: "published",
    });
    await makeRule({
      opportunityId: opp.id,
      field_key: "age",
      operator: "gt",
      value: 30,
      reject_message: "Age cap.",
    });

    const res = await supertest(app)
      .post(`/api/opportunities/${opp.id}/apply`)
      .send(
        legacyApplicationBody({
          date_of_birth: "2000-01-01",
          country_of_residence: "Rwanda",
          country_of_work: "Kenya",
          has_work_permit: true,
        }),
      );

    expect(res.status).toBe(201);
    expect(res.body.application.form_version).toBe(2);
    expect(res.body.application.country_of_residence).toBe("Rwanda");
    expect(res.body.application.country_of_work).toBe("Kenya");
    expect(res.body.application.has_work_permit).toBe(true);
  });

  // §6.6 versioning: in-flight application against v1 still accepted, form_version recorded
  it("versioning: published v2 is recorded on new submissions", async () => {
    const opp = await makeOpportunity({ createdBy: creatorId });
    await makeForm({ opportunityId: opp.id, createdBy: creatorId, version: 1, status: "archived" });
    await makeForm({
      opportunityId: opp.id,
      createdBy: creatorId,
      version: 2,
      status: "published",
    });

    const res = await supertest(app)
      .post(`/api/opportunities/${opp.id}/apply`)
      .send(legacyApplicationBody({ date_of_birth: "2000-01-01" }));

    expect(res.status).toBe(201);
    expect(res.body.application.form_version).toBe(2);
  });
});
