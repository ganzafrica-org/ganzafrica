import { test, expect } from "@playwright/test";
import { openAsRole, HR_URL } from "./support/auth";

/**
 * Punch-list #6 — the Leave Calendar tab's calendar grid was still on mock data (an earlier "1B"
 * task wired only the Leave Requests table, not this calendar). Now backed by GET
 * /hr/leave/calendar (all statuses, with the employee's picture/name joined in), and each leave
 * entry renders the owner's avatar/initials plus a green background once approved —
 * pending/rejected keep the existing status-badge color convention.
 */
test("Leave Calendar: an approved leave shows the owner's initials and a green background; a pending one shows initials without green", async ({
  browser,
}) => {
  const { context, page } = await openAsRole(browser, "hr");
  const api = context.request;

  await api.get("/api/hr/employees?limit=1");
  const csrfCookie = (await context.cookies()).find((c) => c.name === "ganzafrica_csrf");
  const csrfHeaders = csrfCookie ? { "X-CSRF-Token": csrfCookie.value } : {};

  const stamp = Date.now();

  const approvedEmp = await api.post("/api/hr/employees", {
    headers: csrfHeaders,
    data: {
      first_name: "E2E",
      last_name: `CalApproved${stamp}`,
      personal_email: `e2e-cal-approved-${stamp}@test.local`,
      employment_type: "staff",
    },
  });
  expect(approvedEmp.ok(), await approvedEmp.text()).toBeTruthy();
  const approvedEmployee = (await approvedEmp.json()).employee;

  const pendingEmp = await api.post("/api/hr/employees", {
    headers: csrfHeaders,
    data: {
      first_name: "E2E",
      last_name: `CalPending${stamp}`,
      personal_email: `e2e-cal-pending-${stamp}@test.local`,
      employment_type: "staff",
    },
  });
  expect(pendingEmp.ok(), await pendingEmp.text()).toBeTruthy();
  const pendingEmployee = (await pendingEmp.json()).employee;

  // Dates inside the current month, so FullCalendar's default view shows them without navigation.
  const approvedLeave = await api.post(`/api/hr/employees/${approvedEmployee.id}/leave`, {
    headers: csrfHeaders,
    data: { type: "UNPAID", startDate: "2026-08-25", endDate: "2026-08-26", reason: "e2e" },
  });
  expect(approvedLeave.ok(), await approvedLeave.text()).toBeTruthy();
  const approvedLeaveId = (await approvedLeave.json()).leave.id;
  const approveRes = await api.post(`/api/hr/leave/${approvedLeaveId}/approve`, {
    headers: csrfHeaders,
    data: {},
  });
  expect(approveRes.ok(), await approveRes.text()).toBeTruthy();

  // Different dates than the approved leave — FullCalendar's dayMaxEvents collapses a crowded
  // day cell behind a "+more" link, which would hide this event rather than testing anything.
  const pendingLeave = await api.post(`/api/hr/employees/${pendingEmployee.id}/leave`, {
    headers: csrfHeaders,
    data: { type: "UNPAID", startDate: "2026-08-18", endDate: "2026-08-19", reason: "e2e" },
  });
  expect(pendingLeave.ok(), await pendingLeave.text()).toBeTruthy();

  await page.goto(`${HR_URL}/leave`);
  await page.getByRole("tab", { name: "Leave Calendar" }).click();

  // The month grid truncates a crowded day behind a "+more" link once other e2e runs' leftover
  // fixtures pile onto the same calendar days — switch to the list view, which doesn't truncate.
  await page.getByRole("button", { name: /list/i }).click();

  const approvedName = `E2E CalApproved${stamp}`;
  const pendingName = `E2E CalPending${stamp}`;

  const approvedTitle = await page.getByText(approvedName).first();
  await expect(approvedTitle).toBeVisible({ timeout: 15_000 });
  const approvedChip = approvedTitle.locator(
    "xpath=ancestor::div[contains(@class,'rounded-lg')][1]",
  );
  await expect(approvedChip).toHaveClass(/bg-green-100/);
  // Initials fallback (this test employee has no uploaded picture).
  await expect(approvedChip.getByText("EC")).toBeVisible();

  const pendingTitle = await page.getByText(pendingName).first();
  await expect(pendingTitle).toBeVisible();
  const pendingChip = pendingTitle.locator("xpath=ancestor::div[contains(@class,'rounded-lg')][1]");
  await expect(pendingChip).not.toHaveClass(/bg-green-100/);
  await expect(pendingChip.getByText("EC")).toBeVisible();
});
