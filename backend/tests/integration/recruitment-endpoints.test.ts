import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/db/client";
import { eligibility_rules, opportunity_forms } from "../../src/db/schema";
import { eq } from "drizzle-orm";
import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares";
import { makeUser, makeOpportunity, makeForm, makeRule } from "../factories";

describe("REC-01 public endpoints", () => {
  let creatorId: number;

  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    creatorId = (await makeUser({ role: "admin" })).id;
  });

  describe("GET /api/opportunities/:id/form", () => {
    it("404 when nothing is published", async () => {
      const opp = await makeOpportunity({ createdBy: creatorId });
      const res = await supertest(app).get(`/api/opportunities/${opp.id}/form`);
      expect(res.status).toBe(404);
    });

    it("returns latest published form + active rules", async () => {
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
      await makeRule({
        opportunityId: opp.id,
        field_key: "x",
        operator: "eq",
        value: "y",
        is_active: false,
        reject_message: "inactive",
      });

      const res = await supertest(app).get(`/api/opportunities/${opp.id}/form`);
      expect(res.status).toBe(200);
      expect(res.body.form.version).toBe(2);
      expect(res.body.rules).toHaveLength(1); // only active
      expect(res.body.rules[0]).toMatchObject({
        field_key: "age",
        operator: "gt",
        value: 30,
        reject_message: "Age cap.",
      });
    });
  });

  describe("POST /api/opportunities/:id/eligibility-check", () => {
    it("failing answers → eligible:false + hit_count incremented once per failing rule; no row", async () => {
      const opp = await makeOpportunity({ createdBy: creatorId });
      const rule = await makeRule({
        opportunityId: opp.id,
        field_key: "age",
        operator: "gt",
        value: 30,
        reject_message: "Age cap.",
      });

      const res = await supertest(app)
        .post(`/api/opportunities/${opp.id}/eligibility-check`)
        .send({ answers: { date_of_birth: "1980-01-01" } });

      expect(res.status).toBe(200);
      expect(res.body.eligible).toBe(false);
      expect(res.body.failed).toEqual([{ field_key: "age", reject_message: "Age cap." }]);

      const [ruleRow] = await db
        .select()
        .from(eligibility_rules)
        .where(eq(eligibility_rules.id, rule.id));
      expect(ruleRow.hit_count).toBe(1);
    });

    it("passing answers → eligible:true, no counters move", async () => {
      const opp = await makeOpportunity({ createdBy: creatorId });
      const rule = await makeRule({
        opportunityId: opp.id,
        field_key: "age",
        operator: "gt",
        value: 30,
        reject_message: "Age cap.",
      });

      const res = await supertest(app)
        .post(`/api/opportunities/${opp.id}/eligibility-check`)
        .send({ answers: { date_of_birth: "2000-01-01" } });

      expect(res.status).toBe(200);
      expect(res.body.eligible).toBe(true);

      const [ruleRow] = await db
        .select()
        .from(eligibility_rules)
        .where(eq(eligibility_rules.id, rule.id));
      expect(ruleRow.hit_count).toBe(0);
    });
  });
});

describe("REC-01 HR rules CRUD (recruitment:manage)", () => {
  let creatorId: number;
  let oppId: number;

  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    creatorId = (await makeUser({ role: "admin" })).id;
    oppId = (await makeOpportunity({ createdBy: creatorId })).id;
  });

  it("anonymous → 401", async () => {
    const res = await supertest(app).get(`/api/hr/opportunities/${oppId}/rules`);
    expect(res.status).toBe(401);
  });

  it("staff without permission → 403", async () => {
    const { agent } = await loginAs("staff");
    const res = await agent.get(`/api/hr/opportunities/${oppId}/rules`);
    expect(res.status).toBe(403);
  });

  it("hr with recruitment:manage → 200 and can create a rule", async () => {
    await grant("hr", "recruitment", "manage");
    const { agent } = await loginAs("hr");

    const list = await agent.get(`/api/hr/opportunities/${oppId}/rules`);
    expect(list.status).toBe(200);

    const created = await agent.post(`/api/hr/opportunities/${oppId}/rules`).send({
      field_key: "age",
      operator: "gt",
      value: 30,
      reject_message: "Age cap.",
    });
    expect(created.status).toBe(201);
    expect(created.body.rule.field_key).toBe("age");
  });

  it("DELETE hard-deletes a rule with no hits, deactivates one with hits", async () => {
    await grant("hr", "recruitment", "manage");
    const { agent } = await loginAs("hr");

    const clean = await makeRule({
      opportunityId: oppId,
      field_key: "a",
      operator: "eq",
      value: "b",
      reject_message: "x",
    });
    const hit = await makeRule({
      opportunityId: oppId,
      field_key: "c",
      operator: "eq",
      value: "d",
      reject_message: "y",
      hit_count: 3,
    });

    const delClean = await agent.delete(`/api/hr/opportunities/${oppId}/rules/${clean.id}`);
    expect(delClean.status).toBe(200);
    expect(delClean.body).toMatchObject({ deleted: true, deactivated: false });
    expect(
      await db.select().from(eligibility_rules).where(eq(eligibility_rules.id, clean.id)),
    ).toHaveLength(0);

    const delHit = await agent.delete(`/api/hr/opportunities/${oppId}/rules/${hit.id}`);
    expect(delHit.status).toBe(200);
    expect(delHit.body).toMatchObject({ deleted: false, deactivated: true });
    const [hitRow] = await db
      .select()
      .from(eligibility_rules)
      .where(eq(eligibility_rules.id, hit.id));
    expect(hitRow.is_active).toBe(false);
  });

  it("PUT form then publish bumps version + archives predecessor", async () => {
    await grant("hr", "recruitment", "manage");
    const { agent } = await loginAs("hr");
    await makeForm({ opportunityId: oppId, createdBy: creatorId, version: 1, status: "published" });

    const definition = { standard: [], custom: [] };
    const put = await agent.put(`/api/hr/opportunities/${oppId}/form`).send({ definition });
    expect(put.status).toBe(200);

    const publish = await agent.put(`/api/hr/opportunities/${oppId}/form/publish`);
    expect(publish.status).toBe(200);
    expect(publish.body.form.status).toBe("published");
    expect(publish.body.form.version).toBe(2);

    const rows = await db
      .select()
      .from(opportunity_forms)
      .where(eq(opportunity_forms.opportunity_id, oppId));
    const published = rows.filter((r) => r.status === "published");
    expect(published).toHaveLength(1);
    expect(published[0].version).toBe(2);
  });
});
