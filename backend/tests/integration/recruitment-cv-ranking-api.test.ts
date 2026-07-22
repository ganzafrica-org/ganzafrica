import { describe, it, expect, beforeEach, vi } from "vitest";
import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares";
import { makeUser, makeOpportunity, makeApplication } from "../factories";

vi.mock("../../src/services/text-extraction.service", async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  return { ...actual, extractText: vi.fn(async () => ({ text: "python", chars: 6, ok: true })) };
});
vi.stubGlobal(
  "fetch",
  vi.fn(async () => ({
    ok: true,
    arrayBuffer: async () => new ArrayBuffer(8),
    headers: { get: () => "application/pdf" },
  })) as never,
);

describe("REC-07 ranking API", () => {
  let hrId: number;
  let oppId: number;

  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    hrId = (await makeUser({ role: "hr" })).id;
    oppId = (await makeOpportunity({ createdBy: hrId })).id;
    await grant("hr", "recruitment", "manage");
    await grant("hr", "recruitment", "read");
  });

  it("HR manages criteria, rescored, and reads the ranked list; staff is 403 on criteria", async () => {
    const { agent } = await loginAs("hr");

    const created = await agent
      .post(`/api/hr/recruitment/opportunities/${oppId}/ranking-criteria`)
      .send({ keyword: "python", weight: 2 });
    expect(created.status).toBe(201);
    const critId = created.body.criterion.id;

    const list = await agent.get(`/api/hr/recruitment/opportunities/${oppId}/ranking-criteria`);
    expect(list.body.criteria).toHaveLength(1);

    const patched = await agent
      .patch(`/api/hr/recruitment/opportunities/${oppId}/ranking-criteria/${critId}`)
      .send({ weight: 3 });
    expect(patched.status).toBe(200);

    await makeApplication({ opportunityId: oppId, overrides: { cv_url: "cvs/a.pdf" } });
    const rescore = await agent.post(`/api/hr/recruitment/opportunities/${oppId}/rescore`).send();
    expect(rescore.status).toBe(200);
    expect(rescore.body.scored).toBe(1);

    const ranked = await agent.get(`/api/hr/recruitment/opportunities/${oppId}/ranked`);
    expect(ranked.status).toBe(200);
    expect(ranked.body.applications[0].cv_score).toBeTruthy();

    const del = await agent.delete(
      `/api/hr/recruitment/opportunities/${oppId}/ranking-criteria/${critId}`,
    );
    expect(del.status).toBe(200);

    const staff = await loginAs("staff");
    expect(
      (await staff.agent.get(`/api/hr/recruitment/opportunities/${oppId}/ranking-criteria`)).status,
    ).toBe(403);
  });
});
