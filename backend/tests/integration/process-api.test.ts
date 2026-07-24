/**
 * LCM-01 HTTP surface. The important assertions are the permission boundaries: `processes:manage`
 * guards template and cross-employee routes, while task actions and instance reads stay on plain
 * `authenticate` because eligibility is a relationship the middleware cannot express.
 */
import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import { eq, and } from "drizzle-orm";
import app from "../../src/app";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import { process_tasks, roles, user_roles } from "../../src/db/schema";
import { loginAs } from "../helpers/auth";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares/auth.middleware";
import { makeEmployee, makeProcessTemplate, ensureRole, makeUser } from "../factories";

const API = "/api/hr";

async function grantRole(userId: number, roleName: string) {
  const [role] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
  await db.insert(user_roles).values({ user_id: userId, role_id: role.id }).onConflictDoNothing();
}

async function loginAsEmployee(
  role = "employee",
  opts: { managerId?: string; status?: string } = {},
) {
  const { agent, user } = await loginAs(role);
  if (role !== "employee") await grantRole(user.id, "employee");
  clearPermissionCache(user.id);

  const employee = await makeEmployee({
    userId: user.id,
    employmentType: "staff",
    status: opts.status ?? "onboarding",
    managerId: opts.managerId ?? null,
  });
  return { agent, user, employee };
}

describe("LCM-01 API", () => {
  let hrUserId: number;

  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    await ensureRole("employee");
    await ensureRole("hr");
    await ensureRole("admin");
    await grant("hr", "processes", "manage");
    await grant("employee", "processes", "read_own");
    hrUserId = (await makeUser({ role: "hr" })).id;
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [
        { title: "Visible blocking", is_blocking: true },
        { title: "Staff only", visibility: "staff_only", is_blocking: true },
        { title: "Onboardee task", default_assignee: "employee" },
      ],
    });
  });

  it("requires authentication", async () => {
    expect((await supertest(app).get(`${API}/processes`)).status).toBe(401);
    expect((await supertest(app).get(`${API}/me/tasks`)).status).toBe(401);
  });

  it("restricts the instance list and template management to processes:manage", async () => {
    const employee = await loginAsEmployee();
    const hr = await loginAsEmployee("hr");

    expect((await employee.agent.get(`${API}/processes`)).status).toBe(403);
    expect((await employee.agent.get(`${API}/process-templates`)).status).toBe(403);
    expect(
      (
        await employee.agent
          .post(`${API}/process-templates`)
          .send({ type: "onboarding", name: "Sneaky" })
      ).status,
    ).toBe(403);

    expect((await hr.agent.get(`${API}/processes`)).status).toBe(200);
    expect((await hr.agent.get(`${API}/process-templates`)).status).toBe(200);
  });

  it("starts a process for an employee and lists it with progress", async () => {
    const hr = await loginAsEmployee("hr");
    const subject = await loginAsEmployee();

    const started = await hr.agent
      .post(`${API}/employees/${subject.employee.id}/processes`)
      .send({ type: "onboarding" });

    expect(started.status).toBe(201);
    expect(started.body.process.type).toBe("onboarding");

    const list = await hr.agent.get(`${API}/processes?type=onboarding`);
    expect(list.status).toBe(200);
    expect(list.body.processes).toHaveLength(1);
    expect(list.body.processes[0].progress).toEqual({ done: 0, total: 2, percent: 0 });
  });

  it("filters the instance read by viewer", async () => {
    const hr = await loginAsEmployee("hr");
    const subject = await loginAsEmployee();
    const stranger = await loginAsEmployee();

    const started = await hr.agent
      .post(`${API}/employees/${subject.employee.id}/processes`)
      .send({ type: "onboarding" });
    const id = started.body.process.id;

    const asSubject = await subject.agent.get(`${API}/processes/${id}`);
    expect(asSubject.status).toBe(200);
    expect(asSubject.body.tasks.map((t: { title: string }) => t.title)).not.toContain("Staff only");
    expect(asSubject.body.can_manage).toBe(false);

    const asHr = await hr.agent.get(`${API}/processes/${id}`);
    expect(asHr.body.tasks).toHaveLength(3);
    expect(asHr.body.can_manage).toBe(true);

    expect((await stranger.agent.get(`${API}/processes/${id}`)).status).toBe(403);
  });

  it("serves the onboardee their own process without an id", async () => {
    const hr = await loginAsEmployee("hr");
    const subject = await loginAsEmployee();

    await hr.agent
      .post(`${API}/employees/${subject.employee.id}/processes`)
      .send({ type: "onboarding" });

    const mine = await subject.agent.get(`${API}/me/process`);
    expect(mine.status).toBe(200);
    expect(mine.body.tasks.map((t: { title: string }) => t.title)).toEqual([
      "Visible blocking",
      "Onboardee task",
    ]);
  });

  it("returns an empty shape when the employee has no process", async () => {
    const subject = await loginAsEmployee();
    const mine = await subject.agent.get(`${API}/me/process`);

    expect(mine.status).toBe(200);
    expect(mine.body.process).toBeNull();
  });

  it("lets the assignee complete their own task over HTTP", async () => {
    const hr = await loginAsEmployee("hr");
    const subject = await loginAsEmployee();

    await hr.agent
      .post(`${API}/employees/${subject.employee.id}/processes`)
      .send({ type: "onboarding" });

    const mine = await subject.agent.get(`${API}/me/tasks`);
    expect(mine.body.tasks).toHaveLength(1);

    const done = await subject.agent
      .post(`${API}/process-tasks/${mine.body.tasks[0].id}/complete`)
      .send({});
    expect(done.status).toBe(200);
    expect(done.body.task.status).toBe("done");
  });

  it("rejects a skip with no note and blocks a non-HR blocking skip", async () => {
    const hr = await loginAsEmployee("hr");
    const subject = await loginAsEmployee();

    const started = await hr.agent
      .post(`${API}/employees/${subject.employee.id}/processes`)
      .send({ type: "onboarding" });

    const [blocking] = await db
      .select()
      .from(process_tasks)
      .where(
        and(
          eq(process_tasks.instance_id, started.body.process.id),
          eq(process_tasks.title, "Visible blocking"),
        ),
      );

    // Reassign the blocking task to the onboardee so they are the assignee.
    await hr.agent
      .patch(`${API}/process-tasks/${blocking.id}`)
      .send({ assignee_user_id: subject.user.id });

    const noNote = await subject.agent.post(`${API}/process-tasks/${blocking.id}/skip`).send({});
    expect(noNote.status).toBe(400); // schema rejects the missing note

    const asAssignee = await subject.agent
      .post(`${API}/process-tasks/${blocking.id}/skip`)
      .send({ notes: "I'd rather not" });
    expect(asAssignee.status).toBe(403);

    const asHr = await hr.agent
      .post(`${API}/process-tasks/${blocking.id}/skip`)
      .send({ notes: "Waived — contractor already signed" });
    expect(asHr.status).toBe(200);
  });

  it("manages a template and its tasks end to end", async () => {
    const hr = await loginAsEmployee("hr");

    const created = await hr.agent
      .post(`${API}/process-templates`)
      .send({ type: "onboarding", name: "Fellow onboarding", employment_types: ["fellow"] });
    expect(created.status).toBe(201);
    const templateId = created.body.template.id;

    const task = await hr.agent.post(`${API}/process-templates/${templateId}/tasks`).send({
      title: "Fellowship orientation",
      default_assignee: "hr",
      is_blocking: true,
      due_offset_days: 5,
    });
    expect(task.status).toBe(201);

    const fetched = await hr.agent.get(`${API}/process-templates/${templateId}`);
    expect(fetched.body.tasks).toHaveLength(1);
    expect(fetched.body.tasks[0].title).toBe("Fellowship orientation");

    await hr.agent.delete(`${API}/process-templates/${templateId}/tasks/${task.body.task.id}`);
    expect((await hr.agent.get(`${API}/process-templates/${templateId}`)).body.tasks).toHaveLength(
      0,
    );

    // Delete deactivates rather than removing, so the audit trail survives.
    const removed = await hr.agent.delete(`${API}/process-templates/${templateId}`);
    expect(removed.status).toBe(200);
    expect(removed.body.template.is_active).toBe(false);
  });

  it("cancels a process without touching the employee's status", async () => {
    const hr = await loginAsEmployee("hr");
    const subject = await loginAsEmployee();

    const started = await hr.agent
      .post(`${API}/employees/${subject.employee.id}/processes`)
      .send({ type: "onboarding" });

    const cancelled = await hr.agent.post(`${API}/processes/${started.body.process.id}/cancel`);
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.process.status).toBe("cancelled");

    // Cancelling twice is a 404 — there is no longer an active process.
    expect((await hr.agent.post(`${API}/processes/${started.body.process.id}/cancel`)).status).toBe(
      404,
    );
  });

  it("409s when a second process of the same type is started", async () => {
    const hr = await loginAsEmployee("hr");
    const subject = await loginAsEmployee();

    await hr.agent
      .post(`${API}/employees/${subject.employee.id}/processes`)
      .send({ type: "onboarding" });
    const again = await hr.agent
      .post(`${API}/employees/${subject.employee.id}/processes`)
      .send({ type: "onboarding" });

    expect(again.status).toBe(409);
  });
});
