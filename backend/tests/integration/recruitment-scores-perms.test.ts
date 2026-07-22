import { describe, it, expect, beforeEach, vi } from "vitest";
import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/db/client";
import { application_scores } from "../../src/db/schema";
import { eq, and } from "drizzle-orm";
import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares";
import { makeUser, makeOpportunity, makeApplication, makeCriterion } from "../factories";

vi.mock("../../src/services/email.service", () => ({
  sendEmail: vi.fn(async () => ({ id: "x" })),
}));

import * as pipeline from "../../src/services/recruitment/pipeline.service";

describe("REC-02 weighted scoring", () => {
  let hrId: number;
  let oppId: number;
  let appId: number;

  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    hrId = (await makeUser({ role: "hr" })).id;
    oppId = (await makeOpportunity({ createdBy: hrId })).id;
    appId = (await makeApplication({ opportunityId: oppId })).id;
  });

  // §6.6 weighted math with weights 2/1/1
  it("computes the weighted total (weights 2/1/1)", async () => {
    const c1 = await makeCriterion({ opportunityId: oppId, weight: 2, max_score: 5 });
    const c2 = await makeCriterion({ opportunityId: oppId, weight: 1, max_score: 5 });
    const c3 = await makeCriterion({ opportunityId: oppId, weight: 1, max_score: 5 });

    const total = await pipeline.upsertScores(appId, hrId, [
      { criterion_id: c1.id, score: 5 }, // 1.0 * 2
      { criterion_id: c2.id, score: 0 }, // 0.0 * 1
      { criterion_id: c3.id, score: 5 }, // 1.0 * 1
    ]);
    // (2 + 0 + 1) / 4 = 0.75
    expect(total).toBeCloseTo(0.75, 4);
  });

  it("upsert overwrites the reviewer's own score, not others'", async () => {
    const other = await makeUser({ role: "hr" });
    const c1 = await makeCriterion({ opportunityId: oppId, weight: 1, max_score: 5 });

    await pipeline.upsertScores(appId, other.id, [{ criterion_id: c1.id, score: 2 }]);
    await pipeline.upsertScores(appId, hrId, [{ criterion_id: c1.id, score: 4 }]);
    await pipeline.upsertScores(appId, hrId, [{ criterion_id: c1.id, score: 5 }]); // overwrite own

    const rows = await db
      .select()
      .from(application_scores)
      .where(eq(application_scores.application_id, appId));
    expect(rows).toHaveLength(2); // one per reviewer
    const mine = rows.find((r) => r.reviewer_user_id === hrId);
    const theirs = rows.find((r) => r.reviewer_user_id === other.id);
    expect(mine!.score).toBe(5);
    expect(theirs!.score).toBe(2); // untouched
  });

  it("score above max_score is rejected (422)", async () => {
    const c1 = await makeCriterion({ opportunityId: oppId, max_score: 5 });
    await expect(
      pipeline.upsertScores(appId, hrId, [{ criterion_id: c1.id, score: 9 }]),
    ).rejects.toMatchObject({
      statusCode: 422,
    });
  });
});

describe("REC-02 permissions", () => {
  let hrId: number;
  let oppId: number;
  let appId: number;

  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    hrId = (await makeUser({ role: "hr" })).id;
    oppId = (await makeOpportunity({ createdBy: hrId })).id;
    appId = (await makeApplication({ opportunityId: oppId })).id;
  });

  it("staff → 403 on the applications list", async () => {
    const { agent } = await loginAs("staff");
    const res = await agent.get("/api/hr/recruitment/applications");
    expect(res.status).toBe(403);
  });

  it("director reads lists but is 403 on transition", async () => {
    await grant("director", "recruitment", "read");
    const { agent } = await loginAs("director");

    const list = await agent.get("/api/hr/recruitment/applications");
    expect(list.status).toBe(200);

    const move = await agent
      .post(`/api/hr/recruitment/applications/${appId}/transition`)
      .send({ to_stage: "screening" });
    expect(move.status).toBe(403);
  });

  it("hr with recruitment:manage can transition", async () => {
    await grant("hr", "recruitment", "manage");
    const { agent } = await loginAs("hr");
    const res = await agent
      .post(`/api/hr/recruitment/applications/${appId}/transition`)
      .send({ to_stage: "screening" });
    expect(res.status).toBe(200);
    expect(res.body.application.pipeline_stage).toBe("screening");
  });

  it("illegal transition via API → 409 with allowed set", async () => {
    await grant("hr", "recruitment", "manage");
    const { agent } = await loginAs("hr");
    const res = await agent
      .post(`/api/hr/recruitment/applications/${appId}/transition`)
      .send({ to_stage: "hired" });
    expect(res.status).toBe(409);
    expect(res.body.allowed).toEqual(["screening", "rejected", "withdrawn"]);
  });
});
