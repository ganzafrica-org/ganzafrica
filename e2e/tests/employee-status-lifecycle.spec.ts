import { test, expect, type BrowserContext } from "@playwright/test";
import { newAuthedContext, HR_URL } from "./support/auth";

/** Mutating API calls need the CSRF double-submit header (login itself is exempt, everything
 *  else isn't) — the frontend's axios interceptor does this automatically; a raw context.request
 *  call has to do it by hand. */
async function csrfHeaders(context: BrowserContext): Promise<Record<string, string>> {
  const cookie = (await context.cookies()).find((c) => c.name === "ganzafrica_csrf");
  expect(cookie, "expected the CSRF cookie to have been issued by login").toBeTruthy();
  return { "X-CSRF-Token": cookie!.value };
}

/**
 * "Work on the email notification..." (Things-to-work-on.md): create -> Pending, first onboarding
 * task action -> Onboarding, all required steps done -> Active, plus an EMPLOYEE_CREATED
 * notification visible in the existing notification bell.
 *
 * Uses a dedicated onboarding template scoped to employment_type "intern" with two simple
 * checklist tasks (no contract-signing/asset side effects) so the whole pending->onboarding
 * ->active journey is completable through plain "Done" clicks, set up via the real API first.
 */
test("employee status: Pending on create, Onboarding on first task action, Active on completion, with a creation notification", async ({
  browser,
}) => {
  const context = await newAuthedContext(browser, "hr");
  const uniq = Date.now();
  const headers = await csrfHeaders(context);

  const templateRes = await context.request.post("/api/hr/process-templates", {
    headers,
    data: {
      type: "onboarding",
      name: `E2E lifecycle template ${uniq}`,
      employment_types: ["intern"],
    },
  });
  expect(templateRes.ok(), await templateRes.text()).toBeTruthy();
  const template = await templateRes.json();
  const templateId = template.template?.id ?? template.id;
  expect(templateId).toBeTruthy();

  for (const title of ["E2E Task One", "E2E Task Two"]) {
    const res = await context.request.post(`/api/hr/process-templates/${templateId}/tasks`, {
      headers,
      data: { title, kind: "checklist", is_blocking: true, default_assignee: "hr" },
    });
    expect(res.ok(), await res.text()).toBeTruthy();
  }

  const createRes = await context.request.post("/api/hr/employees", {
    headers,
    data: {
      first_name: "Lifecycle",
      last_name: `Test${uniq}`,
      personal_email: `lifecycle.test.${uniq}@example.com`,
      employment_type: "intern",
    },
  });
  expect(createRes.ok(), await createRes.text()).toBeTruthy();
  const employee = (await createRes.json()).employee;
  expect(employee.status).toBe("pending");

  const page = await context.newPage();

  // Directory shows the new hire as Pending.
  await page.goto(`${HR_URL}/employees`);
  await page.getByPlaceholder("Search employees...").fill(`Test${uniq}`);
  const row = page.getByText(`Lifecycle Test${uniq}`).locator("xpath=ancestor::tr");
  await expect(row).toBeVisible({ timeout: 15_000 });
  await expect(row.getByText("Pending")).toBeVisible();

  // Creation notification reached HR (navbar's bell button has no accessible name — a lucide
  // Bell icon is its only content — so target it structurally).
  const bell = page.locator("button:has(svg.lucide-bell)").first();
  await bell.click();
  await expect(page.getByText(/new employee added/i).first()).toBeVisible({ timeout: 10_000 });
  await page.keyboard.press("Escape");

  // Find the onboarding instance for this employee and go straight to its checklist.
  const processesRes = await context.request.get(
    `/api/hr/processes?employee_id=${employee.id}&type=onboarding`,
  );
  const processes = (await processesRes.json()).processes ?? (await processesRes.json());
  const instanceId = Array.isArray(processes) ? processes[0]?.id : processes.data?.[0]?.id;
  expect(instanceId).toBeTruthy();

  await page.goto(`${HR_URL}/employees/onboarding/${instanceId}`);
  await expect(page.getByText("E2E Task One")).toBeVisible({ timeout: 15_000 });

  // First task action: Pending -> Onboarding. Walk up to the task-row container (the div with
  // the distinctive "rounded-lg border p-4" classes — see task-row.tsx) so the query reaches the
  // sibling action buttons, not just the inner text wrapper.
  const taskOneCard = page
    .getByText("E2E Task One")
    .locator('xpath=ancestor::div[contains(@class, "rounded-lg")][1]');
  await taskOneCard.getByRole("button", { name: /^done$/i }).click();

  await page.goto(`${HR_URL}/employees`);
  await page.getByPlaceholder("Search employees...").fill(`Test${uniq}`);
  await expect(row.getByText("Onboarding")).toBeVisible({ timeout: 15_000 });

  // Second (last) task: Onboarding -> Active.
  await page.goto(`${HR_URL}/employees/onboarding/${instanceId}`);
  const taskTwoCard = page
    .getByText("E2E Task Two")
    .locator('xpath=ancestor::div[contains(@class, "rounded-lg")][1]');
  await taskTwoCard.getByRole("button", { name: /^done$/i }).click();

  await page.goto(`${HR_URL}/employees`);
  await page.getByPlaceholder("Search employees...").fill(`Test${uniq}`);
  await expect(row.getByText("Active")).toBeVisible({ timeout: 15_000 });
});
