/**
 * LCM-01 — engine paths the main suites reach only indirectly: overdue sweep, template edits,
 * asset_assignment, reassignment, listing filters, and the offboarding branch of completion
 * (which LCM-02 will extend rather than replace).
 */
import { describe, it, expect, beforeEach } from "vitest";
import { eq, and } from "drizzle-orm";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import {
  employees,
  hr_assets,
  hr_asset_categories,
  hr_notifications,
  process_tasks,
} from "../../src/db/schema";
import {
  instantiateProcess,
  completeTask,
  skipTask,
  reassignTask,
  listProcesses,
  listTemplates,
  updateTemplate,
  deactivateTemplate,
  removeTemplateTask,
  addTemplateTask,
  getTemplate,
  notifyOverdueTasks,
  cancelProcess,
  getProcessForViewer,
} from "../../src/services/hr/process.service";
import { makeEmployeeUser, makeProcessTemplate, makeUser, ensureRole } from "../factories";

async function taskNamed(instanceId: number, title: string) {
  const [row] = await db
    .select()
    .from(process_tasks)
    .where(and(eq(process_tasks.instance_id, instanceId), eq(process_tasks.title, title)))
    .limit(1);
  return row;
}

describe("LCM-01 overdue sweep", () => {
  let hrUserId: number;

  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    hrUserId = (await makeUser({ role: "hr" })).id;
  });

  it("notifies assignees of tasks past their due date", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Late task", due_offset_days: 0 }],
    });

    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
      startedAt: new Date("2020-01-06T00:00:00Z"), // long past
    });

    const { notified } = await notifyOverdueTasks();
    expect(notified).toBe(1);

    const rows = await db
      .select()
      .from(hr_notifications)
      .where(eq(hr_notifications.type, "PROCESS_TASK_OVERDUE"));
    expect(rows.length).toBeGreaterThan(0);

    // Completing it takes it out of the sweep.
    await completeTask(hrUserId, (await taskNamed(instance.id, "Late task")).id);
    expect((await notifyOverdueTasks()).notified).toBe(0);
  });

  it("reports nothing when no task is overdue", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Future task", due_offset_days: 30 }],
    });
    await instantiateProcess("onboarding", subject.employee.id, { actorUserId: hrUserId });

    expect((await notifyOverdueTasks()).notified).toBe(0);
  });

  it("ignores tasks on a cancelled process", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Late task", due_offset_days: 0 }],
    });
    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
      startedAt: new Date("2020-01-06T00:00:00Z"),
    });

    await cancelProcess(instance.id);
    expect((await notifyOverdueTasks()).notified).toBe(0);
  });
});

describe("LCM-01 template editing", () => {
  let hrUserId: number;

  beforeEach(async () => {
    await resetDb();
    await ensureRole("hr");
    hrUserId = (await makeUser({ role: "hr" })).id;
  });

  it("renames a template and narrows it to employment types", async () => {
    const { template } = await makeProcessTemplate({ createdBy: hrUserId, employmentTypes: null });

    const renamed = await updateTemplate(template.id, {
      name: "Fellow onboarding",
      employment_types: ["fellow", "analyst"],
    });
    expect(renamed.name).toBe("Fellow onboarding");
    expect(renamed.employment_types).toEqual(["fellow", "analyst"]);
  });

  it("deactivates rather than deleting, and lists by type", async () => {
    const { template } = await makeProcessTemplate({ createdBy: hrUserId, type: "onboarding" });
    await makeProcessTemplate({ createdBy: hrUserId, type: "offboarding" });

    expect(await listTemplates()).toHaveLength(2);
    expect(await listTemplates("offboarding")).toHaveLength(1);

    const off = await deactivateTemplate(template.id);
    expect(off.is_active).toBe(false);
    expect(await listTemplates("onboarding")).toHaveLength(1); // still listed, just inactive
  });

  it("appends template tasks with an incrementing sort order", async () => {
    const { template } = await makeProcessTemplate({ createdBy: hrUserId, tasks: [] });

    const first = await addTemplateTask(template.id, { title: "One", default_assignee: "hr" });
    const second = await addTemplateTask(template.id, { title: "Two", default_assignee: "it" });

    expect(first.sort_order).toBe(0);
    expect(second.sort_order).toBe(1);

    const detail = await getTemplate(template.id);
    expect(detail.tasks.map((t) => t.title)).toEqual(["One", "Two"]);

    await removeTemplateTask(first.id);
    expect((await getTemplate(template.id)).tasks).toHaveLength(1);
  });

  it("404s on unknown template ids", async () => {
    await expect(getTemplate(999999)).rejects.toMatchObject({ statusCode: 404 });
    await expect(updateTemplate(999999, { name: "x" })).rejects.toMatchObject({ statusCode: 404 });
    await expect(removeTemplateTask(999999)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("LCM-01 task reassignment and listing", () => {
  let hrUserId: number;

  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    hrUserId = (await makeUser({ role: "hr" })).id;
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Task", is_blocking: true }],
    });
  });

  it("reassigns, reschedules, and links a task", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff" });
    const helper = await makeEmployeeUser({ employmentType: "staff" });
    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });
    const task = await taskNamed(instance.id, "Task");

    const patched = await reassignTask(task.id, {
      assignee_user_id: helper.user.id,
      due_date: "2026-12-01",
      link_ref: { asset_id: "abc" },
    });

    expect(patched.assignee_user_id).toBe(helper.user.id);
    expect(patched.due_date).toBe("2026-12-01");
    expect(patched.link_ref).toEqual({ asset_id: "abc" });

    // Unassigning is explicit, not an accident of an omitted field.
    expect((await reassignTask(task.id, { assignee_user_id: null })).assignee_user_id).toBeNull();
    await expect(reassignTask(999999, { due_date: null })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("filters the instance list by type, status, and employee", async () => {
    const a = await makeEmployeeUser({ employmentType: "staff" });
    const b = await makeEmployeeUser({ employmentType: "staff" });

    const first = await instantiateProcess("onboarding", a.employee.id, { actorUserId: hrUserId });
    await instantiateProcess("onboarding", b.employee.id, { actorUserId: hrUserId });
    await cancelProcess(first.id);

    expect(await listProcesses({ type: "onboarding" })).toHaveLength(2);
    expect(await listProcesses({ status: "cancelled" })).toHaveLength(1);
    expect(await listProcesses({ employeeId: b.employee.id })).toHaveLength(1);
    expect(await listProcesses({ type: "offboarding" })).toHaveLength(0);
  });

  it("carries the employee and overdue count on list rows", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff", firstName: "Ada" });
    await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
      startedAt: new Date("2020-01-06T00:00:00Z"),
    });

    const [row] = await listProcesses({ type: "onboarding" });
    expect(row.employee.first_name).toBe("Ada");
    expect(row.progress.total).toBe(1);
  });
});

describe("LCM-01 asset_assignment kind", () => {
  let hrUserId: number;

  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    hrUserId = (await makeUser({ role: "hr" })).id;
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Issue laptop", kind: "asset_assignment", default_assignee: "it" }],
    });
  });

  it("requires a real asset to be linked", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff" });
    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });
    const task = await taskNamed(instance.id, "Issue laptop");

    await expect(completeTask(hrUserId, task.id)).rejects.toMatchObject({ statusCode: 422 });

    await reassignTask(task.id, {
      link_ref: { asset_id: "00000000-0000-0000-0000-000000000000" },
    });
    await expect(completeTask(hrUserId, task.id)).rejects.toMatchObject({ statusCode: 422 });

    const unique = Date.now();
    const [category] = await db
      .insert(hr_asset_categories)
      .values({ name: `Laptops ${unique}`, slug: `laptops-${unique}` } as never)
      .returning();
    const [asset] = await db
      .insert(hr_assets)
      .values({
        device_name: "MacBook Pro",
        serial_number: `SN-${Date.now()}`,
        category_id: category.id,
        status: "ASSIGNED",
      })
      .returning();

    await reassignTask(task.id, { link_ref: { asset_id: asset.id } });
    expect((await completeTask(hrUserId, task.id)).status).toBe("done");
  });
});

describe("LCM-01 completion edge cases", () => {
  let hrUserId: number;

  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    hrUserId = (await makeUser({ role: "hr" })).id;
  });

  it("skipping the last blocking task also completes the instance", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff", status: "onboarding" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Only step", is_blocking: true }],
    });

    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });
    await skipTask(hrUserId, (await taskNamed(instance.id, "Only step")).id, "Not applicable");

    const view = await getProcessForViewer(hrUserId, instance.id);
    expect(view.instance.status).toBe("completed");

    const [row] = await db.select().from(employees).where(eq(employees.id, subject.employee.id));
    expect(row.status).toBe("active");
  });

  it("a template with no blocking tasks completes immediately on the first action", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff", status: "onboarding" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [{ title: "Optional", is_blocking: false }],
    });

    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
    });
    await completeTask(hrUserId, (await taskNamed(instance.id, "Optional")).id);

    expect((await getProcessForViewer(hrUserId, instance.id)).instance.status).toBe("completed");
  });

  it("does not flip employee status for an offboarding instance", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff", status: "offboarding" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      type: "offboarding",
      employmentTypes: null,
      tasks: [{ title: "Return laptop", is_blocking: true }],
    });

    const instance = await instantiateProcess("offboarding", subject.employee.id, {
      actorUserId: hrUserId,
      offboardingReason: "resignation",
      lastWorkingDay: "2026-12-31",
      grantAlumni: true,
    });
    expect(instance.offboarding_reason).toBe("resignation");
    expect(instance.grant_alumni).toBe(true);

    await completeTask(hrUserId, (await taskNamed(instance.id, "Return laptop")).id);

    // LCM-02 owns the exit side-effects; LCM-01 must not silently mark them active.
    const [row] = await db.select().from(employees).where(eq(employees.id, subject.employee.id));
    expect(row.status).toBe("offboarding");
  });

  it("anchors offboarding offsets to the last working day, including negatives", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff", status: "offboarding" });
    await makeProcessTemplate({
      createdBy: hrUserId,
      type: "offboarding",
      employmentTypes: null,
      tasks: [
        { title: "Two days before", due_offset_days: -2 },
        { title: "On the day", due_offset_days: 0 },
      ],
    });

    const instance = await instantiateProcess("offboarding", subject.employee.id, {
      actorUserId: hrUserId,
      anchorDate: new Date("2026-12-31T00:00:00Z"),
      lastWorkingDay: "2026-12-31",
    });

    expect((await taskNamed(instance.id, "Two days before")).due_date).toBe("2026-12-29");
    expect((await taskNamed(instance.id, "On the day")).due_date).toBe("2026-12-31");
  });

  it("404s completing or skipping an unknown task", async () => {
    await expect(completeTask(hrUserId, 999999)).rejects.toMatchObject({ statusCode: 404 });
    await expect(skipTask(hrUserId, 999999, "note")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("404s reading an unknown process", async () => {
    await expect(getProcessForViewer(hrUserId, 999999)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("uses an explicit template id when given, and 404s on a bad one", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff" });
    const { template } = await makeProcessTemplate({
      createdBy: hrUserId,
      name: "Explicit",
      employmentTypes: ["fellow"], // would not match 'staff' automatically
      tasks: [{ title: "Chosen step" }],
    });

    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
      templateId: template.id,
    });
    expect(await taskNamed(instance.id, "Chosen step")).toBeTruthy();

    const other = await makeEmployeeUser({ employmentType: "staff" });
    await expect(
      instantiateProcess("onboarding", other.employee.id, {
        actorUserId: hrUserId,
        templateId: 999999,
      }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
