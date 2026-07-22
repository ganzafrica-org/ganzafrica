import { describe, it, expect, beforeEach, vi } from "vitest";
import { db } from "../../src/db/client";
import { applications, offers, opportunities } from "../../src/db/schema";
import { eq } from "drizzle-orm";
import { resetDb } from "../setup";
import { makeUser, makeOpportunity, makeApplication, makeOffer } from "../factories";

vi.mock("../../src/services/email.service", () => ({
  sendEmail: vi.fn(async () => ({ id: "x" })),
}));

import * as review from "../../src/services/recruitment/review.service";

describe("REC-06 reviewer assignment", () => {
  let hrId: number;
  let oppId: number;
  let appId: number;

  beforeEach(async () => {
    await resetDb();
    hrId = (await makeUser({ role: "hr" })).id;
    oppId = (await makeOpportunity({ createdBy: hrId })).id;
    appId = (await makeApplication({ opportunityId: oppId, pipeline_stage: "interview" })).id;
  });

  it("assigns, lists, detects, and removes a reviewer (idempotent assign)", async () => {
    const expert = await makeUser({ role: "staff", name: "Data Expert" });

    const a1 = await review.assignReviewer(appId, expert.id, hrId, "Data science expert");
    const a2 = await review.assignReviewer(appId, expert.id, hrId); // duplicate → same row
    expect(a2.id).toBe(a1.id);

    const list = await review.listReviewers(appId);
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      reviewer_user_id: expert.id,
      role: "Data science expert",
      name: "Data Expert",
    });

    expect(await review.isAssignedReviewer(appId, expert.id)).toBe(true);
    expect(await review.isAssignedReviewer(appId, hrId)).toBe(false);

    await review.removeReviewer(appId, expert.id);
    expect(await review.isAssignedReviewer(appId, expert.id)).toBe(false);
  });

  it("404s on a missing application or reviewer", async () => {
    await expect(review.assignReviewer(999999, hrId, hrId)).rejects.toMatchObject({
      statusCode: 404,
    });
    await expect(review.assignReviewer(appId, 999999, hrId)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe("REC-06 interview notes", () => {
  let hrId: number;
  let appId: number;

  beforeEach(async () => {
    await resetDb();
    hrId = (await makeUser({ role: "hr" })).id;
    const oppId = (await makeOpportunity({ createdBy: hrId })).id;
    appId = (await makeApplication({ opportunityId: oppId, pipeline_stage: "interview" })).id;
  });

  it("adds notes with author + rating and lists them chronologically", async () => {
    await review.addNote(appId, hrId, {
      stage: "interview",
      note: "Strong communicator",
      rating: 4,
    });
    await review.addNote(appId, hrId, {
      stage: "interview",
      note: "Needs depth on SQL",
      rating: 3,
    });

    const notes = await review.listNotes(appId);
    expect(notes).toHaveLength(2);
    expect(notes[0]).toMatchObject({
      note: "Strong communicator",
      rating: 4,
      author_name: expect.any(String),
    });
  });

  it("rejects an out-of-range rating (422) and a missing application (404)", async () => {
    await expect(
      review.addNote(appId, hrId, { stage: "interview", note: "x", rating: 9 }),
    ).rejects.toMatchObject({ statusCode: 422 });
    await expect(
      review.addNote(999999, hrId, { stage: "interview", note: "x" }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("defaults the stage to the application's current stage when omitted", async () => {
    const note = await review.addNote(appId, hrId, { stage: "", note: "Auto-staged" });
    expect(note.stage).toBe("interview");
  });
});

describe("REC-06 bulk close-out (target-hires gated)", () => {
  let hrId: number;
  let oppId: number;

  beforeEach(async () => {
    await resetDb();
    hrId = (await makeUser({ role: "hr" })).id;
  });

  async function acceptedOfferFor(opportunityId: number) {
    const app = await makeApplication({ opportunityId, pipeline_stage: "hired" });
    await makeOffer({ applicationId: app.id, createdBy: hrId, status: "accepted" });
    return app;
  }

  it("preview reports target, accepted, remaining, and target_met", async () => {
    oppId = (await makeOpportunity({ createdBy: hrId })).id; // default target 1
    await acceptedOfferFor(oppId); // 1 accepted
    await makeApplication({ opportunityId: oppId, pipeline_stage: "screening" });
    await makeApplication({ opportunityId: oppId, pipeline_stage: "interview" });

    const preview = await review.closeOutPreview(oppId);
    expect(preview).toMatchObject({
      target_hires: 1,
      accepted_offers: 1,
      target_met: true,
      remaining: 2,
    });
  });

  it("close-out is blocked (409) until the target is met", async () => {
    const [opp] = await db
      .insert(opportunities)
      .values({
        title: "Two hires",
        description: "d",
        type: "employment",
        status: "published",
        application_deadline: "2099-12-31",
        created_by: hrId,
        target_hires: 2,
      })
      .returning();
    await acceptedOfferFor(opp.id); // 1 of 2
    await makeApplication({ opportunityId: opp.id, pipeline_stage: "screening" });

    await expect(review.closeOutRemaining(opp.id, hrId)).rejects.toMatchObject({ statusCode: 409 });
  });

  it("once the target is met, close-out rejects every remaining non-terminal candidate", async () => {
    oppId = (await makeOpportunity({ createdBy: hrId })).id; // target 1
    await acceptedOfferFor(oppId);
    const a1 = await makeApplication({ opportunityId: oppId, pipeline_stage: "screening" });
    const a2 = await makeApplication({ opportunityId: oppId, pipeline_stage: "interview" });
    const alreadyRejected = await makeApplication({
      opportunityId: oppId,
      pipeline_stage: "rejected",
    });

    const result = await review.closeOutRemaining(oppId, hrId, "Position filled");
    expect(result.closed).toBe(2);

    for (const id of [a1.id, a2.id]) {
      const [row] = await db.select().from(applications).where(eq(applications.id, id));
      expect(row.pipeline_stage).toBe("rejected");
      expect(row.rejection_reason).toBe("Position filled");
    }
    // already-terminal untouched (not double-processed)
    const [rej] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, alreadyRejected.id));
    expect(rej.pipeline_stage).toBe("rejected");
  });

  it("close-out preview 404s for a missing opportunity", async () => {
    await expect(review.closeOutPreview(999999)).rejects.toMatchObject({ statusCode: 404 });
  });
});
