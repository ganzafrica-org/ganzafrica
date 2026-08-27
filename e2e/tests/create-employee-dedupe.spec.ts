import { test, expect } from "@playwright/test";
import { openAsRole } from "./support/auth";

/**
 * "On the Personal Details page, some duplicated information should be removed when adding a
 * personal profile" (Things-to-work-on.md, img_3.png/img_4.png). Step 2's Job Title, Department,
 * and Start Date should already be filled in from step 1 by the time HR gets there.
 */
test("Create Employee wizard: step 2 arrives pre-filled with step 1's job title/department/start date", async ({
  browser,
}) => {
  const { page } = await openAsRole(browser, "hr", "/employees");

  await page.getByRole("button", { name: /add employee/i }).click();

  // AddEmployeeSheet's ReusableSheet is a plain positioned <div> (no ARIA dialog role), so this
  // asserts against the page directly rather than a role="dialog" scope. The step title repeats
  // in the sidebar stepper (h3) and the step content heading (h2) — scope to the h2.
  await expect(page.getByRole("heading", { name: "Profile & Type", level: 2 })).toBeVisible();

  // AddEmployeeSheet isn't portal-rendered, so the directory's own "Search employees..." textbox
  // (earlier in DOM order, on the page underneath) is index 0 — offset every index below by 1.
  const textboxes = page.getByRole("textbox");
  await textboxes.nth(1).fill("Dedupe");
  await textboxes.nth(2).fill(`E2E-${Date.now()}`);
  await textboxes.nth(3).fill(`dedupe.${Date.now()}@example.com`);
  await textboxes.nth(6).fill("Platform Engineer");
  await textboxes.nth(7).fill("Engineering");

  await page.locator('input[type="date"]').fill("2026-05-01");

  await page.getByRole("button", { name: /^next$/i }).click();
  await expect(page.getByText(/^Contract$/)).toBeVisible();

  // Reveal the contract fields.
  await page.getByRole("switch").click();

  await expect(page.getByPlaceholder("e.g. Software Engineer")).toHaveValue("Platform Engineer");
  await expect(page.getByPlaceholder("e.g. Engineering")).toHaveValue("Engineering");
  await expect(page.locator('input[type="date"]')).toHaveValue("2026-05-01");

  // Employment Type must NOT have been carried over — the contract's picker is still unset.
  await expect(page.getByText("Full-time or Part-time")).toBeVisible();
});
