import { test, expect } from "@playwright/test";
import { openAsRole } from "./support/auth";

/**
 * "Update the HR landing page to display valid data from backend" (Things-to-work-on.md).
 * The dev DB's exact numbers aren't deterministic (seeded/exercised by a whole night of other
 * e2e specs), so this doesn't assert specific counts — it asserts the page is built from real,
 * live data rather than the old hardcoded mock content, and that the explicitly-out-of-scope
 * System Alerts card is still present, untouched.
 */
test("HR landing page shows real backend-driven sections, not the old hardcoded mock content", async ({
  browser,
}) => {
  const { page } = await openAsRole(browser, "hr", "/");

  // headerStats: a real "Alerts" placeholder tile (per the source doc), no old mock label.
  await expect(page.getByText("Alerts", { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Total Employees")).toBeVisible();

  // Employee Status circles: same bubble UI, relabeled to the real lifecycle statuses.
  await expect(page.getByText("Employee Status")).toBeVisible();
  await expect(page.getByText("Onboarding").first()).toBeVisible();
  // The old (wrong) legend labels must be gone.
  await expect(page.getByText("Permanent")).toHaveCount(0);
  await expect(page.getByText("Internship")).toHaveCount(0);

  // Leave summary: real tile labels, not the old static "34 Days"/"78 Days".
  await expect(page.getByText("Leave summary")).toBeVisible();
  await expect(page.getByText("Pending requests")).toBeVisible();
  await expect(page.getByText("On leave today")).toBeVisible();

  // Ongoing onboarding: new real card, present on the page.
  await expect(page.getByText("Ongoing onboarding")).toBeVisible();

  // Applicants summary: real hire-rate framing, not the old static "78.19%"/"Jan, 2022".
  await expect(page.getByText("Applicants Summary")).toBeVisible();
  await expect(page.getByText("Hire rate, all time")).toBeVisible();
  await expect(page.getByText("Jan, 2022")).toHaveCount(0);

  // Schedule: real calendar + away-today list, no mock meetings. "Away today" labels both
  // ScheduleCard's own heading and LeaveSummaryCard's badge — assert at least one is visible.
  await expect(page.getByText("Schedule")).toBeVisible();
  await expect(page.getByText("Away today").first()).toBeVisible();
  await expect(page.getByText("Meeting with Clients")).toHaveCount(0);
  await expect(page.getByText("Book Discussion")).toHaveCount(0);

  // System Alerts: explicitly out of scope tonight — still present, untouched.
  await expect(page.getByText("System Alerts")).toBeVisible();
});
