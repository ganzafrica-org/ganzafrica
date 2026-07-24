/**
 * MOD-06 HTTP surface — real routes, real auth middleware, real permissions. Guards the two
 * mounting hazards: the legacy `/leave` → `/leaves` 308 alias must not swallow these paths, and
 * managers (who lack leave:manage) must still be able to decide their reports' requests.
 */
import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import app from "../../src/app";
import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { clearPermissionCache } from "../../src/middlewares/auth.middleware";
import { makeEmployee, makeLeavePolicy, ensureRole } from "../factories";
import { grant } from "../helpers/rbac";
import { db } from "../../src/db/client";
import { user_roles, roles } from "../../src/db/schema";
import { eq } from "drizzle-orm";

const API = "/api/hr";

async function grantRole(userId: number, roleName: string) {
  const [role] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
  await db.insert(user_roles).values({ user_id: userId, role_id: role.id }).onConflictDoNothing();
}

/**
 * An authenticated agent whose user also has an employees row. Logging in warms the 60s
 * permission cache, so roles granted afterwards need the cache dropped to take effect.
 */
async function loginAsEmployee(role = "employee", opts: { managerId?: string } = {}) {
  const { agent, user } = await loginAs(role);
  if (role !== "employee") await grantRole(user.id, "employee");
  clearPermissionCache(user.id);

  const employee = await makeEmployee({
    userId: user.id,
    employmentType: "staff",
    managerId: opts.managerId ?? null,
  });
  return { agent, user, employee };
}

describe("MOD-06 API", () => {
  beforeEach(async () => {
    await resetDb();
    clearPermissionCache(); // ids are recycled by RESTART IDENTITY; stale entries would leak across tests
    await ensureRole("employee");
    await ensureRole("hr");
    await ensureRole("admin");
    // The RBAC seed doesn't run in tests — mirror the seed rows these routes gate on.
    await grant("employee", "leave_self", "request");
    await grant("hr", "leave", "manage");
    await makeLeavePolicy({ employmentType: "staff", type: "ANNUAL", annualDays: 20 });
  });

  it("serves GET /hr/me/leave instead of redirecting to the legacy /leaves route", async () => {
    const { agent } = await loginAsEmployee();
    const res = await agent.get(`${API}/me/leave`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("balances");
    expect(res.body).toHaveProperty("requests");
  });

  it("does not let the /leave alias swallow MOD-06 approval paths", async () => {
    const { agent } = await loginAsEmployee();
    const res = await agent.get(`${API}/leave/pending-approvals`);

    expect(res.status).toBe(200);
    expect(res.status).not.toBe(308);
    expect(res.body).toHaveProperty("leaves");
  });

  it("requires authentication", async () => {
    const res = await supertest(app).get(`${API}/me/leave`);
    expect(res.status).toBe(401);
  });

  it("creates a request and returns the computed working days", async () => {
    const { agent } = await loginAsEmployee();

    const res = await agent.post(`${API}/me/leave`).send({
      type: "ANNUAL",
      startDate: "2026-03-02",
      endDate: "2026-03-04",
      reason: "Trip",
    });

    expect(res.status).toBe(201);
    expect(Number(res.body.leave.days)).toBe(3);
    expect(res.body.leave.status).toBe("PENDING");
  });

  it("dry-runs a request without persisting it", async () => {
    const { agent } = await loginAsEmployee();

    const res = await agent
      .post(`${API}/me/leave/validate`)
      .send({ type: "ANNUAL", startDate: "2026-03-02", endDate: "2026-03-06" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ days: 5, remaining: 20, sufficient: true });

    const after = await agent.get(`${API}/me/leave`);
    expect(after.body.requests).toHaveLength(0);
  });

  it("rejects an over-balance request with 422", async () => {
    const { agent } = await loginAsEmployee();

    const res = await agent
      .post(`${API}/me/leave`)
      .send({ type: "ANNUAL", startDate: "2026-02-02", endDate: "2026-04-30" });

    expect(res.status).toBe(422);
    expect(res.body.code).toBe("LEAVE_INSUFFICIENT_BALANCE");
  });

  it("lets a manager without leave:manage approve their report", async () => {
    const manager = await loginAsEmployee();
    const report = await loginAsEmployee("employee", { managerId: manager.employee.id });

    const created = await report.agent
      .post(`${API}/me/leave`)
      .send({ type: "ANNUAL", startDate: "2026-03-02", endDate: "2026-03-03" });
    expect(created.status).toBe(201);

    const queue = await manager.agent.get(`${API}/leave/pending-approvals`);
    expect(queue.body.leaves.map((l: { id: string }) => l.id)).toContain(created.body.leave.id);

    const approved = await manager.agent
      .post(`${API}/leave/${created.body.leave.id}/approve`)
      .send({});
    expect(approved.status).toBe(200);
    expect(approved.body.leave.status).toBe("APPROVED");
  });

  it("denies an unrelated employee deciding someone else's request with 403", async () => {
    const requester = await loginAsEmployee();
    const stranger = await loginAsEmployee();

    const created = await requester.agent
      .post(`${API}/me/leave`)
      .send({ type: "ANNUAL", startDate: "2026-03-02", endDate: "2026-03-03" });

    const res = await stranger.agent.post(`${API}/leave/${created.body.leave.id}/approve`).send({});
    expect(res.status).toBe(403);
  });

  it("requires a note to reject", async () => {
    const requester = await loginAsEmployee();
    const hr = await loginAsEmployee("hr");

    const created = await requester.agent
      .post(`${API}/me/leave`)
      .send({ type: "ANNUAL", startDate: "2026-03-02", endDate: "2026-03-03" });

    const bare = await hr.agent.post(`${API}/leave/${created.body.leave.id}/reject`).send({});
    expect(bare.status).toBe(422);

    const withNote = await hr.agent
      .post(`${API}/leave/${created.body.leave.id}/reject`)
      .send({ note: "Coverage gap" });
    expect(withNote.status).toBe(200);
    expect(withNote.body.leave.status).toBe("REJECTED");
  });

  it("restricts policy settings to leave:manage", async () => {
    const employee = await loginAsEmployee();
    const hr = await loginAsEmployee("hr");

    const denied = await employee.agent
      .post(`${API}/leave-policies`)
      .send({ employment_type: "intern", type: "ANNUAL", annual_days: 10 });
    expect(denied.status).toBe(403);

    const allowed = await hr.agent
      .post(`${API}/leave-policies`)
      .send({ employment_type: "intern", type: "ANNUAL", annual_days: 10 });
    expect(allowed.status).toBe(201);
    expect(Number(allowed.body.policy.annual_days)).toBe(10);
  });

  it("lets HR manage holidays and reflects them in the day count", async () => {
    const hr = await loginAsEmployee("hr");
    const employee = await loginAsEmployee();

    const created = await hr.agent
      .post(`${API}/holidays`)
      .send({ date: "2026-03-03", name: "Test Holiday" });
    expect(created.status).toBe(201);

    const check = await employee.agent
      .post(`${API}/me/leave/validate`)
      .send({ type: "ANNUAL", startDate: "2026-03-02", endDate: "2026-03-04" });

    // Mon–Wed with Tuesday a holiday → 2 working days.
    expect(check.body.days).toBe(2);
  });

  it("requires a note on manual balance adjustment", async () => {
    const hr = await loginAsEmployee("hr");
    const employee = await loginAsEmployee();

    await employee.agent.get(`${API}/me/leave`); // materializes balances
    const mine = await employee.agent.get(`${API}/me/leave`);
    const balanceId = mine.body.balances[0].id;

    const bare = await hr.agent.patch(`${API}/leave-balances/${balanceId}`).send({ used_days: 5 });
    expect(bare.status).toBe(400);

    const noted = await hr.agent
      .patch(`${API}/leave-balances/${balanceId}`)
      .send({ used_days: 5, note: "Carried from Deel" });
    expect(noted.status).toBe(200);
    expect(Number(noted.body.balance.used_days)).toBe(5);
  });

  it("keeps the legacy /hr/leaves route reachable", async () => {
    const { user } = await loginAs("hr");
    await grantRole(user.id, "hr");
    const { agent } = await loginAs("hr");

    const res = await agent.get(`${API}/leaves`);
    expect([200, 403]).toContain(res.status); // reachable, not a 404/308
  });
});
