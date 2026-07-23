/**
 * LCM-01 §6.1 — template selection, assignee resolution, due-date offsets, and the guarantee that
 * editing a template never rewrites a checklist someone is already partway through.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import { process_template_tasks, process_tasks } from "../../src/db/schema";
import { instantiateProcess, getProcessForViewer } from "../../src/services/hr/process.service";
import { makeEmployeeUser, makeProcessTemplate, makeUser, ensureRole } from "../factories";

async function tasksOf(instanceId: number) {
  return db
    .select()
    .from(process_tasks)
    .where(eq(process_tasks.instance_id, instanceId))
    .orderBy(process_tasks.sort_order);
}

describe("LCM-01 instantiation", () => {
  let hrUserId: number;

  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    await ensureRole("it");
    await ensureRole("finance");
    hrUserId = (await makeUser({ role: "hr" })).id;
  });

  it("picks the template matching the employee's employment type over the generic one", async () => {
    await makeProcessTemplate({
      createdBy: hrUserId,
      name: "Generic",
      employmentTypes: null,
      tasks: [{ title: "Generic task" }],
    });
    await makeProcessTemplate({
      createdBy: hrUserId,
      name: "Fellow onboarding",
      employmentTypes: ["fellow"],
      tasks: [{ title: "Fellow task" }],
    });

    const { employee } = await makeEmployeeUser({ employmentType: "fellow" });
    const instance = await instantiateProcess("onboarding", employee.id, { actorUserId: hrUserId });

    const tasks = await tasksOf(instance.id);
    expect(tasks.map((t) => t.title)).toEqual(["Fellow task"]);
  });

  it("falls back to the generic template when no employment type matches", async () => {
    await makeProcessTemplate({
      createdBy: hrUserId,
      name: "Generic",
      employmentTypes: null,
      tasks: [{ title: "Generic task" }],
    });

    const { employee } = await makeEmployeeUser({ employmentType: "contractor" });
    const instance = await instantiateProcess("onboarding", employee.id, { actorUserId: hrUserId });

    expect((await tasksOf(instance.id)).map((t) => t.title)).toEqual(["Generic task"]);
  });

  it("ignores inactive templates", async () => {
    await makeProcessTemplate({
      createdBy: hrUserId,
      name: "Retired",
      employmentTypes: ["staff"],
      isActive: false,
      tasks: [{ title: "Old task" }],
    });

    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await expect(
      instantiateProcess("onboarding", employee.id, { actorUserId: hrUserId }),
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  it("resolves each assignee class to a real user", async () => {
    const itUser = await makeUser({ role: "it" });
    const financeUser = await makeUser({ role: "finance" });
    const manager = await makeEmployeeUser({ employmentType: "staff" });
    const { employee, user } = await makeEmployeeUser({
      employmentType: "staff",
      managerId: manager.employee.id,
    });

    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [
        { title: "HR task", default_assignee: "hr" },
        { title: "IT task", default_assignee: "it" },
        { title: "Finance task", default_assignee: "finance" },
        { title: "Manager task", default_assignee: "manager" },
        { title: "Employee task", default_assignee: "employee" },
      ],
    });

    const instance = await instantiateProcess("onboarding", employee.id, {
      actorUserId: hrUserId,
    });
    const tasks = await tasksOf(instance.id);
    const byTitle = Object.fromEntries(tasks.map((t) => [t.title, t.assignee_user_id]));

    expect(byTitle["HR task"]).toBe(hrUserId);
    expect(byTitle["IT task"]).toBe(itUser.id);
    expect(byTitle["Finance task"]).toBe(financeUser.id);
    expect(byTitle["Manager task"]).toBe(manager.user.id);
    expect(byTitle["Employee task"]).toBe(user.id);
  });

  it("falls back to the HR owner and flags unresolved assignees when there is no manager", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" }); // no manager

    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Manager task", default_assignee: "manager" }],
    });

    const instance = await instantiateProcess("onboarding", employee.id, {
      actorUserId: hrUserId,
    });

    const [task] = await tasksOf(instance.id);
    expect(task.assignee_user_id).toBe(hrUserId);
    expect(instance.unresolved_assignees).toContain("manager");
  });

  it("leaves the task unassigned and flags it when nobody holds the role", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "IT task", default_assignee: "it" }], // no it-role user exists
    });

    const instance = await instantiateProcess("onboarding", employee.id, {
      actorUserId: hrUserId,
    });

    const [task] = await tasksOf(instance.id);
    expect(task.assignee_user_id).toBeNull();
    expect(instance.unresolved_assignees).toContain("it");
  });

  it("computes due dates from the offset relative to the start", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [
        { title: "Day zero", due_offset_days: 0 },
        { title: "Day seven", due_offset_days: 7 },
        { title: "No due date", due_offset_days: null },
      ],
    });

    const instance = await instantiateProcess("onboarding", employee.id, {
      actorUserId: hrUserId,
      startedAt: new Date("2026-03-02T00:00:00Z"),
    });

    const byTitle = Object.fromEntries(
      (await tasksOf(instance.id)).map((t) => [t.title, t.due_date]),
    );
    expect(byTitle["Day zero"]).toBe("2026-03-02");
    expect(byTitle["Day seven"]).toBe("2026-03-09");
    expect(byTitle["No due date"]).toBeNull();
  });

  it("snapshots tasks — editing the template afterwards leaves in-flight instances untouched", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    const { template, tasks } = await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Original title" }],
    });

    const instance = await instantiateProcess("onboarding", employee.id, {
      actorUserId: hrUserId,
    });

    await db
      .update(process_template_tasks)
      .set({ title: "Renamed after the fact" })
      .where(eq(process_template_tasks.id, tasks[0].id));
    await db.insert(process_template_tasks).values({
      template_id: template.id,
      title: "Added after the fact",
      sort_order: 99,
      default_assignee: "hr",
    });

    const snapshot = await tasksOf(instance.id);
    expect(snapshot).toHaveLength(1);
    expect(snapshot[0].title).toBe("Original title");
  });

  it("refuses a second active instance of the same type", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await makeProcessTemplate({ createdBy: hrUserId, employmentTypes: null });

    await instantiateProcess("onboarding", employee.id, { actorUserId: hrUserId });
    await expect(
      instantiateProcess("onboarding", employee.id, { actorUserId: hrUserId }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("404s for an unknown employee", async () => {
    await makeProcessTemplate({ createdBy: hrUserId, employmentTypes: null });
    await expect(
      instantiateProcess("onboarding", "00000000-0000-0000-0000-000000000000", {
        actorUserId: hrUserId,
      }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("reports progress over blocking tasks only", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [
        { title: "Blocking A", is_blocking: true },
        { title: "Blocking B", is_blocking: true },
        { title: "Optional", is_blocking: false },
      ],
    });

    const instance = await instantiateProcess("onboarding", employee.id, {
      actorUserId: hrUserId,
    });
    const view = await getProcessForViewer(hrUserId, instance.id);

    expect(view.progress).toEqual({ done: 0, total: 2, percent: 0 });
  });
});
