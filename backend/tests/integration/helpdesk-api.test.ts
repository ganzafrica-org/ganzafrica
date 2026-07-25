/**
 * MOD-08 HTTP surface. Key assertions: the triage list is manage-only, /me/helpdesk is self-scoped,
 * and ticket reads/comments gate on the requester-or-triage relationship the service enforces.
 */
import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import { eq } from "drizzle-orm";
import app from "../../src/app";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import { roles, user_roles } from "../../src/db/schema";
import { loginAs } from "../helpers/auth";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares/auth.middleware";
import { makeEmployee, ensureRole } from "../factories";

const API = "/api/hr";

async function grantRole(userId: number, roleName: string) {
  const [role] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
  await db.insert(user_roles).values({ user_id: userId, role_id: role.id }).onConflictDoNothing();
}

async function loginAsEmployee(role = "employee") {
  const { agent, user } = await loginAs(role);
  if (role !== "employee") await grantRole(user.id, "employee");
  clearPermissionCache(user.id);
  const employee = await makeEmployee({ userId: user.id, employmentType: "staff" });
  return { agent, user, employee };
}

describe("MOD-08 helpdesk API", () => {
  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    await ensureRole("employee");
    await ensureRole("admin");
    await grant("employee", "helpdesk", "create");
    await grant("admin", "helpdesk", "manage");
  });

  it("requires authentication", async () => {
    expect((await supertest(app).get(`${API}/me/helpdesk`)).status).toBe(401);
  });

  it("lets any employee raise a ticket and see it in /me/helpdesk", async () => {
    const employee = await loginAsEmployee();

    const created = await employee.agent
      .post(`${API}/helpdesk`)
      .send({ title: "VPN down", description: "Cannot connect", category: "IT" });
    expect(created.status).toBe(201);
    expect(created.body.ticket.status).toBe("OPEN");

    const mine = await employee.agent.get(`${API}/me/helpdesk`);
    expect(mine.status).toBe(200);
    expect(mine.body.tickets).toHaveLength(1);
  });

  it("restricts the triage list to helpdesk:manage", async () => {
    const employee = await loginAsEmployee();
    const staff = await loginAsEmployee("admin");

    expect((await employee.agent.get(`${API}/helpdesk`)).status).toBe(403);
    expect((await staff.agent.get(`${API}/helpdesk`)).status).toBe(200);
  });

  it("runs a full lifecycle over HTTP: create → assign → resolve → reopen", async () => {
    const requester = await loginAsEmployee();
    const staff = await loginAsEmployee("admin");

    const created = await requester.agent
      .post(`${API}/helpdesk`)
      .send({ title: "Printer jam", description: "3rd floor", category: "FACILITIES" });
    const id = created.body.ticket.id;

    const assigned = await staff.agent
      .patch(`${API}/helpdesk/${id}`)
      .send({ status: "IN_PROGRESS", assignee_user_id: staff.user.id });
    expect(assigned.body.ticket.status).toBe("IN_PROGRESS");

    const resolved = await staff.agent.patch(`${API}/helpdesk/${id}`).send({ status: "RESOLVED" });
    expect(resolved.body.ticket.status).toBe("RESOLVED");

    const reopened = await requester.agent.post(`${API}/helpdesk/${id}/reopen`).send({});
    expect(reopened.status).toBe(200);
    expect(reopened.body.ticket.status).toBe("REOPENED");
  });

  it("blocks a non-manager from transitioning a ticket", async () => {
    const requester = await loginAsEmployee();
    const stranger = await loginAsEmployee();

    const created = await requester.agent
      .post(`${API}/helpdesk`)
      .send({ title: "X", description: "Y", category: "IT" });

    // The route itself is manage-gated → 403 before the service.
    const res = await stranger.agent
      .patch(`${API}/helpdesk/${created.body.ticket.id}`)
      .send({ status: "RESOLVED" });
    expect(res.status).toBe(403);
  });

  it("filters the detail read by relationship and threads comments", async () => {
    const requester = await loginAsEmployee();
    const stranger = await loginAsEmployee();
    const staff = await loginAsEmployee("admin");

    const created = await requester.agent
      .post(`${API}/helpdesk`)
      .send({ title: "X", description: "Y", category: "IT" });
    const id = created.body.ticket.id;

    expect((await requester.agent.get(`${API}/helpdesk/${id}`)).status).toBe(200);
    expect((await staff.agent.get(`${API}/helpdesk/${id}`)).status).toBe(200);
    expect((await stranger.agent.get(`${API}/helpdesk/${id}`)).status).toBe(403);

    const comment = await requester.agent
      .post(`${API}/helpdesk/${id}/comments`)
      .send({ body: "Any progress?" });
    expect(comment.status).toBe(201);

    const detail = await requester.agent.get(`${API}/helpdesk/${id}`);
    expect(detail.body.comments).toHaveLength(1);

    // A stranger cannot comment.
    expect(
      (await stranger.agent.post(`${API}/helpdesk/${id}/comments`).send({ body: "sneaky" })).status,
    ).toBe(403);
  });

  it("rejects an illegal transition (e.g. from CLOSED)", async () => {
    const requester = await loginAsEmployee();
    const staff = await loginAsEmployee("admin");

    const created = await requester.agent
      .post(`${API}/helpdesk`)
      .send({ title: "X", description: "Y", category: "IT" });
    const id = created.body.ticket.id;

    await staff.agent.patch(`${API}/helpdesk/${id}`).send({ status: "CLOSED" });
    const bad = await staff.agent.patch(`${API}/helpdesk/${id}`).send({ status: "IN_PROGRESS" });
    expect(bad.status).toBe(400);
  });
});
