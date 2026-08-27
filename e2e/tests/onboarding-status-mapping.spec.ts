import { test, expect, type BrowserContext } from "@playwright/test";
import { newAuthedContext, HR_URL } from "./support/auth";

/**
 * Things-to-work-on.md — "Onboarding table: status column stuck on 'In Progress'". The table used
 * to badge every in_progress instance identically, so a checklist nobody had touched yet looked
 * the same as one someone was actively working through, and switching the filter away from the
 * default (in_progress) was the only way to see a completed one at all. This walks one instance
 * through all three real states — Not Started -> Onboarding -> Completed — confirming the table
 * actually reaches Completed rather than getting stuck.
 *
 * Uses a dedicated template with two plain checklist tasks (no contract-signing/asset side
 * effects), so the whole journey is completable through plain "Done" clicks. createEmployee always
 * auto-instantiates onboarding against whichever employment-type-matching template has the lowest
 * id (process.service.ts::pickTemplate) — on a shared, non-reset dev DB that can be a leftover
 * template from an earlier run of this same spec (or employee-status-lifecycle.spec.ts, which uses
 * the same "intern" scoping), not the one just created here. Rather than assume a specific
 * template wins, this cancels whatever got auto-attached and starts a fresh instance explicitly
 * against this run's own template_id.
 */
async function csrfHeaders(context: BrowserContext): Promise<Record<string, string>> {
  const cookie = (await context.cookies()).find((c) => c.name === "ganzafrica_csrf");
  expect(cookie, "expected the CSRF cookie to have been issued by login").toBeTruthy();
  return { "X-CSRF-Token": cookie!.value };
}

test("onboarding table status column: Not Started -> Onboarding -> Completed as tasks resolve", async ({
  browser,
}) => {
  const context = await newAuthedContext(browser, "hr");
  const uniq = Date.now();
  const headers = await csrfHeaders(context);

  const templateRes = await context.request.post("/api/hr/process-templates", {
    headers,
    data: {
      type: "onboarding",
      name: `E2E status-mapping template ${uniq}`,
      employment_types: ["intern"],
    },
  });
  expect(templateRes.ok(), await templateRes.text()).toBeTruthy();
  const template = await templateRes.json();
  const templateId = template.template?.id ?? template.id;
  expect(templateId).toBeTruthy();

  for (const title of ["E2E Status Task One", "E2E Status Task Two"]) {
    const res = await context.request.post(`/api/hr/process-templates/${templateId}/tasks`, {
      headers,
      data: { title, kind: "checklist", is_blocking: true, default_assignee: "hr" },
    });
    expect(res.ok(), await res.text()).toBeTruthy();
  }

  const createRes = await context.request.post("/api/hr/employees", {
    headers,
    data: {
      first_name: "StatusMap",
      last_name: `Test${uniq}`,
      personal_email: `status-map.test.${uniq}@example.com`,
      employment_type: "intern",
    },
  });
  expect(createRes.ok(), await createRes.text()).toBeTruthy();
  const employee = (await createRes.json()).employee;

  // Cancel whatever template auto-attached (see file-level comment) and start a fresh instance
  // explicitly against this run's own template, so the task titles below are guaranteed to match.
  const autoRes = await context.request.get(
    `/api/hr/processes?employee_id=${employee.id}&type=onboarding`,
  );
  const autoProcesses = (await autoRes.json()).processes ?? (await autoRes.json());
  const autoInstanceId = Array.isArray(autoProcesses)
    ? autoProcesses[0]?.id
    : autoProcesses.data?.[0]?.id;
  expect(autoInstanceId).toBeTruthy();
  const cancelRes = await context.request.post(`/api/hr/processes/${autoInstanceId}/cancel`, {
    headers,
  });
  expect(cancelRes.ok(), await cancelRes.text()).toBeTruthy();

  const startRes = await context.request.post(`/api/hr/employees/${employee.id}/processes`, {
    headers,
    data: { type: "onboarding", template_id: templateId },
  });
  expect(startRes.ok(), await startRes.text()).toBeTruthy();
  const instanceId = (await startRes.json()).process?.id;
  expect(instanceId).toBeTruthy();

  const page = await context.newPage();

  // Not Started: instance exists, nobody's touched a task yet. Default table filter is
  // in_progress, so this row is visible without changing anything.
  await page.goto(`${HR_URL}/employees/onboarding`);
  await page.getByPlaceholder("Search employees…").fill(`StatusMap Test${uniq}`);
  const row = page.getByText(`StatusMap Test${uniq}`).locator("xpath=ancestor::tr");
  await expect(row).toBeVisible({ timeout: 15_000 });
  await expect(row.getByText("Not Started")).toBeVisible();

  // First task -> Onboarding (still in_progress, but progress > 0).
  await page.goto(`${HR_URL}/employees/onboarding/${instanceId}`);
  const taskOneCard = page
    .getByText("E2E Status Task One")
    .locator('xpath=ancestor::div[contains(@class, "rounded-lg")][1]');
  await taskOneCard.getByRole("button", { name: /^done$/i }).click();

  await page.goto(`${HR_URL}/employees/onboarding`);
  await page.getByPlaceholder("Search employees…").fill(`StatusMap Test${uniq}`);
  await expect(row.getByText("Onboarding")).toBeVisible({ timeout: 15_000 });

  // Last blocking task -> the instance itself flips to `completed` server-side
  // (maybeCompleteInstance in process.service.ts).
  await page.goto(`${HR_URL}/employees/onboarding/${instanceId}`);
  const taskTwoCard = page
    .getByText("E2E Status Task Two")
    .locator('xpath=ancestor::div[contains(@class, "rounded-lg")][1]');
  await taskTwoCard.getByRole("button", { name: /^done$/i }).click();

  // The table's own filter defaults to in_progress, which now excludes this row entirely — switch
  // to "All" to see it, and confirm it reads Completed rather than having vanished or stayed
  // "in progress".
  await page.goto(`${HR_URL}/employees/onboarding`);
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "All" }).click();
  await page.getByPlaceholder("Search employees…").fill(`StatusMap Test${uniq}`);
  await expect(row.getByText("Completed")).toBeVisible({ timeout: 15_000 });
});
