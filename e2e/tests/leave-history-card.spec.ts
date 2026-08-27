import { test, expect } from "@playwright/test";
import { openAsRole, HR_URL } from "./support/auth";

/**
 * Punch-list #8 — the HR home page's new leave history card (additional to the existing
 * LeaveSummaryCard, not a replacement) shows APPROVED-leave totals for week/month/year, updating
 * when the filter switches. Seeds one leave inside the current ISO week and one inside the
 * current month but a different week, then confirms Week and Month show different totals and
 * Week's total is a subset of Month's.
 *
 * Uses deltas against a fetched baseline rather than exact counts — this is a shared, cumulative
 * dev DB other e2e specs also write leave into, so an absolute assertion would be flaky.
 */
test("HR home: leave history card totals update when switching the week/month filter", async ({
  browser,
}) => {
  const { context, page } = await openAsRole(browser, "hr");
  const api = context.request;

  await api.get("/api/hr/employees?limit=1");
  const csrfCookie = (await context.cookies()).find((c) => c.name === "ganzafrica_csrf");
  const csrfHeaders = csrfCookie ? { "X-CSRF-Token": csrfCookie.value } : {};

  async function summary(window: "week" | "month") {
    const res = await api.get(`/api/hr/leave/summary?window=${window}`);
    expect(res.ok(), await res.text()).toBeTruthy();
    return res.json() as Promise<{ requestCount: number; totalDays: number }>;
  }

  const weekBefore = await summary("week");
  const monthBefore = await summary("month");

  const stamp = Date.now();
  async function fileApprovedLeave(lastName: string, startDate: string, endDate: string) {
    const created = await api.post("/api/hr/employees", {
      headers: csrfHeaders,
      data: {
        first_name: "E2E",
        last_name: lastName,
        personal_email: `e2e-history-${lastName}-${stamp}@test.local`.toLowerCase(),
        employment_type: "staff",
      },
    });
    expect(created.ok(), await created.text()).toBeTruthy();
    const employee = (await created.json()).employee;

    const req = await api.post(`/api/hr/employees/${employee.id}/leave`, {
      headers: csrfHeaders,
      data: { type: "UNPAID", startDate, endDate, reason: "e2e leave history" },
    });
    expect(req.ok(), await req.text()).toBeTruthy();
    const leave = (await req.json()).leave;

    const approve = await api.post(`/api/hr/leave/${leave.id}/approve`, {
      headers: csrfHeaders,
      data: {},
    });
    expect(approve.ok(), await approve.text()).toBeTruthy();
  }

  // Inside the current ISO week (Mon-Sun) AND the current month — 2 working days.
  await fileApprovedLeave(`ThisWeek${stamp}`, "2026-08-17", "2026-08-18");
  // Inside the current month, but a different week — 2 more working days, so it only shows up
  // once Month is selected, not Week.
  await fileApprovedLeave(`EarlierMonth${stamp}`, "2026-08-04", "2026-08-05");

  const weekAfter = await summary("week");
  const monthAfter = await summary("month");

  expect(weekAfter.requestCount - weekBefore.requestCount).toBe(1);
  expect(weekAfter.totalDays - weekBefore.totalDays).toBe(2);
  expect(monthAfter.requestCount - monthBefore.requestCount).toBe(2);
  expect(monthAfter.totalDays - monthBefore.totalDays).toBe(4);

  await page.goto(`${HR_URL}/`);
  const card = page
    .getByText("Leave history")
    .locator("xpath=ancestor::div[contains(@class,'shadow-sm')][1]");
  await expect(card).toBeVisible({ timeout: 15_000 });

  // Default window is Month — request count includes both seeded leaves.
  await expect(card.getByText(String(monthAfter.requestCount))).toBeVisible();

  await card.getByRole("button", { name: "Week" }).click();
  await expect(card.getByText(String(weekAfter.requestCount))).toBeVisible();
  await expect(card.getByText(String(weekAfter.totalDays))).toBeVisible();
});
