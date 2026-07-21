import { describe, it, expect, beforeEach, vi } from "vitest";
import app from "../../src/app";
import supertest from "supertest";
import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares";
import { makeUser, makeOpportunity, makeApplication, makeOffer } from "../factories";

vi.mock("../../src/services/email.service", () => ({
  sendEmail: vi.fn(async () => ({ id: "x" })),
}));

describe("REC-06 API", () => {
  let hrId: number;
  let oppId: number;
  let appId: number;

  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    hrId = (await makeUser({ role: "hr" })).id;
    oppId = (await makeOpportunity({ createdBy: hrId })).id;
    appId = (await makeApplication({ opportunityId: oppId, pipeline_stage: "interview" })).id;
    await grant("hr", "recruitment", "manage");
    await grant("hr", "recruitment", "read");
  });

  it("HR assigns a reviewer, lists reviewers, and adds+lists a note", async () => {
    const expert = await makeUser({ role: "staff" });
    const { agent } = await loginAs("hr");

    const assign = await agent
      .post(`/api/hr/recruitment/applications/${appId}/reviewers`)
      .send({ reviewer_user_id: expert.id, role: "Expert" });
    expect(assign.status).toBe(201);

    const reviewers = await agent.get(`/api/hr/recruitment/applications/${appId}/reviewers`);
    expect(reviewers.body.reviewers).toHaveLength(1);

    const note = await agent
      .post(`/api/hr/recruitment/applications/${appId}/notes`)
      .send({ stage: "interview", note: "Great fit", rating: 5 });
    expect(note.status).toBe(201);
    const notes = await agent.get(`/api/hr/recruitment/applications/${appId}/notes`);
    expect(notes.body.notes[0].note).toBe("Great fit");

    const rm = await agent.delete(
      `/api/hr/recruitment/applications/${appId}/reviewers/${expert.id}`,
    );
    expect(rm.status).toBe(200);
  });

  it("staff without recruitment permission is 403 on reviewers list", async () => {
    const { agent } = await loginAs("staff");
    const res = await agent.get(`/api/hr/recruitment/applications/${appId}/reviewers`);
    expect(res.status).toBe(403);
  });

  it("close-out preview + gated close-out via API", async () => {
    const hired = await makeApplication({ opportunityId: oppId, pipeline_stage: "hired" });
    await makeOffer({ applicationId: hired.id, createdBy: hrId, status: "accepted" });
    const { agent } = await loginAs("hr");

    const preview = await agent.get(`/api/hr/recruitment/opportunities/${oppId}/close-out`);
    expect(preview.status).toBe(200);
    expect(preview.body.target_met).toBe(true);

    const close = await agent
      .post(`/api/hr/recruitment/opportunities/${oppId}/close-out`)
      .send({ rejection_reason: "Filled" });
    expect(close.status).toBe(200);
    expect(close.body.closed).toBeGreaterThanOrEqual(1); // the interview-stage app
  });
});
