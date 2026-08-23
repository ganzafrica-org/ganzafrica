/**
 * Onboarding contract-signing: linking a contract to a contract_signing task auto-generates a
 * two-signer sequential signature_request (HR first, then the employee), and the contract only
 * activates — which is what lets the task complete — once BOTH signers finish.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { eq, and } from "drizzle-orm";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import { hr_contracts, process_tasks } from "../../src/db/schema";
import {
  instantiateProcess,
  completeTask,
  reassignTask,
} from "../../src/services/hr/process.service";
import * as signing from "../../src/services/signing.service";
import { makeEmployeeUser, makeProcessTemplate, makeUser, ensureRole } from "../factories";

vi.mock("../../src/services/email.service", () => ({
  sendEmail: vi.fn(async () => ({ id: "x" })),
}));

async function taskNamed(instanceId: number, title: string) {
  const [row] = await db
    .select()
    .from(process_tasks)
    .where(and(eq(process_tasks.instance_id, instanceId), eq(process_tasks.title, title)))
    .limit(1);
  return row;
}

async function makeDraftContract(employeeId: string) {
  const [contract] = await db
    .insert(hr_contracts)
    .values({
      employee_ref_id: employeeId,
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
  return contract;
}

async function seedEmploymentContractTemplate(createdBy: number) {
  const template = await signing.createTemplate({ name: "Employment Contract" }, createdBy);
  await signing.addField(template.id, {
    key: "hr_signature",
    label: "HR Signature",
    type: "signature",
    signer_index: 0,
  });
  await signing.addField(template.id, {
    key: "employee_signature",
    label: "Employee Signature",
    type: "signature",
    signer_index: 1,
  });
  return template;
}

describe("onboarding contract-signing sequence", () => {
  let hrUserId: number;

  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    hrUserId = (await makeUser({ role: "hr" })).id;
  });

  it("422s with an actionable message when no Employment Contract template exists", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Sign contract", kind: "contract_signing", is_blocking: true }],
    });
    const contract = await makeDraftContract(subject.employee.id);
    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });
    const task = await taskNamed(instance.id, "Sign contract");

    await expect(
      reassignTask(task.id, { link_ref: { contract_id: contract.id } }, hrUserId),
    ).rejects.toMatchObject({ statusCode: 422, code: "SIGNING_TEMPLATE_MISSING" });
  });

  it("linking a contract generates a two-signer sequential request: HR sent, employee still draft, in order", async () => {
    await seedEmploymentContractTemplate(hrUserId);
    const subject = await makeEmployeeUser({ employmentType: "staff" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Sign contract", kind: "contract_signing", is_blocking: true }],
    });
    const contract = await makeDraftContract(subject.employee.id);
    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });
    const task = await taskNamed(instance.id, "Sign contract");

    await reassignTask(task.id, { link_ref: { contract_id: contract.id } }, hrUserId);

    const sequence = await signing.listByRef("contract", contract.id);
    expect(sequence).toHaveLength(2);
    const [first, second] = sequence; // listByRef orders by sequence_no
    expect(first.sequence_no).toBe(1);
    expect(first.signer_user_id).toBe(hrUserId);
    expect(first.status).toBe("sent"); // HR's turn — sent immediately
    expect(second.sequence_no).toBe(2);
    expect(second.signer_user_id).toBe(subject.user.id);
    expect(second.status).toBe("draft"); // not yet the employee's turn
  });

  it("scopes each signer's fields to their own signer_index — neither sees or can be required to fill the other's fields", async () => {
    await seedEmploymentContractTemplate(hrUserId);
    const subject = await makeEmployeeUser({ employmentType: "staff" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Sign contract", kind: "contract_signing", is_blocking: true }],
    });
    const contract = await makeDraftContract(subject.employee.id);
    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });
    const task = await taskNamed(instance.id, "Sign contract");
    await reassignTask(task.id, { link_ref: { contract_id: contract.id } }, hrUserId);

    const hrRequests = await signing.listForSigner(hrUserId);
    const hrReq = hrRequests.find((r) => r.ref_id === contract.id)!;
    expect(hrReq.fields.map((f) => f.key)).toEqual(["hr_signature"]);

    const employeeRequests = await signing.listForSigner(subject.user.id);
    const employeeReq = employeeRequests.find((r) => r.ref_id === contract.id)!;
    expect(employeeReq.fields.map((f) => f.key)).toEqual(["employee_signature"]);

    // HR signing must not flip the employee's request nor write into the employee's own event.
    await signing.signInternal(hrReq.id, hrUserId, { hr_signature: "HR" });
    const afterHr = await signing.listByRef("contract", contract.id);
    expect(afterHr[0].status).toBe("signed");
    expect(afterHr[1].status).toBe("sent"); // still pending, independently, until the employee acts

    // Re-fetch: the employee's own fields are still scoped to just their field, now that it's
    // their turn (sequence_no advanced their request from draft to sent).
    const employeeRequestsAfter = await signing.listForSigner(subject.user.id);
    const employeeReqAfter = employeeRequestsAfter.find((r) => r.ref_id === contract.id)!;
    expect(employeeReqAfter.fields.map((f) => f.key)).toEqual(["employee_signature"]);
  });

  it("advances to the employee once HR signs, and stays gated until then", async () => {
    await seedEmploymentContractTemplate(hrUserId);
    const subject = await makeEmployeeUser({ employmentType: "staff" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Sign contract", kind: "contract_signing", is_blocking: true }],
    });
    const contract = await makeDraftContract(subject.employee.id);
    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });
    const task = await taskNamed(instance.id, "Sign contract");
    await reassignTask(task.id, { link_ref: { contract_id: contract.id } }, hrUserId);

    const [hrReq] = await signing.listByRef("contract", contract.id);

    // The employee can't sign yet — their request is still draft, not sent.
    await expect(
      signing.signInternal(
        (await signing.listByRef("contract", contract.id))[1].id,
        subject.user.id,
        {},
      ),
    ).rejects.toMatchObject({ statusCode: 409 });

    await signing.signInternal(hrReq.id, hrUserId, { hr_signature: "HR" });

    const afterHr = await signing.listByRef("contract", contract.id);
    expect(afterHr[0].status).toBe("signed");
    expect(afterHr[1].status).toBe("sent"); // now the employee's turn
  });

  it("the contract activates and the onboarding task completes only after BOTH signers finish", async () => {
    await seedEmploymentContractTemplate(hrUserId);
    const subject = await makeEmployeeUser({ employmentType: "staff" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Sign contract", kind: "contract_signing", is_blocking: true }],
    });
    const contract = await makeDraftContract(subject.employee.id);
    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });
    const task = await taskNamed(instance.id, "Sign contract");
    await reassignTask(task.id, { link_ref: { contract_id: contract.id } }, hrUserId);

    const [hrReq] = await signing.listByRef("contract", contract.id);
    await signing.signInternal(hrReq.id, hrUserId, { hr_signature: "HR" });

    // Only HR has signed — the contract must NOT be active yet, and the task must not complete.
    const [afterHrOnly] = await db
      .select()
      .from(hr_contracts)
      .where(eq(hr_contracts.id, contract.id));
    expect(afterHrOnly.status).toBe("DRAFT");
    await expect(completeTask(hrUserId, task.id)).rejects.toMatchObject({ statusCode: 422 });

    const employeeReq = (await signing.listByRef("contract", contract.id))[1];
    await signing.signInternal(employeeReq.id, subject.user.id, { employee_signature: "Employee" });

    // Both signed — the contract is active, and the (unmodified) contract_signing completion
    // check now passes on its own, reading contract.status the same way it always has.
    const [afterBoth] = await db
      .select()
      .from(hr_contracts)
      .where(eq(hr_contracts.id, contract.id));
    expect(afterBoth.status).toBe("ACTIVE");
    expect(afterBoth.employment_agreement_url).toBeTruthy();

    const done = await completeTask(hrUserId, task.id);
    expect(done.status).toBe("done");
  });
});
