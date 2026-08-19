/**
 * MOD-06 follow-up: the "Leave Requests" table on the frontend used to call the legacy
 * `GET /hr/leaves` route, which is HR-only (`leave:manage`) — any employee viewing it got a 403.
 * `listVisibleLeaves` gives every viewer a role-scoped, any-status list instead: their own plus
 * their reports' for a regular employee/manager (same manager-chain scope as
 * `listPendingApprovals`, just not filtered to PENDING), or everyone's for HR/admin.
 */
import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import app from "../../src/app";
import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { clearPermissionCache } from "../../src/middlewares/auth.middleware";
import {
  listVisibleLeaves,
  requestLeave,
  decideLeave,
} from "../../src/services/hr/leave-core.service";
import { makeEmployeeUser, makeEmployee, makeLeavePolicy, ensureRole } from "../factories";
import { db } from "../../src/db/client";
import { user_roles, roles } from "../../src/db/schema";
import { eq } from "drizzle-orm";

const API = "/api/hr";
const d = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

async function grantRole(userId: number, roleName: string) {
  const [role] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
  await db.insert(user_roles).values({ user_id: userId, role_id: role.id }).onConflictDoNothing();
}

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
  const outsider = await makeEmployeeUser({ role: "employee", employmentType: "staff" });
  return { director, manager, report, peer, outsider };
}

describe("listVisibleLeaves", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    await ensureRole("admin");
    await makeLeavePolicy({ employmentType: "staff", type: "ANNUAL", annualDays: 20 });
  });

  it("shows an employee only their own requests, across every status", async () => {
    const { report, outsider } = await seedOrg();

    const mine = await requestLeave(report.user.id, report.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-03"),
      reason: "Mine",
    });
    await requestLeave(outsider.user.id, outsider.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-03"),
      reason: "Not mine",
    });

    const visible = await listVisibleLeaves(report.user.id);
    expect(visible.map((l) => l.id)).toEqual([mine.id]);
    expect(visible[0].employeeName).toContain(report.employee.first_name);
    expect(visible[0].status).toBe("Pending");
  });

  it("shows a manager their own plus their reports' requests, not an outsider's", async () => {
    const { manager, report, peer, outsider } = await seedOrg();

    const managerOwn = await requestLeave(manager.user.id, manager.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-03"),
      reason: "Manager's own",
    });
    const reportPending = await requestLeave(report.user.id, report.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-04-06"),
      endDate: d("2026-04-07"),
      reason: "Report pending",
    });
    const reportApproved = await requestLeave(report.user.id, report.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-05-04"),
      endDate: d("2026-05-05"),
      reason: "Report approved",
    });
    await decideLeave(manager.user.id, reportApproved.id, "APPROVED");

    // `peer` also reports to `manager` in seedOrg(), so it should be visible too — only
    // `outsider`, who sits elsewhere in the tree, should be excluded.
    const peerLeave = await requestLeave(peer.user.id, peer.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-03"),
      reason: "Another of manager's reports",
    });
    const outsiderLeave = await requestLeave(outsider.user.id, outsider.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-03"),
      reason: "Outsider",
    });

    const visible = await listVisibleLeaves(manager.user.id);
    const ids = visible.map((l) => l.id);
    expect(ids).toEqual(
      expect.arrayContaining([managerOwn.id, reportPending.id, reportApproved.id, peerLeave.id]),
    );
    expect(ids).not.toContain(outsiderLeave.id);

    const decided = visible.find((l) => l.id === reportApproved.id)!;
    expect(decided.status).toBe("Approved");
  });

  it("includes skip-level reports (director sees their manager's reports too)", async () => {
    const { director, report } = await seedOrg();

    const leave = await requestLeave(report.user.id, report.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-03"),
      reason: "Skip-level visibility",
    });

    const visible = await listVisibleLeaves(director.user.id);
    expect(visible.map((l) => l.id)).toContain(leave.id);
  });

  it("shows HR/admin every request in the org", async () => {
    const { manager, report, peer, outsider } = await seedOrg();
    const hr = await makeEmployeeUser({ role: "hr", employmentType: "staff" });

    const all = await Promise.all(
      [manager, report, peer, outsider].map((who, i) =>
        requestLeave(who.user.id, who.employee.id, {
          type: "ANNUAL",
          startDate: d(`2026-06-0${i + 1}`),
          endDate: d(`2026-06-0${i + 1}`),
          reason: `Org-wide #${i}`,
        }),
      ),
    );

    const visible = await listVisibleLeaves(hr.user.id);
    const ids = visible.map((l) => l.id);
    expect(ids).toEqual(expect.arrayContaining(all.map((l) => l.id)));
  });

  it("returns an empty list for a caller with no employee profile", async () => {
    // No employees row exists for this id — employeeForUser finds nothing, so the "regular
    // employee" branch degrades to an empty list rather than throwing.
    expect(await listVisibleLeaves(999999)).toEqual([]);
  });

  it("serves GET /hr/leave/requests scoped to the caller, not the HR-only legacy /hr/leaves shape", async () => {
    clearPermissionCache();

    const { agent, user } = await loginAs("employee");
    await grantRole(user.id, "employee");
    clearPermissionCache(user.id);
    const employee = await makeEmployee({ userId: user.id, employmentType: "staff" });

    // Previously this table's data source was the HR-only `/hr/leaves`; an employee hitting it
    // directly got a 403. The new route is authenticate-only, scoped inside the service.
    const forbidden = await agent.get(`${API}/leaves`);
    expect(forbidden.status).toBe(403);

    await requestLeave(user.id, employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-03"),
      reason: "Via HTTP",
    });

    const res = await agent.get(`${API}/leave/requests`);
    expect(res.status).toBe(200);
    expect(res.body.leaves).toHaveLength(1);
    expect(res.body.leaves[0]).toMatchObject({ status: "Pending", reason: "Via HTTP" });
  });

  it("requires authentication", async () => {
    const res = await supertest(app).get(`${API}/leave/requests`);
    expect(res.status).toBe(401);
  });
});
