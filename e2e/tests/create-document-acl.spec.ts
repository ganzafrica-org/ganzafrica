import { execSync } from "node:child_process";
import { test, expect, type Browser, type BrowserContext } from "@playwright/test";
import { openAsRole, API_URL, TEST_ACCOUNTS } from "./support/auth";

/**
 * MOD-05 §1E — real, browser-driven proof that the Create Document form's "Who can see this
 * document" section is actually wired up, not just a frontend widget (Things-to-work-on.md:
 * "this function ... should also be integrated and well working").
 *
 * As HR: create a document via the real Create Document form, checking only the "Finance"
 * department clause under "Who can see this document". Then: an employee outside Finance can't
 * see it (list or direct open), and an employee inside Finance can.
 *
 * The seeded `employee@test.local` account (department "Programs", per
 * backend/scripts/seed-test-users.ts) covers the "outside" side for free. There is no seeded
 * account in the "Finance" department, so this spec creates one — see `makeDepartmentEmployee`
 * below for why that needs a small direct-DB step alongside the real API calls.
 */

const DEV_DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://postgres:Thisisthefinal1@localhost:5432/ga_hr";
const PASSWORD = TEST_ACCOUNTS.employee.password; // "Test1234!" — same convention as the seeded accounts.

/**
 * Build a login-capable employee account in `department`, using only real endpoints plus one
 * direct SQL statement for a gap in those endpoints (confirmed live against the dev stack while
 * writing this spec, not assumed from reading the code):
 *
 *  1. POST /api/auth/register — a normal self-registration, with a password we know. This lands
 *     the account on the "public" role with no employees row (auth-and-rbac.md §5's default).
 *  2. As HR, POST /api/hr/employees with `personal_email` matching that account and the target
 *     `department`. `createEmployee` (employees-core.service.ts) links to the *existing* user by
 *     email instead of minting a new one — good, that's what keeps our chosen password valid
 *     (no "invited" reset-password email to intercept) — but `linkOrCreateUserForEmployee` only
 *     grants the "employee" role/role_id on the *new-account* branch, not the link-to-existing
 *     branch. Verified with curl against this same dev DB: after steps 1-2 alone, the account is
 *     still role "public" and gets a 403 from GET /api/hr/documents.
 *  3. So: one direct SQL statement upgrades that account to the "employee" role (role_id +
 *     user_roles), matching what `seed-test-users.ts` does for the other seeded accounts. This is
 *     the "small script" option the task description offers as an alternative to driving the full
 *     Add Employee UI wizard (which can't be used here at all for e2e: a *brand new* account made
 *     through that flow gets a random password behind an email "set password" invite link, which
 *     this spec has no mailbox to intercept).
 */
async function makeDepartmentEmployee(
  browser: Browser,
  hrContext: BrowserContext,
  department: string,
): Promise<{ email: string; context: BrowserContext }> {
  const email = `e2e-acl-${department.toLowerCase()}-${Date.now()}@test.local`;

  const registerCtx = await browser.newContext({ baseURL: API_URL });
  const registered = await registerCtx.request.post("/api/auth/register", {
    data: { email, password: PASSWORD, confirm_password: PASSWORD, name: `ACL ${department} Test` },
  });
  expect(registered.ok(), await registered.text()).toBeTruthy();
  await registerCtx.close();

  execSync(
    `psql "${DEV_DATABASE_URL}" -v ON_ERROR_STOP=1 -q -c "` +
      `UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'employee') WHERE email = '${email}'; ` +
      `INSERT INTO user_roles (user_id, role_id) ` +
      `SELECT id, (SELECT id FROM roles WHERE name = 'employee') FROM users WHERE email = '${email}' ` +
      `ON CONFLICT DO NOTHING;"`,
    { stdio: "pipe" },
  );

  const csrfCookie = (await hrContext.cookies()).find((c) => c.name === "ganzafrica_csrf");
  expect(csrfCookie, "expected the CSRF cookie to have been issued by now").toBeTruthy();
  const created = await hrContext.request.post("/api/hr/employees", {
    data: {
      first_name: "ACL",
      last_name: `${department} Test`,
      personal_email: email,
      department,
      employment_type: "staff",
    },
    headers: { "X-CSRF-Token": csrfCookie!.value },
  });
  expect(created.ok(), await created.text()).toBeTruthy();

  const context = await browser.newContext({ baseURL: API_URL });
  const loggedIn = await context.request.post("/api/auth/login", {
    data: { email, password: PASSWORD },
  });
  expect(loggedIn.ok(), await loggedIn.text()).toBeTruthy();

  return { email, context };
}

test("Create Document ACL: department-only visibility is enforced end to end", async ({
  browser,
}) => {
  test.setTimeout(90_000);

  const { context: hrContext, page: hrPage } = await openAsRole(browser, "hr", "/documents");
  const { context: financeContext } = await makeDepartmentEmployee(browser, hrContext, "Finance");

  const documentName = `E2E ACL Finance-only ${Date.now()}`;

  await hrPage.getByRole("button", { name: "Add Document" }).click();
  await expect(hrPage.getByRole("heading", { name: "Upload New Document" })).toBeVisible();

  // ReusableSheet (sheet-component.tsx) isn't a portal and has no role="dialog" — it's a plain
  // motion.div appended after the page's own content, which still contains its own Category/
  // Status *filter* comboboxes. Scope everything to the sheet's own fixed container (identified
  // by its z-[101] stacking class, unique to the sheet) so e.g. `getByRole("combobox").first()`
  // can't resolve to a filter dropdown hidden behind the modal overlay.
  const sheet = hrPage
    .getByRole("heading", { name: "Upload New Document" })
    .locator("xpath=ancestor::div[contains(@class,'z-[101]')]");

  await sheet.getByLabel("Document Name *").fill(documentName);
  await sheet.getByLabel("Department *").fill("Finance");
  await sheet.getByLabel("Description *").fill("Visible only to the Finance department (e2e).");

  // shadcn/Radix Select — click the trigger, then the option by its text.
  await sheet.getByRole("combobox").first().click();
  await hrPage.getByRole("option", { name: "Policies & Procedures" }).click();

  await sheet.locator('input[type="file"]').setInputFiles({
    name: "acl-test.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 e2e"),
  });

  // "Who can see this document" — check only the Finance *department* clause. "finance" is also
  // one of the assignable *roles* just above it in the same form, so match the department
  // checkbox's exact, capitalized accessible name ("Finance") rather than a loose/case-insensitive
  // one, which would ambiguously match both.
  await expect(sheet.getByText("Who can see this document")).toBeVisible();
  await sheet.getByRole("checkbox", { name: "Finance", exact: true }).check();
  await expect(
    sheet.getByText("Visible to anyone matching ANY of the selected clauses below, plus HR/admin."),
  ).toBeVisible();

  await sheet.getByRole("button", { name: "Upload Document" }).click();
  await expect(hrPage.getByRole("heading", { name: "Upload New Document" })).not.toBeVisible({
    timeout: 15_000,
  });

  // HR (always bypasses ACLs) sees it right away — confirms creation actually succeeded.
  await hrPage.getByPlaceholder("Search documents...").fill(documentName);
  await expect(hrPage.getByText(documentName, { exact: true })).toBeVisible({ timeout: 15_000 });

  // Outside the ACL'd department (seeded employee@test.local, department "Programs"): the
  // document must not appear in their list at all.
  const { page: outsidePage } = await openAsRole(browser, "employee", "/documents");
  await outsidePage.getByPlaceholder("Search documents...").fill(documentName);
  await expect(outsidePage.getByText(documentName, { exact: true })).toHaveCount(0);
  await outsidePage.waitForTimeout(500); // let any late list re-render settle before the final check
  await expect(outsidePage.getByText(documentName, { exact: true })).toHaveCount(0);

  // Inside the ACL'd department: the same document is visible and openable.
  const financePage = await financeContext.newPage();
  await financePage.goto(`${new URL(hrPage.url()).origin}/documents`);
  await financePage.getByPlaceholder("Search documents...").fill(documentName);
  await expect(financePage.getByText(documentName, { exact: true })).toBeVisible({
    timeout: 15_000,
  });

  await hrContext.close();
  await financeContext.close();
  await outsidePage.context().close();
});
