/**
 * MOD-06 §6.4/§6.7 — approval authority flows through employees.manager_id (never free text),
 * with HR as override and as the fallback queue for people with no manager.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import { employees } from "../../src/db/schema";
import { isManagerOf, getManagerUserId } from "../../src/services/hr/employee-context";
import {
  requestLeave,
  decideLeave,
  listPendingApprovals,
  getLeaveCalendar,
} from "../../src/services/hr/leave.service";
import { makeEmployeeUser, makeLeavePolicy, ensureRole } from "../factories";

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
  const peer = await makeEmployeeUser({
    role: "employee",
    employmentType: "staff",
    managerId: manager.employee.id,
  });
  return { director, manager, report, peer };
}

describe("isManagerOf", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
  });

  it("is true for the direct manager and false for a peer", async () => {
    const { manager, report, peer } = await seedOrg();
    await expect(isManagerOf(manager.employee.id, report.employee.id)).resolves.toBe(true);
    await expect(isManagerOf(peer.employee.id, report.employee.id)).resolves.toBe(false);
  });

  it("is true for a skip-level manager", async () => {
    const { director, report } = await seedOrg();
    await expect(isManagerOf(director.employee.id, report.employee.id)).resolves.toBe(true);
  });

  it("is false for oneself and for an inverted relationship", async () => {
    const { manager, report } = await seedOrg();
    await expect(isManagerOf(report.employee.id, report.employee.id)).resolves.toBe(false);
    await expect(isManagerOf(report.employee.id, manager.employee.id)).resolves.toBe(false);
  });

  it("returns null manager for someone at the top of the tree", async () => {
    const { director } = await seedOrg();
    await expect(getManagerUserId(director.employee.id)).resolves.toBeNull();
  });
});

describe("MOD-06 approval authority", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    await makeLeavePolicy({ employmentType: "staff", type: "ANNUAL", annualDays: 20 });
  });

  async function pendingRequestFor(who: Awaited<ReturnType<typeof makeEmployeeUser>>) {
    return requestLeave(who.user.id, who.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-04"),
      reason: "Trip",
    });
  }

  it("lets the direct manager approve their report", async () => {
    const { manager, report } = await seedOrg();
    const leave = await pendingRequestFor(report);

    const decided = await decideLeave(manager.user.id, leave.id, "APPROVED");
    expect(decided.status).toBe("APPROVED");
  });

  it("denies a peer with 403", async () => {
    const { report, peer } = await seedOrg();
    const leave = await pendingRequestFor(report);

    await expect(decideLeave(peer.user.id, leave.id, "APPROVED")).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("lets HR approve anyone regardless of hierarchy", async () => {
    const { report } = await seedOrg();
    const hr = await makeEmployeeUser({ role: "hr", employmentType: "staff" });
    const leave = await pendingRequestFor(report);

    const decided = await decideLeave(hr.user.id, leave.id, "APPROVED");
    expect(decided.status).toBe("APPROVED");
  });

  it("denies the requester approving their own leave", async () => {
    const { report } = await seedOrg();
    const leave = await pendingRequestFor(report);

    await expect(decideLeave(report.user.id, leave.id, "APPROVED")).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("shows a manager only their own reports' pending requests", async () => {
    const { manager, report, director } = await seedOrg();
    const outsider = await makeEmployeeUser({ role: "employee", employmentType: "staff" });

    const mine = await pendingRequestFor(report);
    await pendingRequestFor(outsider);

    const queue = await listPendingApprovals(manager.user.id);
    expect(queue.map((l) => l.id)).toEqual([mine.id]);

    // The skip-level manager sees it too.
    const directorQueue = await listPendingApprovals(director.user.id);
    expect(directorQueue.map((l) => l.id)).toContain(mine.id);
  });

  it("routes to HR when the requester has no manager", async () => {
    const { director } = await seedOrg();
    const hr = await makeEmployeeUser({ role: "hr", employmentType: "staff" });

    const leave = await pendingRequestFor(director);

    // Nobody manages the director, so the request lands in the HR queue.
    expect(await getManagerUserId(director.employee.id)).toBeNull();
    const hrQueue = await listPendingApprovals(hr.user.id);
    expect(hrQueue.map((l) => l.id)).toContain(leave.id);
  });
});

describe("MOD-06 calendar scoping", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    await makeLeavePolicy({ employmentType: "staff", type: "ANNUAL", annualDays: 20 });
  });

  it("shows an employee their team's approved leave but not the whole org", async () => {
    const { manager, report, peer } = await seedOrg();
    const outsider = await makeEmployeeUser({ role: "employee", employmentType: "staff" });

    const peerLeave = await requestLeave(peer.user.id, peer.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-03"),
      reason: "Trip",
    });
    await decideLeave(manager.user.id, peerLeave.id, "APPROVED");

    const outsiderLeave = await requestLeave(outsider.user.id, outsider.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-03"),
      reason: "Trip",
    });
    const hr = await makeEmployeeUser({ role: "hr", employmentType: "staff" });
    await decideLeave(hr.user.id, outsiderLeave.id, "APPROVED");

    const teamView = await getLeaveCalendar(report.user.id, {
      from: d("2026-03-01"),
      to: d("2026-03-31"),
    });
    const ids = teamView.map((e) => e.id);
    expect(ids).toContain(peerLeave.id);
    expect(ids).not.toContain(outsiderLeave.id);

    const hrView = await getLeaveCalendar(hr.user.id, {
      from: d("2026-03-01"),
      to: d("2026-03-31"),
    });
    expect(hrView.map((e) => e.id)).toEqual(
      expect.arrayContaining([peerLeave.id, outsiderLeave.id]),
    );
  });

  it("includes every status, not just approved, and carries the employee's name and picture (punch-list #6)", async () => {
    const { manager, report } = await seedOrg();
    await db
      .update(employees)
      .set({ picture: "https://cdn.example.com/report.jpg" })
      .where(eq(employees.id, report.employee.id));

    const pending = await requestLeave(report.user.id, report.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-03"),
      reason: "Trip",
    });

    const events = await getLeaveCalendar(manager.user.id, {
      from: d("2026-03-01"),
      to: d("2026-03-31"),
    });
    const event = events.find((e) => e.id === pending.id);
    expect(event).toBeTruthy();
    expect(event!.status).toBe("Pending");
    expect(event!.employeeName).toBe(`${report.employee.first_name} ${report.employee.last_name}`);
    expect(event!.employeePicture).toBe("https://cdn.example.com/report.jpg");
  });
});
