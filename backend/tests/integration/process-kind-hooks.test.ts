/**
 * LCM-01 §6.4/§6.6 — task kinds that carry a completion side-condition, and the REC-05 seam.
 *
 * leave_setup is the reason MOD-06 shipped first: it calls the real ensureBalances, so a hire whose
 * employment type has no leave policy cannot be marked "leave set up".
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { eq, and } from "drizzle-orm";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import {
  employees,
  hr_contracts,
  hr_leave_balances,
  process_tasks,
  offers,
  users,
} from "../../src/db/schema";
import { instantiateProcess, completeTask } from "../../src/services/hr/process.service";
import {
  makeEmployeeUser,
  makeProcessTemplate,
  makeUser,
  makeLeavePolicy,
  ensureRole,
  makeApplication,
  makeOffer,
  makeOpportunity,
} from "../factories";

async function taskNamed(instanceId: number, title: string) {
  const [row] = await db
    .select()
    .from(process_tasks)
    .where(and(eq(process_tasks.instance_id, instanceId), eq(process_tasks.title, title)))
    .limit(1);
  return row;
}

describe("LCM-01 kind side-effects", () => {
  let hrUserId: number;

  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    hrUserId = (await makeUser({ role: "hr" })).id;
  });

  it("blocks contract_signing until the contract is ACTIVE", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Sign contract", kind: "contract_signing", is_blocking: true }],
    });

    const [contract] = await db
      .insert(hr_contracts)
      .values({
        employee_ref_id: subject.employee.id,
        job_title: "Analyst",
        department: "Programs",
        start_date: new Date("2026-03-02"),
        employment_term: "indefinite",
        employment_type: "full-time",
        compensation_type: "salaried",
        currency: "RWF",
        gross_annual_rate: "12000000",
        status: "DRAFT",
      })
      .returning();

    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });
    const task = await taskNamed(instance.id, "Sign contract");

    await db
      .update(process_tasks)
      .set({ link_ref: { contract_id: contract.id } })
      .where(eq(process_tasks.id, task.id));

    await expect(completeTask(hrUserId, task.id)).rejects.toMatchObject({ statusCode: 422 });

    await db.update(hr_contracts).set({ status: "ACTIVE" }).where(eq(hr_contracts.id, contract.id));

    const done = await completeTask(hrUserId, task.id);
    expect(done.status).toBe("done");
  });

  it("rejects contract_signing with no contract referenced", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Sign contract", kind: "contract_signing" }],
    });

    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });
    const task = await taskNamed(instance.id, "Sign contract");

    await expect(completeTask(hrUserId, task.id)).rejects.toMatchObject({ statusCode: 422 });
  });

  it("leave_setup materializes MOD-06 balances on completion", async () => {
    await makeLeavePolicy({ employmentType: "staff", type: "ANNUAL", annualDays: 20 });
    const subject = await makeEmployeeUser({ employmentType: "staff" });

    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Set up leave", kind: "leave_setup" }],
    });

    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });
    const task = await taskNamed(instance.id, "Set up leave");

    const done = await completeTask(hrUserId, task.id);
    expect(done.status).toBe("done");

    const balances = await db
      .select()
      .from(hr_leave_balances)
      .where(eq(hr_leave_balances.employee_id, subject.employee.id));
    expect(balances.length).toBeGreaterThan(0);
  });

  it("leave_setup 422s when no policy covers the employment type", async () => {
    const subject = await makeEmployeeUser({ employmentType: "contractor" }); // no policy
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Set up leave", kind: "leave_setup" }],
    });

    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });
    const task = await taskNamed(instance.id, "Set up leave");

    await expect(completeTask(hrUserId, task.id)).rejects.toMatchObject({ statusCode: 422 });
  });

  it("document_upload requires a referenced document", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Upload ID", kind: "document_upload", default_assignee: "employee" }],
    });

    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });
    const task = await taskNamed(instance.id, "Upload ID");

    await expect(completeTask(subject.user.id, task.id)).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  it("plain checklist tasks complete with no side condition", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Office tour", kind: "checklist" }],
    });

    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });
    const task = await taskNamed(instance.id, "Office tour");

    expect((await completeTask(hrUserId, task.id)).status).toBe("done");
  });
});

// The offer-accept path sends an invite email; stub it the same way the REC-05 suite does.
vi.mock("../../src/services/recruitment/offer-emails", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, sendOfferAcceptedNotice: vi.fn(async () => true) };
});

describe("LCM-01 × REC-05 hire seam", () => {
  let hrUserId: number;
  let oppId: number;

  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    await ensureRole("analyst");
    hrUserId = (await makeUser({ role: "hr" })).id;
    oppId = (await makeOpportunity({ createdBy: hrUserId })).id;
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Welcome", is_blocking: true }],
    });
  });

  it("accepting an offer instantiates onboarding inside the hire transaction", async () => {
    const { registerOnboardingHooks } = await import("../../src/services/hr/process.hooks");
    registerOnboardingHooks();

    const offersService = await import("../../src/services/recruitment/offers.service");
    const { mintLink } = await import("../../src/services/secure-links.service");

    const app = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer = await makeOffer({
      applicationId: app.id,
      createdBy: hrUserId,
      status: "sent",
      employment_type: "analyst",
    });

    const token = await mintLink("offer", offer.id, new Date(Date.now() + 86400_000));
    const result = await offersService.respondToOffer(token, "accept");
    if (!result.ok || result.decision !== "accept") throw new Error("expected accept");

    // The employee exists, has an onboarding instance, and the offer is NOT left pending.
    const [employee] = await db.select().from(employees).where(eq(employees.id, result.employeeId));
    expect(employee.status).toBe("onboarding");

    const [offerRow] = await db.select().from(offers).where(eq(offers.id, offer.id));
    expect(offerRow.onboarding_pending).toBe(false);

    const tasks = await db.select().from(process_tasks);
    expect(tasks.map((t) => t.title)).toContain("Welcome");
  });

  it("a failure while instantiating rolls back the whole hire", async () => {
    const { setOnboardingHooks } = await import("../../src/services/recruitment/onboarding.hooks");
    setOnboardingHooks({
      onHired: async () => {
        throw new Error("instantiation blew up");
      },
    });

    const offersService = await import("../../src/services/recruitment/offers.service");
    const { mintLink } = await import("../../src/services/secure-links.service");

    const app = await makeApplication({ opportunityId: oppId, pipeline_stage: "offer" });
    const offer = await makeOffer({
      applicationId: app.id,
      createdBy: hrUserId,
      status: "sent",
      employment_type: "analyst",
    });

    const token = await mintLink("offer", offer.id, new Date(Date.now() + 86400_000));
    await expect(offersService.respondToOffer(token, "accept")).rejects.toThrow();

    // Nothing survives: no user, no employee, offer still 'sent'.
    expect(
      await db.select().from(users).where(eq(users.email, app.email.toLowerCase())),
    ).toHaveLength(0);
    expect(await db.select().from(employees)).toHaveLength(0);
    const [offerRow] = await db.select().from(offers).where(eq(offers.id, offer.id));
    expect(offerRow.status).toBe("sent");

    setOnboardingHooks({ onHired: async () => false });
  });
});
