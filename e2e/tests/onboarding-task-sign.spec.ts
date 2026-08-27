import { test, expect } from "@playwright/test";
import { openAsRole, HR_URL } from "./support/auth";

/**
 * Coverage for "Add an indicator to show whether a document requires a signature" / view-before-
 * sign / wire the sign action (Things-to-work-on.md, my-status.png — the onboarding task checklist's
 * "Sign employment contract" card). Builds its own fresh employee + contract + signing sequence
 * each run (rather than relying on persistent dev data) so the test is deterministic and
 * repeatable: HR creates an employee (auto-instantiates onboarding with a contract_signing task),
 * creates a DRAFT contract, links it to the task — which starts the HR-then-employee sequential
 * signing flow with HR (the actor who linked it) as signer 1. That makes it HR's own turn to
 * sign, so the whole flow — indicator, view-before-sign, and the actual sign action — is
 * exercised from a single already-seeded identity (hr@test.local), no second test account needed.
 */

test("onboarding task: view the linked contract read-only, then sign it, from the checklist row", async ({
  browser,
}) => {
  const { context, page } = await openAsRole(browser, "hr");
  const api = context.request;

  // context.request shares the browser context's cookie jar (so the session cookie rides along
  // automatically), but it doesn't run the app's own axios interceptor that copies the
  // ganzafrica_csrf cookie into an X-CSRF-Token header on mutating requests — do that by hand.
  // The csrf cookie itself is only set on a response, not by login — issue a GET first.
  await api.get("/api/hr/employees?limit=1");
  const csrfCookie = (await context.cookies()).find((c) => c.name === "ganzafrica_csrf");
  const csrfHeaders = csrfCookie ? { "X-CSRF-Token": csrfCookie.value } : {};

  const stamp = Date.now();
  const createEmp = await api.post("/api/hr/employees", {
    headers: csrfHeaders,
    data: {
      first_name: "E2E",
      last_name: `TaskSign${stamp}`,
      personal_email: `e2e-task-sign-${stamp}@test.local`,
      employment_type: "staff",
    },
  });
  expect(createEmp.ok(), await createEmp.text()).toBeTruthy();
  const employee = (await createEmp.json()).employee;

  const listProc = await api.get(`/api/hr/processes?employee_id=${employee.id}&type=onboarding`);
  expect(listProc.ok(), await listProc.text()).toBeTruthy();
  const instanceSummary = (await listProc.json()).processes[0];
  expect(instanceSummary).toBeTruthy();

  const detail = await api.get(`/api/hr/processes/${instanceSummary.id}`);
  expect(detail.ok()).toBeTruthy();
  const tasks = (await detail.json()).tasks as { id: number; kind: string }[];
  const signTask = tasks.find((t) => t.kind === "contract_signing");
  expect(
    signTask,
    "expected a contract_signing task on the default onboarding template",
  ).toBeTruthy();

  const createContract = await api.post(`/api/hr/employees/${employee.id}/contracts`, {
    headers: csrfHeaders,
    data: {
      jobTitle: "E2E Test Role",
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

  // --- UI from here: the onboarding checklist row for this employee, as HR ---
  // This employee's checklist has exactly one contract_signing task, so scoping to the whole
  // page (rather than a brittle DOM-ancestor lookup) is unambiguous.
  await page.goto(`${HR_URL}/employees/onboarding/${instanceSummary.id}`);

  await expect(page.getByText("Sign employment contract")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/waiting on/i)).toBeVisible();

  // View before signing: read-only contract preview, no edit affordance.
  await page.getByRole("button", { name: /^view$/i }).click();
  await expect(page.getByText("Contract details")).toBeVisible();
  await expect(page.getByText("E2E Test Role")).toBeVisible();
  await expect(page.getByRole("button", { name: /edit contract/i })).not.toBeVisible();
  // ReusableSheet's close button is icon-only (no accessible name) — target it by its icon class.
  await page.locator("button:has(svg.lucide-x)").first().click();
  await expect(page.getByText("Contract details")).not.toBeVisible();

  // Sign: HR is signer sequence 1 (the actor who linked the contract), so it's their turn.
  const signButton = page.getByRole("button", { name: /^sign$/i });
  await expect(signButton).toBeVisible({ timeout: 10_000 });
  await signButton.click();

  await expect(page.getByText(/complete the fields below/i)).toBeVisible();
  // The document preview loads before the fields — the dev-seeded "Employment Contract" template
  // has no attached file, so this asserts the no-file fallback rather than an iframe, but it still
  // proves the preview fetch/render path is wired into the sign dialog.
  await expect(page.getByText(/no document file is attached to this template/i)).toBeVisible({
    timeout: 10_000,
  });
  // The template's full field set travels with every signer's request (see
  // task-sign-dialog.tsx/signing/page.tsx's SignDialog) — required means required to submit,
  // regardless of whose name is on the field, so fill every required text/date input present.
  const today = new Date().toISOString().slice(0, 10);
  for (const input of await page.locator('input[type="date"]').all()) {
    await input.fill(today);
  }
  for (const input of await page.getByPlaceholder(/type your full name to sign/i).all()) {
    await input.fill("Hana HR");
  }
  await page.getByText(/legally binding/i).click();
  await page.getByRole("button", { name: /^sign document$/i }).click();

  // Dialog closes and the row's status pill reflects HR's turn is done (now waiting on the
  // employee, or fully executed if this template only has one signer left).
  await expect(page.getByText(/complete the fields below/i)).not.toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/waiting on|fully executed/i)).toBeVisible();
  // HR's own Sign button for this contract is gone now that their turn is complete.
  await expect(page.getByRole("button", { name: /^sign$/i })).not.toBeVisible();
});
