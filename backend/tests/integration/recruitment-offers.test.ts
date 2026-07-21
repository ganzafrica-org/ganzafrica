import { describe, it, expect, beforeEach, vi } from "vitest";
import { db } from "../../src/db/client";
import {
  offers,
  applications,
  users,
  employees,
  hr_contracts,
  user_roles,
  roles,
  secure_link_tokens,
} from "../../src/db/schema";
import { eq, and } from "drizzle-orm";
import { resetDb } from "../setup";
import { makeUser, makeOpportunity, makeApplication, makeOffer } from "../factories";

vi.mock("../../src/services/email.service", () => ({
  sendEmail: vi.fn(async () => ({ id: "x" })),
}));
// Password-reset send touches its own machinery; stub to keep accept tests isolated.
vi.mock("../../src/services/auth.service", async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  return { ...actual, sendPasswordReset: vi.fn(async () => true) };
});

import * as offersService from "../../src/services/recruitment/offers.service";
import { mintLink, peekLink } from "../../src/services/secure-links.service";
import {
  setOnboardingHooks,
  getOnboardingHooks,
} from "../../src/services/recruitment/onboarding.hooks";

async function tokenFor(offerId: number, expiresAt = new Date(Date.now() + 86400_000)) {
  return mintLink("offer", offerId, expiresAt);
}

describe("REC-05 offer CRUD guards", () => {
  let hrId: number;
  let oppId: number;

  beforeEach(async () => {
    await resetDb();
    hrId = (await makeUser({ role: "hr" })).id;
    oppId = (await makeOpportunity({ createdBy: hrId })).id;
  });

  it("cannot create an offer from the wrong stage (409)", async () => {
    const app = await makeApplication({ opportunityId: oppId, pipeline_stage: "screening" });
    await expect(
      offersService.createOffer(
        app.id,
        { position_title: "Analyst", employment_type: "analyst" },
        hrId,
      ),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("creating from evaluation moves the app to offer and stores a draft", async () => {
    const app = await makeApplication({ opportunityId: oppId, pipeline_stage: "evaluation" });
    const offer = await offersService.createOffer(
      app.id,
      { position_title: "Analyst", employment_type: "analyst", start_date: "2099-01-01" },
      hrId,
    );
    expect(offer.status).toBe("draft");
    const [row] = await db.select().from(applications).where(eq(applications.id, app.id));
    expect(row.pipeline_stage).toBe("offer");
  });

  it("editing after send is blocked (409); send without letter is 422", async () => {
    const app = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer = await makeOffer({
      applicationId: app.id,
      createdBy: hrId,
      letter_file_key: null,
    });

    await expect(offersService.sendOffer(offer.id)).rejects.toMatchObject({ statusCode: 422 }); // no letter

    const withLetter = await makeOffer({
      applicationId: (await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" })).id,
      createdBy: hrId,
      letter_file_key: "offers/letter.pdf",
      status: "sent",
    });
    await expect(
      offersService.updateOffer(withLetter.id, { position_title: "X" }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("send mints a token and flips to sent", async () => {
    const app = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer = await makeOffer({
      applicationId: app.id,
      createdBy: hrId,
      letter_file_key: "offers/l.pdf",
      start_date: "2099-01-01",
    });
    const sent = await offersService.sendOffer(offer.id);
    expect(sent.offer.status).toBe("sent");
    expect(sent.token).toMatch(/^[0-9a-f]{64}$/);
    const peek = await peekLink("offer", sent.token);
    expect(peek.state).toBe("valid");
  });
});

describe("REC-05 token flow", () => {
  let hrId: number;
  let oppId: number;

  beforeEach(async () => {
    await resetDb();
    hrId = (await makeUser({ role: "hr" })).id;
    oppId = (await makeOpportunity({ createdBy: hrId })).id;
  });

  it("view does not consume; respond accept consumes; second respond → decided", async () => {
    const app = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer = await makeOffer({
      applicationId: app.id,
      createdBy: hrId,
      status: "sent",
      letter_file_key: "l.pdf",
      start_date: "2099-01-01",
    });
    const token = await tokenFor(offer.id);

    const view = await offersService.viewOfferByToken(token);
    expect(view.state).toBe("valid");
    // still valid after view
    expect((await peekLink("offer", token)).state).toBe("valid");

    const accept = await offersService.respondToOffer(token, "accept");
    expect(accept.ok).toBe(true);

    const second = await offersService.respondToOffer(token, "accept");
    expect(second).toMatchObject({ ok: false, state: "decided" });
  });

  it("concurrent double-accept → exactly one success", async () => {
    const app = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer = await makeOffer({
      applicationId: app.id,
      createdBy: hrId,
      status: "sent",
      letter_file_key: "l.pdf",
      start_date: "2099-01-01",
    });
    const token = await tokenFor(offer.id);

    const [a, b] = await Promise.all([
      offersService.respondToOffer(token, "accept").catch((e) => ({ ok: false, error: e })),
      offersService.respondToOffer(token, "accept").catch((e) => ({ ok: false, error: e })),
    ]);
    const successes = [a, b].filter((r) => (r as { ok: boolean }).ok === true);
    expect(successes).toHaveLength(1);
  });

  it("respond after expiry → expired", async () => {
    const app = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer = await makeOffer({
      applicationId: app.id,
      createdBy: hrId,
      status: "sent",
      letter_file_key: "l.pdf",
    });
    const token = await tokenFor(offer.id, new Date(Date.now() - 1000));
    const res = await offersService.respondToOffer(token, "accept");
    expect(res).toMatchObject({ ok: false, state: "expired" });
  });
});

describe("REC-05 accept transaction (the big one)", () => {
  let hrId: number;
  let oppId: number;

  beforeEach(async () => {
    await resetDb();
    hrId = (await makeUser({ role: "hr" })).id;
    oppId = (await makeOpportunity({ createdBy: hrId })).id;
    // reset the onboarding hook to the default no-op between tests
    setOnboardingHooks({ onHired: async () => false });
  });

  it("accept creates user+roles+employee+draft contract, hires the app, marks pending", async () => {
    const app = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer = await makeOffer({
      applicationId: app.id,
      createdBy: hrId,
      status: "sent",
      employment_type: "fellow",
      letter_file_key: "l.pdf",
      start_date: "2099-01-01",
    });
    const token = await tokenFor(offer.id);

    const result = await offersService.respondToOffer(token, "accept");
    expect(result.ok).toBe(true);
    if (!result.ok || result.decision !== "accept") throw new Error("expected accept");

    const [appRow] = await db.select().from(applications).where(eq(applications.id, app.id));
    expect(appRow.pipeline_stage).toBe("hired");
    expect(appRow.status).toBe("accepted");

    const [user] = await db.select().from(users).where(eq(users.id, result.userId));
    expect(user.email).toBe(app.email.toLowerCase());
    expect(user.email_verified).toBe(false);

    const grantedRoleNames = await db
      .select({ name: roles.name })
      .from(user_roles)
      .innerJoin(roles, eq(user_roles.role_id, roles.id))
      .where(eq(user_roles.user_id, result.userId));
    const names = grantedRoleNames.map((r) => r.name);
    expect(names).toContain("employee");
    expect(names).toContain("fellow");

    const [emp] = await db.select().from(employees).where(eq(employees.id, result.employeeId));
    expect(emp.status).toBe("onboarding");

    const contract = await db
      .select()
      .from(hr_contracts)
      .where(eq(hr_contracts.employee_ref_id, result.employeeId));
    expect(contract).toHaveLength(1);

    const [offerRow] = await db.select().from(offers).where(eq(offers.id, offer.id));
    expect(offerRow.status).toBe("accepted");
    expect(offerRow.onboarding_pending).toBe(true); // hook deferred
  });

  it("accept is atomic — a hook failure rolls back everything", async () => {
    setOnboardingHooks({
      onHired: async () => {
        throw new Error("boom");
      },
    });
    const app = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer = await makeOffer({
      applicationId: app.id,
      createdBy: hrId,
      status: "sent",
      letter_file_key: "l.pdf",
      start_date: "2099-01-01",
    });
    const token = await tokenFor(offer.id);

    await expect(offersService.respondToOffer(token, "accept")).rejects.toThrow();

    // Nothing persisted: no user, no employee, app not hired, offer not accepted.
    const [appRow] = await db.select().from(applications).where(eq(applications.id, app.id));
    expect(appRow.pipeline_stage).toBe("offer");
    const [offerRow] = await db.select().from(offers).where(eq(offers.id, offer.id));
    expect(offerRow.status).toBe("sent");
    expect(
      await db.select().from(users).where(eq(users.email, app.email.toLowerCase())),
    ).toHaveLength(0);

    setOnboardingHooks({ onHired: async () => false });
  });

  it("accept reuses an existing user account without touching its password", async () => {
    const app = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const existing = await makeUser({ email: app.email.toLowerCase(), role: "staff" });
    const [before] = await db.select().from(users).where(eq(users.id, existing.id));

    const offer = await makeOffer({
      applicationId: app.id,
      createdBy: hrId,
      status: "sent",
      letter_file_key: "l.pdf",
      start_date: "2099-01-01",
    });
    const token = await tokenFor(offer.id);
    const result = await offersService.respondToOffer(token, "accept");
    if (!result.ok || result.decision !== "accept") throw new Error("expected accept");

    expect(result.userId).toBe(existing.id);
    expect(result.invited).toBe(false);
    const [after] = await db.select().from(users).where(eq(users.id, existing.id));
    expect(after.password_hash).toBe(before.password_hash); // untouched
  });

  it("decline records the reason, leaves the app in offer stage, creates no user", async () => {
    const app = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer = await makeOffer({
      applicationId: app.id,
      createdBy: hrId,
      status: "sent",
      letter_file_key: "l.pdf",
      start_date: "2099-01-01",
    });
    const token = await tokenFor(offer.id);

    const res = await offersService.respondToOffer(token, "decline", "Accepted another role");
    expect(res).toMatchObject({ ok: true, decision: "decline" });

    const [offerRow] = await db.select().from(offers).where(eq(offers.id, offer.id));
    expect(offerRow.status).toBe("declined");
    expect(offerRow.decline_reason).toBe("Accepted another role");
    const [appRow] = await db.select().from(applications).where(eq(applications.id, app.id));
    expect(appRow.pipeline_stage).toBe("offer"); // unchanged
    expect(
      await db.select().from(users).where(eq(users.email, app.email.toLowerCase())),
    ).toHaveLength(0);
  });

  it("withdraw revokes active tokens", async () => {
    const app = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer = await makeOffer({
      applicationId: app.id,
      createdBy: hrId,
      status: "sent",
      letter_file_key: "l.pdf",
      start_date: "2099-01-01",
    });
    const token = await tokenFor(offer.id);

    await offersService.withdrawOffer(offer.id);
    expect((await peekLink("offer", token)).state).toBe("revoked");
    const [tok] = await db
      .select()
      .from(secure_link_tokens)
      .where(
        and(eq(secure_link_tokens.kind, "offer"), eq(secure_link_tokens.subject_id, offer.id)),
      );
    expect(tok.revoked_at).not.toBeNull();
  });
});

describe("REC-05 offer edge cases & guards", () => {
  let hrId: number;
  let oppId: number;

  beforeEach(async () => {
    await resetDb();
    hrId = (await makeUser({ role: "hr" })).id;
    oppId = (await makeOpportunity({ createdBy: hrId })).id;
    setOnboardingHooks({ onHired: async () => true }); // instantiated → onboarding_pending false path
  });

  it("not-found guards: createOffer / getOffer / updateOffer / sendOffer on missing rows", async () => {
    await expect(
      offersService.createOffer(999999, { position_title: "X", employment_type: "analyst" }, hrId),
    ).rejects.toMatchObject({ statusCode: 404 });
    await expect(offersService.getOffer(999999)).rejects.toMatchObject({ statusCode: 404 });
    await expect(offersService.updateOffer(999999, { department: "Y" })).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(await offersService.getOfferByApplication(999999)).toBeNull();
  });

  it("createOffer with only required fields (optional nulls) then a duplicate → 409", async () => {
    const app = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer = await offersService.createOffer(
      app.id,
      { position_title: "Analyst", employment_type: "analyst" },
      hrId,
    );
    expect(offer.department).toBeNull();
    expect(offer.gross_salary).toBeNull();
    await expect(
      offersService.createOffer(
        app.id,
        { position_title: "Analyst", employment_type: "analyst" },
        hrId,
      ),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("updateOffer patches every field including gross_salary null and letter guard", async () => {
    const app = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer = await makeOffer({ applicationId: app.id, createdBy: hrId, gross_salary: "5000" });
    const updated = await offersService.updateOffer(offer.id, {
      position_title: "Senior Analyst",
      employment_type: "staff",
      department: "Ops",
      start_date: "2099-02-02",
      currency: "USD",
      additional_terms: "Remote",
      gross_salary: null,
    });
    expect(updated.position_title).toBe("Senior Analyst");
    expect(updated.gross_salary).toBeNull();

    // setLetter only on a draft
    const sent = await makeOffer({
      applicationId: (await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" })).id,
      createdBy: hrId,
      status: "sent",
    });
    await expect(offersService.setLetterKey(sent.id, "x.pdf")).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("view states: not_found, decided (used), expired (revoked)", async () => {
    expect((await offersService.viewOfferByToken("0".repeat(64))).state).toBe("not_found");

    // decided: a consumed (declined) token
    const app1 = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer1 = await makeOffer({
      applicationId: app1.id,
      createdBy: hrId,
      status: "sent",
      letter_file_key: "l.pdf",
    });
    const usedToken = await tokenFor(offer1.id);
    await offersService.respondToOffer(usedToken, "decline");
    expect((await offersService.viewOfferByToken(usedToken)).state).toBe("decided");

    // expired: a revoked (withdrawn) token on a fresh sent offer
    const app2 = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer2 = await makeOffer({
      applicationId: app2.id,
      createdBy: hrId,
      status: "sent",
      letter_file_key: "l.pdf",
    });
    const revokedToken = await tokenFor(offer2.id);
    await offersService.withdrawOffer(offer2.id);
    expect((await offersService.viewOfferByToken(revokedToken)).state).toBe("expired");
  });

  it("accept a staff-type offer with null salary uses the employee role default and instantiated hook", async () => {
    const app = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer = await makeOffer({
      applicationId: app.id,
      createdBy: hrId,
      status: "sent",
      employment_type: "staff",
      letter_file_key: "l.pdf",
      start_date: null,
      gross_salary: null,
    });
    const token = await tokenFor(offer.id);
    const result = await offersService.respondToOffer(token, "accept");
    if (!result.ok || result.decision !== "accept") throw new Error("expected accept");
    const [offerRow] = await db.select().from(offers).where(eq(offers.id, offer.id));
    expect(offerRow.onboarding_pending).toBe(false); // hook instantiated
    setOnboardingHooks({ onHired: async () => false });
  });

  it("respond on an unknown token → not_found", async () => {
    const res = await offersService.respondToOffer("0".repeat(64), "accept");
    expect(res).toMatchObject({ ok: false, state: "not_found" });
  });
});
