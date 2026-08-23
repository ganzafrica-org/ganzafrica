/**
 * Punch-list #4 — leave-flow emails: submit notifies the resolved approver (manager, or the HR
 * queue when the requester has no manager), decisions notify the requester with the outcome and
 * approver note. Reuses the same manager-chain resolution as the in-app notification
 * (notifyApprover in leave-core.service.ts) and the recruitment_emails insert-first idempotency
 * pattern (leave_emails).
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { resetDb } from "../setup";
import {
  requestLeave,
  decideLeave,
  sendLeaveEmailOnce,
} from "../../src/services/hr/leave-core.service";
import { makeEmployeeUser, makeLeavePolicy, ensureRole } from "../factories";

const sendEmailMock = vi.fn(async () => ({ id: "x" }));
vi.mock("../../src/services/email.service", () => ({
  sendEmail: (...args: unknown[]) => sendEmailMock(...args),
}));

const d = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

async function seedOrg() {
  const director = await makeEmployeeUser({ role: "employee", employmentType: "staff" });
  const manager = await makeEmployeeUser({
    role: "employee",
    employmentType: "staff",
    managerId: director.employee.id,
  });
  const report = await makeEmployeeUser({
    role: "employee",
    employmentType: "staff",
    managerId: manager.employee.id,
  });
  return { director, manager, report };
}

describe("MOD-06 leave-flow emails", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    await makeLeavePolicy({ employmentType: "staff", type: "ANNUAL", annualDays: 20 });
    sendEmailMock.mockClear();
  });

  it("submitting sends exactly one email to the resolved manager", async () => {
    const { manager, report } = await seedOrg();

    await requestLeave(report.user.id, report.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-04"),
      reason: "Family trip",
    });

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    const [to, subject] = sendEmailMock.mock.calls[0];
    expect(to).toBe(manager.user.email);
    expect(subject).toMatch(/awaiting your approval/i);
  });

  it("falls back to the HR queue when the requester has no manager, emailing every HR recipient once", async () => {
    const { director } = await seedOrg();
    const hr1 = await makeEmployeeUser({ role: "hr", employmentType: "staff" });
    const hr2 = await makeEmployeeUser({ role: "hr", employmentType: "staff" });

    await requestLeave(director.user.id, director.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-04"),
      reason: "Family trip",
    });

    expect(sendEmailMock).toHaveBeenCalledTimes(2);
    const recipients = sendEmailMock.mock.calls.map((c) => c[0]).sort();
    expect(recipients).toEqual([hr1.user.email, hr2.user.email].sort());
  });

  it("retrying the same (leave, type, recipient) does not double-send — the idempotency guard", async () => {
    const { report } = await seedOrg();
    const leave = await requestLeave(report.user.id, report.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-04"),
      reason: "Family trip",
    });
    sendEmailMock.mockClear();

    const render = () => ({ subject: "s", html: "h", text: "t" });
    await sendLeaveEmailOnce(leave.id, "decided", report.user.id, render);
    await sendLeaveEmailOnce(leave.id, "decided", report.user.id, render); // retry, same key

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
  });

  it("a normal decision flow's application-level guard also stops a duplicate decide from re-sending", async () => {
    const { manager, report } = await seedOrg();
    const leave = await requestLeave(report.user.id, report.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-04"),
      reason: "Family trip",
    });
    sendEmailMock.mockClear();

    await decideLeave(manager.user.id, leave.id, "APPROVED");
    expect(sendEmailMock).toHaveBeenCalledTimes(1);

    await expect(decideLeave(manager.user.id, leave.id, "APPROVED")).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(sendEmailMock).toHaveBeenCalledTimes(1); // unchanged — rejected before reaching the email step
  });

  it("approving sends exactly one email to the requester, including the approver's note", async () => {
    const { manager, report } = await seedOrg();
    const leave = await requestLeave(report.user.id, report.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-04"),
      reason: "Family trip",
    });
    sendEmailMock.mockClear();

    await decideLeave(manager.user.id, leave.id, "APPROVED", "Enjoy the trip!");

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    const [to, subject, html, text] = sendEmailMock.mock.calls[0];
    expect(to).toBe(report.user.email);
    expect(subject).toMatch(/approved/i);
    expect(html).toContain("Enjoy the trip!");
    expect(text).toContain("Enjoy the trip!");
  });

  it("rejecting sends exactly one email to the requester with the rejection note", async () => {
    const { manager, report } = await seedOrg();
    const leave = await requestLeave(report.user.id, report.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-04"),
      reason: "Family trip",
    });
    sendEmailMock.mockClear();

    await decideLeave(manager.user.id, leave.id, "REJECTED", "Coverage gap that week");

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    const [to, subject, html] = sendEmailMock.mock.calls[0];
    expect(to).toBe(report.user.email);
    expect(subject).toMatch(/rejected/i);
    expect(html).toContain("Coverage gap that week");
  });
});
