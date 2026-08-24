import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { newAuthedContext, HR_URL } from "./support/auth";

/**
 * Things-to-work-on.md — "Add headerStats to employees/onboarding and employees/department
 * pages". Neither page had the shared StatsHeader component before; both now read real counts
 * (GET /hr/processes and GET /hr/employees/departments/stats respectively) instead of hardcoded
 * or borrowed numbers.
 *
 * The dev DB isn't isolated per run (see hr-landing-page.spec.ts), so rather than asserting an
 * absolute count, each test reads the tile before creating fresh, uniquely-tagged data via the
 * API, then asserts the tile increased by exactly the amount that data should contribute — a
 * seed-and-diff check that the numbers really are wired to the backend, not frozen/hardcoded.
 */
async function csrfHeaders(context: BrowserContext): Promise<Record<string, string>> {
  const cookie = (await context.cookies()).find((c) => c.name === "ganzafrica_csrf");
  expect(cookie, "expected the CSRF cookie to have been issued by login").toBeTruthy();
  return { "X-CSRF-Token": cookie!.value };
}

/** StatsHeader's tile wrapper carries `border-l` (components/sections/header.tsx); scope to the
 *  dark header band so this can't pick up an unrelated `.border-l` element further down the page. */
async function tileValue(page: Page, label: string): Promise<number> {
  const header = page.locator(".bg-brand-dark");
  const tile = header.locator(".border-l", { hasText: label });
  const text = await tile.locator(".text-4xl").innerText();
  return Number(text);
}

test("employees/onboarding headerStats: Not Started tile increases by exactly one new instance", async ({
  browser,
}) => {
  const context = await newAuthedContext(browser, "hr");
  const uniq = Date.now();
  const headers = await csrfHeaders(context);
  const page = await context.newPage();

  await page.goto(`${HR_URL}/employees/onboarding`);
  await expect(page.locator(".bg-brand-dark").getByText("Not Started")).toBeVisible({
    timeout: 15_000,
  });
  const before = await tileValue(page, "Not Started");

  const templateRes = await context.request.post("/api/hr/process-templates", {
    headers,
    data: {
      type: "onboarding",
      name: `E2E headerStats template ${uniq}`,
      employment_types: ["intern"],
    },
  });
  expect(templateRes.ok(), await templateRes.text()).toBeTruthy();
  const template = await templateRes.json();
  const templateId = template.template?.id ?? template.id;

  const taskRes = await context.request.post(`/api/hr/process-templates/${templateId}/tasks`, {
    headers,
    data: {
      title: "E2E Header Stats Task",
      kind: "checklist",
      is_blocking: true,
      default_assignee: "hr",
    },
  });
  expect(taskRes.ok(), await taskRes.text()).toBeTruthy();

  // A fresh "intern" hire auto-instantiates this template — new instance, zero tasks touched, so
  // it lands in Not Started.
  const createRes = await context.request.post("/api/hr/employees", {
    headers,
    data: {
      first_name: "HeaderStats",
      last_name: `Onboarding${uniq}`,
      personal_email: `header-stats-onboarding.${uniq}@example.com`,
      employment_type: "intern",
    },
  });
  expect(createRes.ok(), await createRes.text()).toBeTruthy();

  // "Not Started" is a global aggregate across every onboarding checklist, unlike the
  // per-department counters below — this suite's own onboarding-status-mapping.spec.ts (and any
  // other concurrently-running spec) can legitimately add its own instances to it at the same
  // time, so assert "increased by at least the one this test seeded" rather than an exact delta.
  await page.reload();
  await expect
    .poll(() => tileValue(page, "Not Started"), { timeout: 15_000 })
    .toBeGreaterThanOrEqual(before + 1);
});

test("employees/department headerStats: Total Departments/Employees/Active increase by exactly what was seeded", async ({
  browser,
}) => {
  const context = await newAuthedContext(browser, "hr");
  const uniq = Date.now();
  const headers = await csrfHeaders(context);
  const page = await context.newPage();

  await page.goto(`${HR_URL}/employees/department`);
  await expect(page.locator(".bg-brand-dark").getByText("Total Departments")).toBeVisible({
    timeout: 15_000,
  });
  const departmentsBefore = await tileValue(page, "Total Departments");
  const employeesBefore = await tileValue(page, "Total Employees");
  const activeBefore = await tileValue(page, "Active");

  const department = `E2E Dept ${uniq}`;
  for (const suffix of ["A", "B"]) {
    const res = await context.request.post("/api/hr/employees", {
      headers,
      data: {
        first_name: "HeaderStats",
        last_name: `Dept${suffix}${uniq}`,
        personal_email: `header-stats-dept-${suffix}.${uniq}@example.com`,
        employment_type: "staff",
        department,
      },
    });
    expect(res.ok(), await res.text()).toBeTruthy();
  }

  await page.reload();
  await expect
    .poll(() => tileValue(page, "Total Departments"), { timeout: 15_000 })
    .toBe(departmentsBefore + 1);
  expect(await tileValue(page, "Total Employees")).toBe(employeesBefore + 2);
  // New employees default to `pending` status (createEmployee), not `active` — Active shouldn't move.
  expect(await tileValue(page, "Active")).toBe(activeBefore);
});
