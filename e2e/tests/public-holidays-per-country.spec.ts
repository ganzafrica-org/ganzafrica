import { test, expect } from "@playwright/test";
import { openAsRole, HR_URL } from "./support/auth";

/**
 * Punch-list #7 — Public Holidays goes from a single flat/hardcoded list to the union of every
 * represented country's holidays. This deliberately changes behavior that an earlier session was
 * explicitly told not to touch ("confirmed already displaying correctly to both roles" — see that
 * session's notes) — that earlier note was about the *old*, single-list requirement being met; this
 * is a new requirement layered on top of it, not a reversal of that earlier, correct work.
 *
 * Seeds employees in two different home_country values with a holiday tagged to each, plus one
 * universal holiday, then confirms the Leave Calendar tab's Public Holidays section shows all three
 * groups (not just the org's original single country).
 */
test("Public Holidays shows the union of every represented country's holidays", async ({
  browser,
}) => {
  const { context, page } = await openAsRole(browser, "hr");
  const api = context.request;

  await api.get("/api/hr/employees?limit=1");
  const csrfCookie = (await context.cookies()).find((c) => c.name === "ganzafrica_csrf");
  const csrfHeaders = csrfCookie ? { "X-CSRF-Token": csrfCookie.value } : {};

  const stamp = Date.now();
  const country1 = `E2ELandA${stamp}`;
  const country2 = `E2ELandB${stamp}`;

  const emp1 = await api.post("/api/hr/employees", {
    headers: csrfHeaders,
    data: {
      first_name: "E2E",
      last_name: `Holiday1${stamp}`,
      personal_email: `e2e-holiday-1-${stamp}@test.local`,
      employment_type: "staff",
      home_country: country1,
    },
  });
  expect(emp1.ok(), await emp1.text()).toBeTruthy();

  const emp2 = await api.post("/api/hr/employees", {
    headers: csrfHeaders,
    data: {
      first_name: "E2E",
      last_name: `Holiday2${stamp}`,
      personal_email: `e2e-holiday-2-${stamp}@test.local`,
      employment_type: "staff",
      home_country: country2,
    },
  });
  expect(emp2.ok(), await emp2.text()).toBeTruthy();

  const holiday1 = await api.post("/api/hr/holidays", {
    headers: csrfHeaders,
    data: { date: "2031-06-15", name: `${country1} Founding Day`, country: country1 },
  });
  expect(holiday1.ok(), await holiday1.text()).toBeTruthy();

  const holiday2 = await api.post("/api/hr/holidays", {
    headers: csrfHeaders,
    data: { date: "2031-09-20", name: `${country2} Founding Day`, country: country2 },
  });
  expect(holiday2.ok(), await holiday2.text()).toBeTruthy();

  await page.goto(`${HR_URL}/leave`);
  await page.getByRole("tab", { name: "Leave Calendar" }).click();

  await expect(page.getByText(`${country1} public holidays`)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(`${country2} public holidays`)).toBeVisible();
});
