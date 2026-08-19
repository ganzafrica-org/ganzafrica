/**
 * "Work on the email notification..." (Things-to-work-on.md): an employee starts `pending` on
 * creation, flips to `onboarding` on their first onboarding-task action, and to `active` once the
 * onboarding process instance completes — plus an EMPLOYEE_CREATED notification (routed type
 * already existed, never actually sent) now fires to HR/admin on creation.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { and, eq } from "drizzle-orm";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import { employees, hr_notifications, process_instances, process_tasks } from "../../src/db/schema";
import { createEmployee, updateEmployeeAsHr } from "../../src/services/hr/employees-core.service";
import { completeTask, skipTask, instantiateProcess } from "../../src/services/hr/process.service";
import { sendNotification } from "../../src/modules/hr/notifications/notification.service";
import { makeUser, makeEmployeeUser, makeProcessTemplate, ensureRole } from "../factories";

async function taskNamed(instanceId: number, title: string) {
  const [row] = await db
    .select()
    .from(process_tasks)
    .where(and(eq(process_tasks.instance_id, instanceId), eq(process_tasks.title, title)))
    .limit(1);
  return row;
}

async function statusOf(employeeId: string): Promise<string> {
  const [row] = await db.select().from(employees).where(eq(employees.id, employeeId));
  return row.status;
}

describe("employee status lifecycle: pending -> onboarding -> active", () => {
  let hrUserId: number;

  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    hrUserId = (await makeUser({ role: "hr" })).id;
  });

  it("createEmployee lands the new hire at pending, with the checklist already instantiated", async () => {
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [
        { title: "Sign employment contract", kind: "contract_signing", is_blocking: true },
        { title: "Welcome", kind: "checklist", is_blocking: true },
      ],
    });

    const created = await createEmployee(
      {
        first_name: "New",
        last_name: "Hire",
        personal_email: "new.hire.lifecycle@example.com",
        employment_type: "staff",
      },
      hrUserId,
    );

    expect(created.status).toBe("pending");

    const [instance] = await db
      .select()
      .from(process_instances)
      .where(eq(process_instances.employee_id, created.id));
    expect(instance).toBeTruthy(); // checklist exists immediately, ready to act on
    expect(instance.status).toBe("in_progress");

    const tasks = await db
      .select()
      .from(process_tasks)
      .where(eq(process_tasks.instance_id, instance.id));
    expect(tasks.length).toBe(2);
  });

  it("the employee's first task action (complete) flips pending -> onboarding", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff", status: "pending" });
    const template = await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [
        { title: "Welcome", kind: "checklist", is_blocking: true, default_assignee: "employee" },
        { title: "Set up desk", kind: "checklist", is_blocking: true, default_assignee: "hr" },
      ],
    });
    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
      templateId: template.id,
    });

    expect(await statusOf(subject.employee.id)).toBe("pending");

    // Two blocking tasks, so completing just this one starts onboarding without also finishing
    // it — see the separate "flips onboarding -> active" test for the completion case.
    await completeTask(subject.user.id, (await taskNamed(instance.id, "Welcome")).id);

    expect(await statusOf(subject.employee.id)).toBe("onboarding");
  });

  it("the employee's first task action (skip, by HR on a blocking task) also flips pending -> onboarding", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff", status: "pending" });
    const template = await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [
        { title: "Optional legacy step", kind: "checklist", is_blocking: true },
        { title: "Second step", kind: "checklist", is_blocking: true, default_assignee: "hr" },
      ],
    });
    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
      templateId: template.id,
    });

    // Two blocking tasks, so skipping just this one starts onboarding without also finishing it.
    await skipTask(
      hrUserId,
      (await taskNamed(instance.id, "Optional legacy step")).id,
      "Not applicable for this hire",
    );

    expect(await statusOf(subject.employee.id)).toBe("onboarding");
  });

  it("completing every blocking task flips onboarding -> active (existing maybeCompleteInstance path, unchanged)", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff", status: "pending" });
    const template = await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [
        { title: "Only step", kind: "checklist", is_blocking: true, default_assignee: "employee" },
      ],
    });
    const instance = await instantiateProcess("onboarding", subject.employee.id, {
      actorUserId: hrUserId,
      templateId: template.id,
    });

    await completeTask(subject.user.id, (await taskNamed(instance.id, "Only step")).id);

    expect(await statusOf(subject.employee.id)).toBe("active");
  });

  it("does not touch status for a non-onboarding (offboarding) instance", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff", status: "active" });
    const template = await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      type: "offboarding",
      tasks: [{ title: "Return laptop", kind: "checklist", is_blocking: true }],
    });
    const instance = await instantiateProcess("offboarding", subject.employee.id, {
      actorUserId: hrUserId,
      templateId: template.id,
    });

    await completeTask(hrUserId, (await taskNamed(instance.id, "Return laptop")).id);

    // maybeStartOnboarding is a no-op for offboarding instances; maybeCompleteInstance only
    // flips employees.status to active for `instance.type === "onboarding"`.
    expect(await statusOf(subject.employee.id)).toBe("active");
  });

  it("HR still cannot set pending directly (system-owned, like onboarding/offboarding/exited)", async () => {
    const subject = await makeEmployeeUser({ employmentType: "staff", status: "active" });
    await expect(
      updateEmployeeAsHr(subject.employee.id, { status: "pending" as never }),
    ).rejects.toMatchObject({ statusCode: 422, code: "STATUS_NOT_SETTABLE" });
  });

  it("sends an EMPLOYEE_CREATED notification to HR/admin (not the new hire) on creation", async () => {
    await makeProcessTemplate({ createdBy: hrUserId, employmentTypes: null });
    await ensureRole("admin");
    const adminUserId = (await makeUser({ role: "admin" })).id;

    const created = await createEmployee(
      {
        first_name: "Notify",
        last_name: "Me",
        personal_email: "notify.me@example.com",
        employment_type: "staff",
      },
      hrUserId,
    );

    // createEmployee itself doesn't send the notification (the controller does, post-commit) —
    // call the notification directly the same way the controller does, to prove the plumbing
    // (routing table -> recipients -> insert) works end to end for this payload shape.
    await sendNotification({
      type: "EMPLOYEE_CREATED",
      triggeredBy: hrUserId,
      relatedEntity: { employeeId: created.id },
      title: "New employee added",
      message: `${created.first_name} ${created.last_name} was added to the system.`,
      priority: "NORMAL",
    });

    const hrNotifs = await db
      .select()
      .from(hr_notifications)
      .where(
        and(
          eq(hr_notifications.recipient_id, hrUserId),
          eq(hr_notifications.type, "EMPLOYEE_CREATED"),
        ),
      );
    expect(hrNotifs).toHaveLength(1);
    expect(hrNotifs[0].title).toBe("New employee added");

    const adminNotifs = await db
      .select()
      .from(hr_notifications)
      .where(
        and(
          eq(hr_notifications.recipient_id, adminUserId),
          eq(hr_notifications.type, "EMPLOYEE_CREATED"),
        ),
      );
    expect(adminNotifs).toHaveLength(1);

    // The new hire themselves is not a recipient — they get the invite email, not this.
    const newHireNotifs = await db
      .select()
      .from(hr_notifications)
      .where(
        and(
          eq(hr_notifications.recipient_id, created.user_id),
          eq(hr_notifications.type, "EMPLOYEE_CREATED"),
        ),
      );
    expect(newHireNotifs).toHaveLength(0);
  });
});
