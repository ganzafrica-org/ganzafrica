/**
 * Multi-signatory signing: an HR-chosen, arbitrary-length signer list for one contract/document,
 * sequential (in-order, gated) or parallel (any order) — generalizes the existing 2-signer
 * onboarding co-sign (createSequentialRequests, still exercised unchanged in
 * contract-signing-sequence.test.ts) via the new createSignerSequence.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { eq } from "drizzle-orm";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import { hr_settings } from "../../src/db/schema";
import * as signing from "../../src/services/signing.service";
import { makeUser, makeEmployeeUser, ensureRole } from "../factories";
import { loginAs } from "../helpers/auth";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares/auth.middleware";

const sendEmailMock = vi.fn(async () => ({ id: "x" }));
vi.mock("../../src/services/email.service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../src/services/email.service")>()),
  sendEmail: (...args: unknown[]) => sendEmailMock(...args),
}));

const sendNotificationMock = vi.fn(async () => {});
vi.mock("../../src/modules/hr/notifications/notification.service", () => ({
  sendNotification: (...args: unknown[]) => sendNotificationMock(...args),
}));

async function seedTemplate(createdBy: number) {
  return signing.createTemplate({ name: `Ad-hoc doc ${Date.now()}` }, createdBy);
}

describe("createSignerSequence — multi-signatory signing", () => {
  let hrUserId: number;
  let signerIds: number[];

  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    hrUserId = (await makeUser({ role: "hr" })).id;
    signerIds = [
      (await makeUser({ role: "employee" })).id,
      (await makeUser({ role: "employee" })).id,
      (await makeUser({ role: "employee" })).id,
    ];
    sendEmailMock.mockClear();
    sendNotificationMock.mockClear();
  });

  it("sequential: only the first signer is sent; each signer can only act once the prior one has signed", async () => {
    const template = await seedTemplate(hrUserId);
    const requests = await signing.createSignerSequence(
      {
        template_id: template.id,
        subject: "Partnership agreement",
        ref_kind: "document",
        ref_id: "doc-1",
        signerUserIds: signerIds,
        mode: "sequential",
      },
      hrUserId,
    );

    expect(requests).toHaveLength(3);
    expect(requests.map((r) => r.sequence_no)).toEqual([1, 2, 3]);

    const fresh = async () => Promise.all(requests.map((r) => signing.getRequest(r.id)));
    let [r1, r2, r3] = await fresh();
    expect(r1.status).toBe("sent");
    expect(r2.status).toBe("draft");
    expect(r3.status).toBe("draft");

    // Out of turn: signer 2 can't act before signer 1.
    await expect(signing.signInternal(r2.id, signerIds[1], {})).rejects.toMatchObject({
      statusCode: 409,
    });

    await signing.signInternal(r1.id, signerIds[0], {});
    [r1, r2, r3] = await fresh();
    expect(r1.status).toBe("signed");
    expect(r2.status).toBe("sent"); // advanced automatically
    expect(r3.status).toBe("draft");

    await signing.signInternal(r2.id, signerIds[1], {});
    await signing.signInternal((await fresh())[2].id, signerIds[2], {});
    const final = await fresh();
    expect(final.every((r) => r.status === "signed")).toBe(true);
  });

  it("parallel: all signers are sent immediately and may sign in any order", async () => {
    const template = await seedTemplate(hrUserId);
    const requests = await signing.createSignerSequence(
      {
        template_id: template.id,
        subject: "NDA",
        ref_kind: "document",
        ref_id: "doc-2",
        signerUserIds: signerIds,
        mode: "parallel",
      },
      hrUserId,
    );

    const statuses = await Promise.all(requests.map((r) => signing.getRequest(r.id)));
    expect(statuses.every((r) => r.status === "sent")).toBe(true);

    // Sign out of "sequence order" (3rd, then 1st, then 2nd) — none of this is blocked.
    await signing.signInternal(requests[2].id, signerIds[2], {});
    await signing.signInternal(requests[0].id, signerIds[0], {});
    await signing.signInternal(requests[1].id, signerIds[1], {});

    const final = await Promise.all(requests.map((r) => signing.getRequest(r.id)));
    expect(final.every((r) => r.status === "signed")).toBe(true);
  });

  it("emails and notifies each signer once their request is sent", async () => {
    const template = await seedTemplate(hrUserId);
    await signing.createSignerSequence(
      {
        template_id: template.id,
        subject: "NDA",
        ref_kind: "document",
        ref_id: "doc-3",
        signerUserIds: signerIds,
        mode: "parallel",
      },
      hrUserId,
    );

    expect(sendEmailMock).toHaveBeenCalledTimes(3);
    expect(sendNotificationMock).toHaveBeenCalledTimes(3);
    expect(sendNotificationMock.mock.calls[0][0]).toMatchObject({
      type: "SIGNATURE_REQUESTED",
      recipientUserIds: [signerIds[0]],
    });
  });

  it("emails both the signer's personal and work address when the signer has both", async () => {
    const signerWithWorkEmail = await makeEmployeeUser({
      role: "employee",
      employmentType: "staff",
      workEmail: "signer.work@ganzafrica.org",
    });
    const template = await seedTemplate(hrUserId);

    await signing.createSignerSequence(
      {
        template_id: template.id,
        subject: "Consultancy agreement",
        ref_kind: "document",
        ref_id: "doc-5",
        signerUserIds: [signerWithWorkEmail.user.id],
        mode: "sequential",
      },
      hrUserId,
    );

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    const [to] = sendEmailMock.mock.calls[0];
    expect(to).toBe(`${signerWithWorkEmail.user.email}, signer.work@ganzafrica.org`);
  });

  it("rejects an empty signer list", async () => {
    const template = await seedTemplate(hrUserId);
    await expect(
      signing.createSignerSequence(
        {
          template_id: template.id,
          subject: "Empty",
          ref_kind: "document",
          ref_id: "doc-4",
          signerUserIds: [],
          mode: "sequential",
        },
        hrUserId,
      ),
    ).rejects.toMatchObject({ statusCode: 422 });
  });
});

describe("hr_settings — require multiple signers toggle", () => {
  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
  });

  it("round-trips a value via getSetting/setSetting", async () => {
    const { getSetting, setSetting } = await import("../../src/services/hr/settings.service");
    await ensureRole("hr");
    const hrUser = await makeUser({ role: "hr" });
    expect(await getSetting("require_multiple_signers")).toBeNull();

    await setSetting("require_multiple_signers", true, hrUser.id);
    expect(await getSetting("require_multiple_signers")).toBe(true);

    await setSetting("require_multiple_signers", false, hrUser.id);
    expect(await getSetting("require_multiple_signers")).toBe(false);

    const rows = await db
      .select()
      .from(hr_settings)
      .where(eq(hr_settings.key, "require_multiple_signers"));
    expect(rows).toHaveLength(1); // upsert, not a new row per write
  });

  it("GET/PUT /hr/settings/:key round-trips over HTTP for a settings:manage role", async () => {
    await grant("hr", "settings", "manage");
    const { agent } = await loginAs("hr");

    const before = await agent.get("/api/hr/settings/require_multiple_signers");
    expect(before.status).toBe(200);
    expect(before.body.value ?? null).toBeNull();

    const put = await agent.put("/api/hr/settings/require_multiple_signers").send({ value: true });
    expect(put.status).toBe(200);

    const after = await agent.get("/api/hr/settings/require_multiple_signers");
    expect(after.status).toBe(200);
    expect(after.body.value).toBe(true);
  });

  it("403s a role with no settings:manage permission", async () => {
    const { agent } = await loginAs("employee");
    const res = await agent.put("/api/hr/settings/require_multiple_signers").send({ value: true });
    expect(res.status).toBe(403);
  });
});
