import { describe, it, expect, beforeEach, vi } from "vitest";
import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/db/client";
import { offers, applications } from "../../src/db/schema";
import { eq } from "drizzle-orm";
import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares";
import { makeUser, makeOpportunity, makeApplication, makeOffer } from "../factories";

const sendEmailMock = vi.fn(async () => ({ id: "x" }));
vi.mock("../../src/services/email.service", () => ({
  sendEmail: (...a: unknown[]) => sendEmailMock(...a),
}));
vi.mock("../../src/services/storage.service", () => ({
  getPresignedDownload: vi.fn(async () => "https://signed.example/letter.pdf"),
}));
vi.mock("../../src/services/auth.service", async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  return { ...actual, sendPasswordReset: vi.fn(async () => true) };
});

import { mintLink } from "../../src/services/secure-links.service";

describe("REC-05 offer API — HR side", () => {
  let hrId: number;
  let oppId: number;

  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    sendEmailMock.mockClear();
    hrId = (await makeUser({ role: "hr" })).id;
    oppId = (await makeOpportunity({ createdBy: hrId })).id;
    await grant("hr", "recruitment", "manage");
    await grant("hr", "recruitment", "read");
  });

  it("staff cannot create an offer (403)", async () => {
    const appRow = await makeApplication({ opportunityId: oppId, pipeline_stage: "evaluation" });
    const { agent } = await loginAs("staff");
    const res = await agent.post(`/api/hr/recruitment/applications/${appRow.id}/offer`).send({
      position_title: "Analyst",
      employment_type: "analyst",
    });
    expect(res.status).toBe(403);
  });

  it("HR runs the full create → letter → send flow (candidate emailed)", async () => {
    const appRow = await makeApplication({ opportunityId: oppId, pipeline_stage: "evaluation" });
    const { agent } = await loginAs("hr");

    const created = await agent
      .post(`/api/hr/recruitment/applications/${appRow.id}/offer`)
      .send({
        position_title: "Data Analyst",
        employment_type: "analyst",
        start_date: "2099-01-01",
      });
    expect(created.status).toBe(201);
    const offerId = created.body.offer.id;

    const letter = await agent
      .post(`/api/hr/offers/${offerId}/letter`)
      .send({ letter_file_key: "offers/l.pdf" });
    expect(letter.status).toBe(200);

    const sent = await agent.post(`/api/hr/offers/${offerId}/send`).send({});
    expect(sent.status).toBe(200);
    expect(sent.body.offer.status).toBe("sent");
    expect(sendEmailMock).toHaveBeenCalled(); // offer email

    const withdraw = await agent.post(`/api/hr/offers/${offerId}/withdraw`).send({});
    expect(withdraw.status).toBe(200);
    expect(withdraw.body.offer.status).toBe("withdrawn");
  });

  it("PATCH edits a draft; GET returns the offer for the application", async () => {
    const appRow = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer = await makeOffer({ applicationId: appRow.id, createdBy: hrId });
    const { agent } = await loginAs("hr");

    const patched = await agent.patch(`/api/hr/offers/${offer.id}`).send({ department: "Finance" });
    expect(patched.status).toBe(200);
    expect(patched.body.offer.department).toBe("Finance");

    const got = await agent.get(`/api/hr/recruitment/applications/${appRow.id}/offer`);
    expect(got.status).toBe(200);
    expect(got.body.offer.id).toBe(offer.id);
  });
});

describe("REC-05 offer API — candidate (token)", () => {
  let hrId: number;
  let oppId: number;

  beforeEach(async () => {
    await resetDb();
    sendEmailMock.mockClear();
    hrId = (await makeUser({ role: "hr" })).id;
    oppId = (await makeOpportunity({ createdBy: hrId })).id;
  });

  it("GET view returns the offer + a presigned letter url; unknown token → 410", async () => {
    const appRow = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer = await makeOffer({
      applicationId: appRow.id,
      createdBy: hrId,
      status: "sent",
      letter_file_key: "l.pdf",
      start_date: "2099-01-01",
    });
    const token = await mintLink("offer", offer.id, new Date(Date.now() + 86400_000));

    const res = await supertest(app).get(`/api/offers/view/${token}`);
    expect(res.status).toBe(200);
    expect(res.body.offer.position_title).toBe("Data Analyst");
    expect(res.body.letter_url).toContain("signed.example");
    expect(res.body.offer.letter_file_key).toBeUndefined(); // key not leaked

    const bad = await supertest(app).get(`/api/offers/view/${"0".repeat(64)}`);
    expect(bad.status).toBe(410);
  });

  it("POST respond accept hires and emails; decline path returns decline", async () => {
    const appRow = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer = await makeOffer({
      applicationId: appRow.id,
      createdBy: hrId,
      status: "sent",
      letter_file_key: "l.pdf",
      start_date: "2099-01-01",
    });
    const token = await mintLink("offer", offer.id, new Date(Date.now() + 86400_000));

    const accept = await supertest(app)
      .post(`/api/offers/respond/${token}`)
      .send({ decision: "accept" });
    expect(accept.status).toBe(200);
    expect(accept.body.decision).toBe("accept");
    const [row] = await db.select().from(applications).where(eq(applications.id, appRow.id));
    expect(row.pipeline_stage).toBe("hired");
    expect(sendEmailMock).toHaveBeenCalled(); // welcome

    // second respond → 410 decided
    const again = await supertest(app)
      .post(`/api/offers/respond/${token}`)
      .send({ decision: "accept" });
    expect(again.status).toBe(410);
  });

  it("decline via API records the reason", async () => {
    const appRow = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer = await makeOffer({
      applicationId: appRow.id,
      createdBy: hrId,
      status: "sent",
      letter_file_key: "l.pdf",
      start_date: "2099-01-01",
    });
    const token = await mintLink("offer", offer.id, new Date(Date.now() + 86400_000));

    const res = await supertest(app)
      .post(`/api/offers/respond/${token}`)
      .send({ decision: "decline", decline_reason: "Other role" });
    expect(res.status).toBe(200);
    expect(res.body.decision).toBe("decline");
    const [row] = await db.select().from(offers).where(eq(offers.id, offer.id));
    expect(row.decline_reason).toBe("Other role");
  });
});
