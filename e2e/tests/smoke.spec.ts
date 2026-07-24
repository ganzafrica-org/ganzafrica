import { test, expect } from "@playwright/test";

/**
 * Smoke suite — grows as features land (auth, SSO handoff, payslip link, recruitment, …).
 * Backend health + portal login page are the first proofs the stack is wired.
 */

const API_URL = process.env.API_URL ?? "http://localhost:3002";

test("backend health responds", async ({ request }) => {
  const res = await request.get(`${API_URL}/api/health`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.status).toBe("ok");
});

test("portal login page renders", async ({ page }) => {
  await page.goto("/login");
  // A login form (email field) should be present.
  await expect(page.getByRole("textbox").first()).toBeVisible();
});
