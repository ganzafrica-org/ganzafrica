import { test, expect } from "@playwright/test";
import { openAsRole, HR_URL } from "./support/auth";

/**
 * Punch-list #5 — optional leave-request attachments, viewed inline via the same shared
 * DocumentViewer used everywhere else (not a second, leave-specific viewer). Two runs: a PDF
 * attachment opens inline for the approver from the Approvals sheet; a zero-attachment request
 * still submits and approves exactly as before (no attachments section rendered at all).
 */

async function setup(browser: import("@playwright/test").Browser) {
  const { context, page } = await openAsRole(browser, "hr");
  const api = context.request;
  await api.get("/api/hr/employees?limit=1");
  const csrfCookie = (await context.cookies()).find((c) => c.name === "ganzafrica_csrf");
  const csrfHeaders = csrfCookie ? { "X-CSRF-Token": csrfCookie.value } : {};
  return { context, page, api, csrfHeaders };
}

test("a leave request with a PDF attachment: the approver opens it inline via the shared document viewer", async ({
  browser,
}) => {
  const { page, api, csrfHeaders } = await setup(browser);
  const stamp = Date.now();

  const createEmp = await api.post("/api/hr/employees", {
    headers: csrfHeaders,
    data: {
      first_name: "E2E",
      last_name: `LeaveAttach${stamp}`,
      personal_email: `e2e-leave-attach-${stamp}@test.local`,
      employment_type: "staff",
    },
  });
  expect(createEmp.ok(), await createEmp.text()).toBeTruthy();
  const employee = (await createEmp.json()).employee;

  const reason = `e2e attachment coverage ${stamp}`;
  const submit = await api.post(`/api/hr/employees/${employee.id}/leave`, {
    headers: csrfHeaders,
    data: { type: "UNPAID", startDate: "2027-04-02", endDate: "2027-04-04", reason },
  });
  expect(submit.ok(), await submit.text()).toBeTruthy();
  const leave = (await submit.json()).leave;

  const upload = await api.post(`/api/hr/leave/${leave.id}/attachments`, {
    headers: csrfHeaders,
    multipart: {
      file: {
        name: "sick-note.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4 e2e leave attachment"),
      },
    },
  });
  expect(upload.ok(), await upload.text()).toBeTruthy();

  await page.goto(`${HR_URL}/leave`);
  await page.getByRole("button", { name: "Approvals" }).click();
  const card = page
    .getByText(reason)
    .locator("xpath=ancestor::div[contains(@class,'shadow-sm')][1]");
  await expect(card).toBeVisible({ timeout: 15_000 });

  await card.getByRole("button", { name: /sick-note\.pdf/i }).click();
  const iframe = card.locator("iframe");
  await expect(iframe).toBeVisible({ timeout: 15_000 });
});

test("a leave request with no attachment: submits and shows in Approvals with no attachments section", async ({
  browser,
}) => {
  const { page, api, csrfHeaders } = await setup(browser);
  const stamp = Date.now();

  const createEmp = await api.post("/api/hr/employees", {
    headers: csrfHeaders,
    data: {
      first_name: "E2E",
      last_name: `LeaveNoAttach${stamp}`,
      personal_email: `e2e-leave-no-attach-${stamp}@test.local`,
      employment_type: "staff",
    },
  });
  expect(createEmp.ok(), await createEmp.text()).toBeTruthy();
  const employee = (await createEmp.json()).employee;

  const reason = `e2e no-attachment coverage ${stamp}`;
  const submit = await api.post(`/api/hr/employees/${employee.id}/leave`, {
    headers: csrfHeaders,
    data: { type: "UNPAID", startDate: "2027-04-12", endDate: "2027-04-13", reason },
  });
  expect(submit.ok(), await submit.text()).toBeTruthy();

  await page.goto(`${HR_URL}/leave`);
  await page.getByRole("button", { name: "Approvals" }).click();
  const card = page
    .getByText(reason)
    .locator("xpath=ancestor::div[contains(@class,'shadow-sm')][1]");
  await expect(card).toBeVisible({ timeout: 15_000 });
  await expect(card.getByRole("button", { name: /attachment/i })).toHaveCount(0);
  await expect(card.getByRole("button", { name: /approve/i })).toBeVisible();
});
