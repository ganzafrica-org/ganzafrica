import { describe, it, expect, beforeEach, vi } from "vitest";
import { db } from "../../src/db/client";
import {
  applications,
  application_stage_events,
  recruitment_emails,
  screening_rules,
} from "../../src/db/schema";
import { eq } from "drizzle-orm";
import { resetDb } from "../setup";
import { makeUser, makeOpportunity, makeApplication, makeScreeningRule } from "../factories";

// Count Resend sends without hitting the network.
const sendEmailMock = vi.fn(async () => ({ id: "mock" }));
vi.mock("../../src/services/email.service", () => ({
  sendEmail: (...args: unknown[]) => sendEmailMock(...args),
}));

import * as pipeline from "../../src/services/recruitment/pipeline.service";

describe("REC-02 pipeline service", () => {
  let hrId: number;
  let oppId: number;

  beforeEach(async () => {
    await resetDb();
    sendEmailMock.mockClear();
    hrId = (await makeUser({ role: "hr" })).id;
    oppId = (await makeOpportunity({ createdBy: hrId })).id;
  });

  // §6.1 transition matrix (integration side — legal move + audit trail)
  it("transition moves the stage and writes a stage event", async () => {
    const app = await makeApplication({ opportunityId: oppId });
    await pipeline.transition(app.id, "screening", hrId, { note: "start review" });

    const [row] = await db.select().from(applications).where(eq(applications.id, app.id));
    expect(row.pipeline_stage).toBe("screening");
    expect(row.status).toBe("under_review"); // legacy sync

    const events = await db
      .select()
      .from(application_stage_events)
      .where(eq(application_stage_events.application_id, app.id));
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      from_stage: "submitted",
      to_stage: "screening",
      actor_user_id: hrId,
    });
  });

  it("illegal transition throws with the allowed set (→ 409 in controller)", async () => {
    const app = await makeApplication({ opportunityId: oppId });
    await expect(pipeline.transition(app.id, "hired", hrId)).rejects.toMatchObject({
      name: "IllegalTransitionError",
      allowed: ["screening", "rejected", "withdrawn"],
    });
  });

  // §6.2 email is post-commit / non-blocking — a mail failure never rolls back the move
  it("stage still moves when the applicant email fails", async () => {
    sendEmailMock.mockRejectedValueOnce(new Error("resend down"));
    const app = await makeApplication({ opportunityId: oppId, pipeline_stage: "screening" });
    await pipeline.transition(app.id, "shortlisted", hrId, { sendEmailToApplicant: true });

    const [row] = await db.select().from(applications).where(eq(applications.id, app.id));
    expect(row.pipeline_stage).toBe("shortlisted"); // moved despite email failure
  });

  // §6.3 auto_reject screening → rejected, actor NULL, reason set, one rejected email
  it("auto_reject screening rejects with actor NULL, reason, and one email", async () => {
    const app = await makeApplication({
      opportunityId: oppId,
      overrides: { date_of_birth: "1980-01-01" },
    });
    await makeScreeningRule({
      opportunityId: oppId,
      field_key: "age",
      operator: "gt",
      value: 30,
      action: "auto_reject",
      email_template: "rejected",
      rejection_reason: "Outside the age range for this role.",
    });

    await pipeline.runScreening(app.id);

    const [row] = await db.select().from(applications).where(eq(applications.id, app.id));
    expect(row.pipeline_stage).toBe("rejected");
    expect(row.rejection_reason).toBe("Outside the age range for this role.");

    const events = await db
      .select()
      .from(application_stage_events)
      .where(eq(application_stage_events.application_id, app.id));
    expect(events[0].actor_user_id).toBeNull(); // automation

    const emails = await db
      .select()
      .from(recruitment_emails)
      .where(eq(recruitment_emails.application_id, app.id));
    expect(emails.filter((e) => e.email_type === "rejected")).toHaveLength(1);
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
  });

  it("flag screening flags without an email", async () => {
    const app = await makeApplication({
      opportunityId: oppId,
      overrides: { country_of_residence: "Rwanda" },
    });
    await makeScreeningRule({
      opportunityId: oppId,
      field_key: "country_of_residence",
      operator: "eq",
      value: "Rwanda",
      action: "flag",
      rejection_reason: "Manual review: local applicant.",
    });

    await pipeline.runScreening(app.id);

    const [row] = await db.select().from(applications).where(eq(applications.id, app.id));
    expect(row.flagged).toBe(true);
    expect(row.flag_note).toContain("Manual review");
    expect(row.pipeline_stage).toBe("submitted"); // not rejected
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  // §6.4 screening error injection never breaks anything
  it("a garbage-operator rule is skipped; application stays submitted", async () => {
    const app = await makeApplication({ opportunityId: oppId });
    await makeScreeningRule({
      opportunityId: oppId,
      field_key: "age",
      operator: "explode",
      value: 1,
      action: "auto_reject",
    });

    await expect(pipeline.runScreening(app.id)).resolves.toBeUndefined();
    const [row] = await db.select().from(applications).where(eq(applications.id, app.id));
    expect(row.pipeline_stage).toBe("submitted");
  });

  // §6.5 email idempotency: two sends → one row, one Resend call
  it("applicant email is sent once per (application, type)", async () => {
    const app = await makeApplication({ opportunityId: oppId });
    const first = await pipeline.sendApplicantEmail(app.id, "received");
    const second = await pipeline.sendApplicantEmail(app.id, "received");

    expect(first.sent).toBe(true);
    expect(second.sent).toBe(false);
    expect(sendEmailMock).toHaveBeenCalledTimes(1);

    const rows = await db
      .select()
      .from(recruitment_emails)
      .where(eq(recruitment_emails.application_id, app.id));
    expect(rows).toHaveLength(1);
  });

  it("records a hit on each matched screening rule", async () => {
    const app = await makeApplication({
      opportunityId: oppId,
      overrides: { date_of_birth: "1980-01-01" },
    });
    const rule = await makeScreeningRule({
      opportunityId: oppId,
      field_key: "age",
      operator: "gt",
      value: 30,
      action: "flag",
    });
    await pipeline.runScreening(app.id);
    const [row] = await db.select().from(screening_rules).where(eq(screening_rules.id, rule.id));
    expect(row.hit_count).toBe(1);
  });
});
