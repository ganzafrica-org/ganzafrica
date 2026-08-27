import type { Browser, BrowserContext, Page } from "@playwright/test";

/**
 * Shared e2e auth helper. The real login UI lives on the portal app and isn't part of any of
 * tonight's tasks, so specs authenticate directly against the backend (POST /api/auth/login,
 * exempt from CSRF) using the seeded test accounts, then drive the HR app as that session.
 *
 * Cookies set while talking to API_URL are host-only ("localhost", no Domain attribute — see
 * backend/src/config/constants.ts COOKIE_OPTIONS) and sameSite=lax, so they carry over to a page
 * navigated to HR_URL on the same host: browsers scope cookies by host, not by port.
 *
 * Seed the accounts once per environment with (from backend/):
 *   DATABASE_URL=<your dev db> pnpm db:seed:test-users
 */
export const API_URL = process.env.API_URL ?? "http://localhost:3002";
export const HR_URL = process.env.HR_URL ?? "http://localhost:3006";

export type TestRole = "admin" | "hr" | "employee";

export const TEST_ACCOUNTS: Record<TestRole, { email: string; password: string }> = {
  admin: { email: "admin@test.local", password: "Test1234!" },
  hr: { email: "hr@test.local", password: "Test1234!" },
  employee: { email: "employee@test.local", password: "Test1234!" },
};

/**
 * A browser context whose cookie jar (shared with `.request`) already holds a valid session for
 * `role`. Use `context.newPage()` and `page.goto(HR_URL + "/...")` from here.
 */
export async function newAuthedContext(browser: Browser, role: TestRole): Promise<BrowserContext> {
  const context = await browser.newContext({ baseURL: API_URL });
  const { email, password } = TEST_ACCOUNTS[role];
  const res = await context.request.post("/api/auth/login", { data: { email, password } });
  if (!res.ok()) {
    throw new Error(`e2e login as "${role}" failed: ${res.status()} ${await res.text()}`);
  }
  return context;
}

/** Convenience wrapper: authed context + one page, navigated to an HR app path. */
export async function openAsRole(
  browser: Browser,
  role: TestRole,
  path = "/",
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await newAuthedContext(browser, role);
  const page = await context.newPage();
  await page.goto(`${HR_URL}${path}`);
  return { context, page };
}
