import { test, expect } from "@playwright/test";
import { openAsRole } from "./support/auth";

/**
 * Regression coverage for the "Leave Requests" table on /employees/time-off.
 *
 * Before this fix, that table called `GET /hr/leaves` — an HR-only route gated on
 * `leave:manage` — so any non-HR viewer got a 403 and the page fell into its "Failed to load
 * data" error state instead of showing their own (and their reports') leave. It also never
 * rendered hardcoded/mock rows on this particular page, but the same table pattern elsewhere in
 * the app (`components/time-off-module.tsx`) does still hardcode sample rows — that component
 * isn't mounted anywhere in the app today, so it is out of scope here (see task report), but this
 * spec double-checks none of its sample names leak onto the real page.
 *
 * The fix: a new role-scoped `GET /hr/leave/requests` endpoint
 * (`listVisibleLeaves` in leave-core.service.ts) that returns the caller's own leave requests
 * plus their reports' for a regular employee, or every request org-wide for HR/admin.
 */

const DUMMY_NAMES = [
  "Jean Baptiste Mukamana",
  "Marie Claire Nsengimana",
  "David Niyonkuru",
  "Grace Mukamana",
  "Bagus Fikri",
  "Ihdizein",
  "Mufti Hidayat",
  "Fauzan Ardiansyah",
  "Raihan Fikri",
];

/** Next Monday at least `minDaysOut` days from now, paired with the following Tuesday. */
function nextWeekday(minDaysOut: number): { start: string; end: string } {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() + minDaysOut);
  while (start.getUTCDay() !== 1) start.setUTCDate(start.getUTCDate() + 1); // roll to Monday
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1); // Tuesday
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end) };
}

test("employee sees only their own + their reports' leave requests, not a 403/error state", async ({
  browser,
}) => {
  const { context, page } = await openAsRole(browser, "employee", "/employees/time-off");

  // Create a uniquely identifiable request through the same API the app's request dialog uses,
  // so this assertion doesn't depend on whatever leave history already exists in the dev DB.
  // Type OTHER is never balance-tracked, so this can't fail on an unseeded/exhausted policy.
  //
  // POST is behind the double-submit CSRF check (csrf.middleware.ts): a prior request has already
  // made the middleware issue the readable `ganzafrica_csrf` cookie (login itself is CSRF-exempt,
  // but the app always GETs something first), so read it back and echo it as the header.
  const csrfCookie = (await context.cookies()).find((c) => c.name === "ganzafrica_csrf");
  expect(csrfCookie, "expected the CSRF cookie to have been issued by now").toBeTruthy();

  const unique = `E2E leave table check ${Date.now()}`;
  const { start, end } = nextWeekday(60 + (Date.now() % 200));
  const created = await context.request.post("/api/hr/me/leave", {
    data: { type: "OTHER", startDate: start, endDate: end, reason: unique },
    headers: { "X-CSRF-Token": csrfCookie!.value },
  });
  expect(created.ok(), await created.text()).toBeTruthy();

  await page.reload();
  await page.getByRole("tab", { name: "Leave Requests" }).click();

  // The old bug: this call 403'd for a non-HR viewer and the page showed this exact message.
  await expect(page.getByText("Failed to load data. Please try again.")).not.toBeVisible();

  const ownRow = page.getByRole("row", { name: /Eli Employee/ });
  await expect(ownRow.first()).toBeVisible();
  await expect(ownRow.first().getByText("Pending")).toBeVisible();

  for (const name of DUMMY_NAMES) {
    await expect(page.getByText(name, { exact: true })).toHaveCount(0);
  }

  await context.close();
});

test("HR sees every employee's leave requests, including the one from the employee test above", async ({
  browser,
}) => {
  const { context, page } = await openAsRole(browser, "hr", "/employees/time-off");

  await page.getByRole("tab", { name: "Leave Requests" }).click();

  await expect(page.getByText("Failed to load data. Please try again.")).not.toBeVisible();

  // HR's own view is a superset of the employee view: both their own leave and Eli's should
  // be visible on the same table, proving this isn't scoped down to "just me" for HR.
  await expect(page.getByRole("row", { name: /Hana HR/ }).first()).toBeVisible();
  await expect(page.getByRole("row", { name: /Eli Employee/ }).first()).toBeVisible();

  for (const name of DUMMY_NAMES) {
    await expect(page.getByText(name, { exact: true })).toHaveCount(0);
  }

  await context.close();
});
