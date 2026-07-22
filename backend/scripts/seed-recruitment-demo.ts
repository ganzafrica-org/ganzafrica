/**
 * REC-02 demo seed: one opportunity with a published form, eligibility + screening rules,
 * evaluation criteria, and 12 applications spread across pipeline stages — so REC-03 UI work has
 * a realistic pipeline immediately. Idempotent-ish: creates a fresh opportunity each run.
 *
 * Usage: DATABASE_URL=... tsx scripts/seed-recruitment-demo.ts
 */
import { db } from "../src/db/client";
import {
  users,
  opportunities,
  opportunity_forms,
  eligibility_rules,
  applications,
  application_stage_events,
  screening_rules,
  evaluation_criteria,
} from "../src/db/schema";
import { eq } from "drizzle-orm";
import type { FormDefinition } from "../src/types/recruitment";

const STAGES = [
  "submitted",
  "submitted",
  "screening",
  "screening",
  "shortlisted",
  "shortlisted",
  "interview",
  "interview",
  "evaluation",
  "offer",
  "rejected",
  "withdrawn",
] as const;

async function main() {
  const [creator] = await db.select({ id: users.id }).from(users).limit(1);
  if (!creator) throw new Error("Seed needs at least one user — run the RBAC/user seed first.");

  const [opp] = await db
    .insert(opportunities)
    .values({
      title: "Demo Fellowship — Recruitment Pipeline",
      description: "Seeded opportunity for recruitment pipeline UI development (REC-02).",
      type: "fellowship",
      status: "published",
      application_deadline: "2099-12-31",
      created_by: creator.id,
    })
    .returning();

  const definition: FormDefinition = {
    standard: [
      {
        key: "first_name",
        label: "First name",
        type: "text",
        required: true,
        order: 1,
        section: "About you",
      },
      {
        key: "last_name",
        label: "Last name",
        type: "text",
        required: true,
        order: 2,
        section: "About you",
      },
      {
        key: "email",
        label: "Email",
        type: "text",
        required: true,
        order: 3,
        section: "About you",
      },
      {
        key: "date_of_birth",
        label: "Date of birth",
        type: "date",
        required: true,
        order: 4,
        section: "About you",
      },
    ],
    custom: [
      {
        key: "degree",
        label: "Highest degree",
        type: "select",
        required: true,
        order: 5,
        section: "Background",
        options: ["none", "bsc", "msc", "phd"],
      },
    ],
  };
  await db.insert(opportunity_forms).values({
    opportunity_id: opp.id,
    version: 1,
    status: "published",
    definition,
    created_by: creator.id,
  });

  await db.insert(eligibility_rules).values({
    opportunity_id: opp.id,
    field_key: "age",
    operator: "gt",
    value: 35,
    reject_message: "This fellowship is for applicants aged 35 or under.",
  });

  await db.insert(screening_rules).values({
    opportunity_id: opp.id,
    field_key: "degree",
    operator: "eq",
    value: "none",
    action: "auto_reject",
    email_template: "rejected",
    rejection_reason: "A completed degree is required for this fellowship.",
  });

  await db.insert(evaluation_criteria).values([
    { opportunity_id: opp.id, name: "Motivation", weight: "2", max_score: 5, sort_order: 1 },
    { opportunity_id: opp.id, name: "Experience", weight: "1", max_score: 5, sort_order: 2 },
    { opportunity_id: opp.id, name: "Communication", weight: "1", max_score: 5, sort_order: 3 },
  ]);

  for (let i = 0; i < STAGES.length; i++) {
    const stage = STAGES[i];
    const [app] = await db
      .insert(applications)
      .values({
        opportunity_id: opp.id,
        first_name: `Demo${i + 1}`,
        last_name: "Applicant",
        email: `demo_${i + 1}_${Date.now()}@example.com`,
        phone: "+250700000000",
        national_id: `DEMO${i + 1}`,
        city: "Kigali",
        country: "Rwanda",
        education_level: "bachelors_degree",
        field_of_study: "Agriculture",
        career_experience: "2 years",
        cv_url: "https://files.example.com/cv.pdf",
        motivation: "Motivated demo applicant.",
        five_year_vision: "Vision.",
        desired_impact: "Impact.",
        community_role: "Role.",
        national_strategy: "Strategy.",
        how_ganzafrica_can_help: "Help.",
        contribution_to_ganzafrica: "Contribution.",
        data_processing_consent: true,
        date_of_birth: "1998-06-15",
        pipeline_stage: stage,
        form_version: 1,
      })
      .returning();

    await db.insert(application_stage_events).values({
      application_id: app.id,
      from_stage: "submitted",
      to_stage: stage,
      actor_user_id: stage === "rejected" ? null : creator.id,
      note: "Seeded",
    });
  }

  const count = await db
    .select({ id: applications.id })
    .from(applications)
    .where(eq(applications.opportunity_id, opp.id));
  console.log(`Seeded opportunity #${opp.id} with ${count.length} applications across stages.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("seed-recruitment-demo failed:", err);
    process.exit(1);
  });
