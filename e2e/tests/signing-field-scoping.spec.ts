import { test, expect } from "@playwright/test";
import { openAsRole, HR_URL } from "./support/auth";

/**
 * Punch-list #3 — one party's signature was appearing to complete the other party's too. Root
 * cause (see signing.service.ts): listForSigner/viewByToken returned every template field to every
 * signer, unfiltered by signature_template_fields.signer_index, so HR's sign dialog rendered and
 * REQUIRED the employee's field(s) too (and vice versa) in one form. Fixed by scoping fields to the
 * caller's own signer_index (fieldsForSigner).
 *
 * Same fixture setup as onboarding-task-sign.spec.ts: HR creates a fresh employee (auto-instantiates
 * onboarding with a contract_signing task), a DRAFT contract, links it to the task — starting the
 * two-signer sequence with HR as signer 1. This spec then opens the "Documents to Sign" page as HR
 * and asserts the sign dialog shows ONLY HR's own field, not the employee's.
 */
test("Documents to Sign: HR's sign dialog shows only HR's own field, not the employee's", async ({
  browser,
}) => {
  const { context, page } = await openAsRole(browser, "hr");
  const api = context.request;

  await api.get("/api/hr/employees?limit=1");
  const csrfCookie = (await context.cookies()).find((c) => c.name === "ganzafrica_csrf");
  const csrfHeaders = csrfCookie ? { "X-CSRF-Token": csrfCookie.value } : {};

  const stamp = Date.now();
  const createEmp = await api.post("/api/hr/employees", {
    headers: csrfHeaders,
    data: {
      first_name: "E2E",
      last_name: `SignScope${stamp}`,
      personal_email: `e2e-sign-scope-${stamp}@test.local`,
      employment_type: "staff",
    },
  });
  expect(createEmp.ok(), await createEmp.text()).toBeTruthy();
  const employee = (await createEmp.json()).employee;

  const listProc = await api.get(`/api/hr/processes?employee_id=${employee.id}&type=onboarding`);
  const instanceSummary = (await listProc.json()).processes[0];
  const detail = await api.get(`/api/hr/processes/${instanceSummary.id}`);
  const tasks = (await detail.json()).tasks as { id: number; kind: string }[];
  const signTask = tasks.find((t) => t.kind === "contract_signing");
  expect(signTask).toBeTruthy();

  const createContract = await api.post(`/api/hr/employees/${employee.id}/contracts`, {
    headers: csrfHeaders,
    data: {
      jobTitle: "E2E Sign Scope Role",
      startDate: new Date().toISOString(),
      employmentTerm: "indefinite",
      employmentType: "full-time",
      compensationType: "salaried",
      currency: "RWF",
      status: "DRAFT",
    },
  });
  expect(createContract.ok(), await createContract.text()).toBeTruthy();
  const contract = await createContract.json();

  const linkTask = await api.patch(`/api/hr/process-tasks/${signTask!.id}`, {
    headers: csrfHeaders,
    data: { link_ref: { contract_id: contract.id } },
  });
  expect(linkTask.ok(), await linkTask.text()).toBeTruthy();

  // HR is signer 1 (sent immediately); the employee's request is still draft, not yet their turn.
  await page.goto(`${HR_URL}/signing`);
  const row = page
    .getByText(`Employment contract — E2E SignScope${stamp}`)
    .locator("xpath=ancestor::div[contains(@class,'py-4')][1]");
  await expect(row).toBeVisible({ timeout: 15_000 });
  await row.getByRole("button", { name: /review & sign/i }).click();

  await expect(page.getByRole("dialog")).toBeVisible();
  // Only HR's own field(s) are present and required — never the employee's. This is the exact
  // symptom the bug produced: the seeded template's dev DB rows are HR Representative
  // Signature/HR Sign Date (signer_index 0) and Employee Signature/Employee Sign Date
  // (signer_index 1) — before the fix, both pairs showed up in whichever signer's dialog opened
  // first.
  await expect(page.getByLabel(/hr representative signature/i)).toBeVisible();
  await expect(page.getByLabel(/employee signature/i)).toHaveCount(0);
  await expect(page.getByLabel(/employee sign date/i)).toHaveCount(0);
});
