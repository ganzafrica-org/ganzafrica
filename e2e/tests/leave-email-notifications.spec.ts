import { execSync } from "node:child_process";
import { test, expect } from "@playwright/test";
import { openAsRole } from "./support/auth";

/**
 * Punch-list #4 — leave submit/decision emails. Real delivery can't be asserted from a browser
 * (this dev stack has no RESEND_API_KEY, so email.service.ts logs instead of sending — see its
 * own comment), so this spec instead confirms the real end-to-end signal that the send pipeline
 * actually ran: the leave_emails idempotency row (leave-core.service.ts's sendLeaveEmailOnce
 * inserts one row per (leave, type, recipient) BEFORE calling sendEmail, so its presence proves
 * the send was attempted exactly once — the unit/integration coverage in
 * tests/integration/leave-emails.test.ts already pins the email content and the mocked-transport
 * exactly-once/idempotency behavior in detail).
 */

const DEV_DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://postgres:Thisisthefinal1@localhost:5432/ga_hr";

function leaveEmailCount(leaveId: string, emailType: string, recipientUserId: number): number {
  const out = execSync(
    `psql "${DEV_DATABASE_URL}" -v ON_ERROR_STOP=1 -t -A -c "` +
      `SELECT count(*) FROM leave_emails WHERE leave_id = '${leaveId}' ` +
      `AND email_type = '${emailType}' AND recipient_user_id = ${recipientUserId};"`,
    { stdio: "pipe" },
  ).toString();
  return Number(out.trim());
}

test("submit sends the approver-notification email once; approve sends the requester-decision email once", async ({
  browser,
}) => {
  const { context } = await openAsRole(browser, "hr");
  const api = context.request;

  const me = await api.get("/api/auth/me");
  expect(me.ok(), await me.text()).toBeTruthy();
  const meBody = await me.json();
  const hrUserId: number = Number(meBody.id ?? meBody.user?.id);
  expect(hrUserId).toBeTruthy();

  await api.get("/api/hr/employees?limit=1");
  const csrfCookie = (await context.cookies()).find((c) => c.name === "ganzafrica_csrf");
  const csrfHeaders = csrfCookie ? { "X-CSRF-Token": csrfCookie.value } : {};

  const stamp = Date.now();
  const createEmp = await api.post("/api/hr/employees", {
    headers: csrfHeaders,
    data: {
      first_name: "E2E",
      last_name: `LeaveEmail${stamp}`,
      personal_email: `e2e-leave-email-${stamp}@test.local`,
      employment_type: "staff",
    },
  });
  expect(createEmp.ok(), await createEmp.text()).toBeTruthy();
  const employee = (await createEmp.json()).employee;

  // No manager set, so notifyApprover falls back to the HR queue — the seeded hr@test.local
  // account this spec is already logged in as.
  const submit = await api.post(`/api/hr/employees/${employee.id}/leave`, {
    headers: csrfHeaders,
    data: {
      type: "UNPAID", // not balance-tracked — no leave policy prerequisite needed
      startDate: "2027-03-02",
      endDate: "2027-03-04",
      reason: "e2e leave email coverage",
    },
  });
  expect(submit.ok(), await submit.text()).toBeTruthy();
  const leave = (await submit.json()).leave;

  await expect
    .poll(() => leaveEmailCount(leave.id, "submitted", hrUserId), { timeout: 10_000 })
    .toBe(1);

  const approve = await api.post(`/api/hr/leave/${leave.id}/approve`, {
    headers: csrfHeaders,
    data: {},
  });
  expect(approve.ok(), await approve.text()).toBeTruthy();

  const empDetail = await api.get(`/api/hr/employees/${employee.id}`);
  expect(empDetail.ok(), await empDetail.text()).toBeTruthy();
  const requesterUserId: number = (await empDetail.json()).employee.user_id;
  expect(requesterUserId).toBeTruthy();

  await expect
    .poll(() => leaveEmailCount(leave.id, "decided", requesterUserId), { timeout: 10_000 })
    .toBe(1);
});
