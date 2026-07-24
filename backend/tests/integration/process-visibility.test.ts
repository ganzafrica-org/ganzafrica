/**
 * LCM-01 §6.2/§6.3 — who may see an instance and what they see of it, plus who may complete or
 * skip a task. The subject employee must never receive staff_only rows, and their progress must be
 * computed over the tasks they can actually see.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { eq, and } from "drizzle-orm";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import { employees, process_tasks } from "../../src/db/schema";
import {
  instantiateProcess,
  getProcessForViewer,
  completeTask,
  skipTask,
  listMyTasks,
} from "../../src/services/hr/process.service";
import { makeEmployeeUser, makeProcessTemplate, makeUser, ensureRole } from "../factories";

const TEMPLATE_TASKS = [
  { title: "Visible blocking", visibility: "all" as const, is_blocking: true },
  { title: "Staff only", visibility: "staff_only" as const, is_blocking: true },
  { title: "Onboardee task", default_assignee: "employee" as const, visibility: "all" as const },
];

describe("LCM-01 visibility", () => {
  let hrUserId: number;

  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    hrUserId = (await makeUser({ role: "hr" })).id;
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: TEMPLATE_TASKS,
    });
  });

  it("hides staff_only tasks from the subject and counts progress over visible ones", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff" });
    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });

    const asSubject = await getProcessForViewer(subject.user.id, instance.id);
    expect(asSubject.tasks.map((t) => t.title)).toEqual(["Visible blocking", "Onboardee task"]);
    expect(asSubject.progress.total).toBe(1); // only the visible blocking task counts

    const asHr = await getProcessForViewer(hrUserId, instance.id);
    expect(asHr.tasks).toHaveLength(3);
    expect(asHr.progress.total).toBe(2);
  });

  it("denies an unrelated employee with 403", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff" });
    const stranger = await makeEmployeeUser({ employmentType: "staff" });
    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });

    await expect(getProcessForViewer(stranger.user.id, instance.id)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("lets the subject's manager see their reports' instance", async () => {
    const manager = await makeEmployeeUser({ employmentType: "staff" });
    const subject = await makeEmployeeUser({
      employmentType: "staff",
      managerId: manager.employee.id,
    });
    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });

    const view = await getProcessForViewer(manager.user.id, instance.id);
    expect(view.tasks.length).toBeGreaterThan(0);
  });

  it("lets a task assignee see the instance even with no other relationship", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff" });
    const helper = await makeEmployeeUser({ employmentType: "staff" });
    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });

    await db
      .update(process_tasks)
      .set({ assignee_user_id: helper.user.id })
      .where(
        and(eq(process_tasks.instance_id, instance.id), eq(process_tasks.title, "Staff only")),
      );

    const view = await getProcessForViewer(helper.user.id, instance.id);
    expect(view.tasks.map((t) => t.title)).toContain("Staff only");
  });

  it("returns only my open tasks across instances from listMyTasks", async () => {
    const a = await makeEmployeeUser({ employmentType: "staff" });
    const b = await makeEmployeeUser({ employmentType: "staff" });
    await instantiateProcess("onboarding", a.employee.id, { actorUserId: hrUserId });
    await instantiateProcess("onboarding", b.employee.id, { actorUserId: hrUserId });

    const mine = await listMyTasks(a.user.id);
    expect(mine).toHaveLength(1);
    expect(mine[0].title).toBe("Onboardee task");

    const hrTasks = await listMyTasks(hrUserId);
    expect(hrTasks.length).toBe(4); // two instances × two hr-assigned tasks
  });
});

describe("LCM-01 completion rules", () => {
  let hrUserId: number;

  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    hrUserId = (await makeUser({ role: "hr" })).id;
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: TEMPLATE_TASKS,
    });
  });

  async function setup() {
    // A real hire lands in 'onboarding'; the factory defaults to 'active'.
    const subject = await makeEmployeeUser({ employmentType: "staff", status: "onboarding" });
    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });
    const tasks = await db
      .select()
      .from(process_tasks)
      .where(eq(process_tasks.instance_id, instance.id));
    const byTitle = Object.fromEntries(tasks.map((t) => [t.title, t]));
    return { subject, instance, byTitle };
  }

  it("lets the assignee complete their own task", async () => {
    const { subject, byTitle } = await setup();
    const done = await completeTask(subject.user.id, byTitle["Onboardee task"].id);
    expect(done.status).toBe("done");
    expect(done.completed_by).toBe(subject.user.id);
  });

  it("denies a non-assignee, non-HR completer with 403", async () => {
    const { byTitle } = await setup();
    const stranger = await makeEmployeeUser({ employmentType: "staff" });

    await expect(
      completeTask(stranger.user.id, byTitle["Onboardee task"].id),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("lets HR complete any task", async () => {
    const { byTitle } = await setup();
    const done = await completeTask(hrUserId, byTitle["Onboardee task"].id);
    expect(done.status).toBe("done");
  });

  it("refuses to skip a blocking task as the assignee, allows HR with notes", async () => {
    const { subject, byTitle } = await setup();

    await db
      .update(process_tasks)
      .set({ assignee_user_id: subject.user.id })
      .where(eq(process_tasks.id, byTitle["Visible blocking"].id));

    await expect(
      skipTask(subject.user.id, byTitle["Visible blocking"].id, "not needed"),
    ).rejects.toMatchObject({ statusCode: 403 });

    const skipped = await skipTask(hrUserId, byTitle["Visible blocking"].id, "Waived by HR");
    expect(skipped.status).toBe("skipped");
    expect(skipped.notes).toBe("Waived by HR");
  });

  it("requires notes to skip", async () => {
    const { byTitle } = await setup();
    await expect(skipTask(hrUserId, byTitle["Onboardee task"].id, "  ")).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  it("flips the employee to active once the last blocking task completes", async () => {
    const { subject, instance, byTitle } = await setup();

    await completeTask(hrUserId, byTitle["Visible blocking"].id);
    let [row] = await db.select().from(employees).where(eq(employees.id, subject.employee.id));
    expect(row.status).toBe("onboarding"); // one blocking task still open

    await completeTask(hrUserId, byTitle["Staff only"].id);

    [row] = await db.select().from(employees).where(eq(employees.id, subject.employee.id));
    expect(row.status).toBe("active");

    const view = await getProcessForViewer(hrUserId, instance.id);
    expect(view.instance.status).toBe("completed");
    // The non-blocking task stays actionable after completion.
    expect(view.tasks.find((t) => t.title === "Onboardee task")!.status).toBe("pending");
  });

  it("refuses to complete an already-completed task", async () => {
    const { byTitle } = await setup();
    await completeTask(hrUserId, byTitle["Onboardee task"].id);
    await expect(completeTask(hrUserId, byTitle["Onboardee task"].id)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
