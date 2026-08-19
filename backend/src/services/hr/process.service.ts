/**
 * Lifecycle process engine — type-agnostic so LCM-02 offboarding reuses it wholesale.
 *
 * Two invariants shape the design:
 *  - Tasks are snapshotted onto the instance at creation. Editing a template must never rewrite a
 *    checklist somebody is already working through.
 *  - Reads are filtered by viewer in the service, not the client. The subject employee must never
 *    receive `staff_only` rows, and their progress is computed over what they can actually see.
 */
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db, withDbTransaction, type DbTransaction } from "@/db/client";
import {
  employees,
  hr_contracts,
  hr_documents,
  hr_assets,
  process_instances,
  process_tasks,
  process_template_tasks,
  process_templates,
  roles,
  user_roles,
} from "@/db/schema";
import { AppError } from "@/middlewares";
import { sendNotification } from "@/modules/hr/notifications/notification.service";
import { ensureBalances } from "./leave-core.service";
import { isManagerOf } from "./employee-context";
import { createSequentialRequests, getTemplateByName } from "../signing.service";

const EMPLOYMENT_CONTRACT_TEMPLATE_NAME = "Employment Contract";

export type ProcessType = "onboarding" | "offboarding";
export type AssigneeClass = "hr" | "it" | "manager" | "finance" | "employee";

type Handle = DbTransaction | typeof db;

export interface InstantiateOptions {
  actorUserId: number;
  templateId?: number;
  startedAt?: Date;
  /** Offboarding anchors offsets to the last working day; negative offsets mean "before". */
  anchorDate?: Date;
  tx?: DbTransaction;
  offboardingReason?: string;
  lastWorkingDay?: string;
  grantAlumni?: boolean;
}

function conn(tx?: DbTransaction): Handle {
  return tx ?? db;
}

function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

async function userIdsWithRole(h: Handle, roleName: string): Promise<number[]> {
  const rows = await h
    .select({ userId: user_roles.user_id })
    .from(user_roles)
    .innerJoin(roles, eq(user_roles.role_id, roles.id))
    .where(eq(roles.name, roleName));
  return rows.map((r) => r.userId);
}

async function hasAnyRole(h: Handle, userId: number, names: string[]): Promise<boolean> {
  const rows = await h
    .select({ name: roles.name })
    .from(user_roles)
    .innerJoin(roles, eq(user_roles.role_id, roles.id))
    .where(eq(user_roles.user_id, userId));
  return rows.some((r) => names.includes(r.name));
}

const isHrOrAdmin = (h: Handle, userId: number) => hasAnyRole(h, userId, ["hr", "admin"]);

async function employeeForUser(h: Handle, userId: number) {
  const [row] = await h.select().from(employees).where(eq(employees.user_id, userId)).limit(1);
  return row ?? null;
}

async function pickTemplate(
  h: Handle,
  type: ProcessType,
  employmentType: string,
  templateId?: number,
) {
  if (templateId != null) {
    const [row] = await h
      .select()
      .from(process_templates)
      .where(eq(process_templates.id, templateId))
      .limit(1);
    if (!row) throw new AppError("Template not found", 404, "TEMPLATE_NOT_FOUND");
    return row;
  }

  const candidates = await h
    .select()
    .from(process_templates)
    .where(and(eq(process_templates.type, type), eq(process_templates.is_active, true)))
    .orderBy(asc(process_templates.id));

  // A template naming this employment type wins over the catch-all.
  const specific = candidates.find((t) => t.employment_types?.includes(employmentType));
  const generic = candidates.find((t) => t.employment_types == null);
  const chosen = specific ?? generic;

  if (!chosen) {
    throw new AppError(
      `No active ${type} template applies to employment type '${employmentType}'`,
      422,
      "TEMPLATE_UNAVAILABLE",
    );
  }
  return chosen;
}

/**
 * Resolve each assignee class to one user. `manager` falls back to the HR owner when the employee
 * sits at the top of the tree; a class nobody holds resolves to null. Both cases are reported in
 * `unresolved_assignees` so the UI can prompt for a reassignment instead of silently dropping work.
 */
async function resolveAssignees(
  h: Handle,
  employee: typeof employees.$inferSelect,
  actorUserId: number,
): Promise<{ byClass: Record<AssigneeClass, number | null>; unresolved: AssigneeClass[] }> {
  const unresolved: AssigneeClass[] = [];

  const hrOwner = (await isHrOrAdmin(h, actorUserId))
    ? actorUserId
    : ((await userIdsWithRole(h, "hr"))[0] ?? actorUserId);

  let managerUserId: number | null = null;
  if (employee.manager_id) {
    const [manager] = await h
      .select({ userId: employees.user_id })
      .from(employees)
      .where(eq(employees.id, employee.manager_id))
      .limit(1);
    managerUserId = manager?.userId ?? null;
  }
  if (managerUserId == null) {
    managerUserId = hrOwner;
    unresolved.push("manager");
  }

  const firstWithRole = async (role: string, cls: AssigneeClass) => {
    const found = (await userIdsWithRole(h, role))[0] ?? null;
    if (found == null) unresolved.push(cls);
    return found;
  };

  return {
    byClass: {
      hr: hrOwner,
      manager: managerUserId,
      employee: employee.user_id,
      it: await firstWithRole("it", "it"),
      finance: await firstWithRole("finance", "finance"),
    },
    unresolved,
  };
}

export async function instantiateProcess(
  type: ProcessType,
  employeeId: string,
  opts: InstantiateOptions,
) {
  const h = conn(opts.tx);

  const [employee] = await h.select().from(employees).where(eq(employees.id, employeeId)).limit(1);
  if (!employee) throw new AppError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");

  const [clash] = await h
    .select({ id: process_instances.id })
    .from(process_instances)
    .where(
      and(
        eq(process_instances.employee_id, employeeId),
        eq(process_instances.type, type),
        eq(process_instances.status, "in_progress"),
      ),
    )
    .limit(1);
  if (clash) {
    throw new AppError(
      `This employee already has an active ${type} process`,
      409,
      "PROCESS_ACTIVE",
    );
  }

  const template = await pickTemplate(h, type, employee.employment_type, opts.templateId);
  const templateTasks = await h
    .select()
    .from(process_template_tasks)
    .where(eq(process_template_tasks.template_id, template.id))
    .orderBy(asc(process_template_tasks.sort_order));

  const startedAt = opts.startedAt ?? new Date();
  const anchor = opts.anchorDate ?? startedAt;
  const { byClass, unresolved } = await resolveAssignees(h, employee, opts.actorUserId);

  const [instance] = await h
    .insert(process_instances)
    .values({
      template_id: template.id,
      type,
      employee_id: employeeId,
      status: "in_progress",
      started_at: startedAt,
      offboarding_reason: opts.offboardingReason ?? null,
      last_working_day: opts.lastWorkingDay ?? null,
      grant_alumni: opts.grantAlumni ?? false,
    })
    .returning();

  if (templateTasks.length) {
    await h.insert(process_tasks).values(
      templateTasks.map((t) => {
        let dueDate: string | null = null;
        if (t.due_offset_days != null) {
          const due = new Date(anchor);
          due.setUTCDate(due.getUTCDate() + t.due_offset_days);
          dueDate = isoDate(due);
        }
        return {
          instance_id: instance.id,
          title: t.title,
          description: t.description,
          sort_order: t.sort_order,
          assignee_user_id: byClass[t.default_assignee as AssigneeClass] ?? null,
          visibility: t.visibility,
          is_blocking: t.is_blocking,
          kind: t.kind,
          due_date: dueDate,
        };
      }),
    );
  }

  // Notifications go through the pool; inside a hire transaction the rows they reference are not
  // committed yet, so defer them to the caller in that case.
  if (!opts.tx) await notifyAssignees(instance.id);

  return { ...instance, unresolved_assignees: unresolved, template_name: template.name };
}

async function notifyAssignees(instanceId: number) {
  const tasks = await db
    .select()
    .from(process_tasks)
    .where(and(eq(process_tasks.instance_id, instanceId), eq(process_tasks.status, "pending")));

  const recipients = [
    ...new Set(tasks.map((t) => t.assignee_user_id).filter((id): id is number => id != null)),
  ];
  if (!recipients.length) return;

  try {
    await sendNotification({
      type: "PROCESS_TASK_ASSIGNED",
      triggeredBy: 0,
      relatedEntity: {},
      recipientUserIds: recipients,
      title: "You have new onboarding tasks",
      message: "A lifecycle checklist has assigned tasks to you.",
      priority: "NORMAL",
    });
  } catch {
    // A notification failure must never fail instantiation.
  }
}

async function requireTask(h: Handle, taskId: number) {
  const [task] = await h.select().from(process_tasks).where(eq(process_tasks.id, taskId)).limit(1);
  if (!task) throw new AppError("Task not found", 404, "TASK_NOT_FOUND");

  const [instance] = await h
    .select()
    .from(process_instances)
    .where(eq(process_instances.id, task.instance_id))
    .limit(1);
  return { task, instance };
}

async function assertCanActOnTask(
  h: Handle,
  actorUserId: number,
  task: typeof process_tasks.$inferSelect,
) {
  if (task.assignee_user_id === actorUserId) return;
  if (await isHrOrAdmin(h, actorUserId)) return;
  throw new AppError("Only the assignee or HR can act on this task", 403, "FORBIDDEN");
}

/**
 * Kind-specific gates. Each returns nothing on success and throws 422 with an actionable message
 * otherwise — the UI surfaces it directly on the task card.
 */
async function runKindHook(
  task: typeof process_tasks.$inferSelect,
  instance: typeof process_instances.$inferSelect,
) {
  const ref = (task.link_ref ?? {}) as Record<string, unknown>;

  switch (task.kind) {
    case "contract_signing": {
      const contractId = ref.contract_id as string | undefined;
      if (!contractId) {
        throw new AppError(
          "Link the employee's contract to this task before completing it",
          422,
          "CONTRACT_NOT_LINKED",
        );
      }
      const [contract] = await db
        .select()
        .from(hr_contracts)
        .where(eq(hr_contracts.id, contractId))
        .limit(1);
      if (!contract) throw new AppError("Linked contract not found", 422, "CONTRACT_NOT_FOUND");
      if (contract.status !== "ACTIVE") {
        throw new AppError(
          `Contract is still ${contract.status} — it must be signed and ACTIVE first`,
          422,
          "CONTRACT_NOT_ACTIVE",
        );
      }
      return;
    }

    case "leave_setup": {
      // MOD-06 owns entitlements; this throws 422 when no policy covers the employment type.
      await ensureBalances(instance.employee_id, new Date().getUTCFullYear());
      return;
    }

    case "document_upload": {
      const documentId = ref.document_id as string | undefined;
      if (!documentId) {
        throw new AppError(
          "Upload the document before completing this task",
          422,
          "DOCUMENT_MISSING",
        );
      }
      const [doc] = await db
        .select({ id: hr_documents.id })
        .from(hr_documents)
        .where(eq(hr_documents.id, documentId))
        .limit(1);
      if (!doc) throw new AppError("Linked document not found", 422, "DOCUMENT_NOT_FOUND");
      return;
    }

    case "asset_assignment": {
      const assetId = ref.asset_id as string | undefined;
      if (!assetId) {
        throw new AppError("Assign the asset before completing this task", 422, "ASSET_MISSING");
      }
      const [asset] = await db
        .select({ id: hr_assets.id })
        .from(hr_assets)
        .where(eq(hr_assets.id, assetId))
        .limit(1);
      if (!asset) throw new AppError("Linked asset not found", 422, "ASSET_NOT_FOUND");
      return;
    }

    default:
      return; // plain checklist
  }
}

/**
 * An employee starts at `pending` (employees-core.service.ts::createEmployee) even though their
 * onboarding checklist already exists — they haven't done anything yet. The first action on any
 * task of that checklist (done or skipped, doesn't matter which) is what "starting onboarding"
 * means, so that's the hook point; onboarding→active is the existing maybeCompleteInstance path
 * below, unchanged.
 */
async function maybeStartOnboarding(instance: typeof process_instances.$inferSelect) {
  if (instance.type !== "onboarding") return;
  const [employee] = await db
    .select({ status: employees.status })
    .from(employees)
    .where(eq(employees.id, instance.employee_id))
    .limit(1);
  if (employee?.status === "pending") {
    await db
      .update(employees)
      .set({ status: "onboarding", updated_at: new Date() })
      .where(eq(employees.id, instance.employee_id));
  }
}

export async function completeTask(actorUserId: number, taskId: number, notes?: string) {
  const { task, instance } = await requireTask(db, taskId);
  if (task.status !== "pending") {
    throw new AppError("This task is already resolved", 400, "TASK_NOT_PENDING");
  }
  await assertCanActOnTask(db, actorUserId, task);
  await runKindHook(task, instance);
  await maybeStartOnboarding(instance);

  const [updated] = await db
    .update(process_tasks)
    .set({
      status: "done",
      completed_at: new Date(),
      completed_by: actorUserId,
      notes: notes?.trim() || task.notes,
      updated_at: new Date(),
    })
    .where(eq(process_tasks.id, taskId))
    .returning();

  await maybeCompleteInstance(instance.id);
  return updated;
}

export async function skipTask(actorUserId: number, taskId: number, notes: string) {
  const { task, instance } = await requireTask(db, taskId);
  if (task.status !== "pending") {
    throw new AppError("This task is already resolved", 400, "TASK_NOT_PENDING");
  }
  if (!notes?.trim()) {
    throw new AppError("A note is required when skipping a task", 422, "SKIP_NOTE_REQUIRED");
  }
  await assertCanActOnTask(db, actorUserId, task);

  // Blocking work can only be waived by HR — an assignee cannot skip past a gate.
  if (task.is_blocking && !(await isHrOrAdmin(db, actorUserId))) {
    throw new AppError("Only HR can skip a blocking task", 403, "BLOCKING_SKIP_FORBIDDEN");
  }
  await maybeStartOnboarding(instance);

  const [updated] = await db
    .update(process_tasks)
    .set({
      status: "skipped",
      completed_at: new Date(),
      completed_by: actorUserId,
      notes: notes.trim(),
      updated_at: new Date(),
    })
    .where(eq(process_tasks.id, taskId))
    .returning();

  await maybeCompleteInstance(instance.id);
  return updated;
}

/**
 * Completion is gated on blocking tasks only; non-blocking ones stay actionable afterwards.
 * Onboarding flips the employee to `active`. LCM-02 overrides the offboarding branch.
 */
async function maybeCompleteInstance(instanceId: number) {
  const [instance] = await db
    .select()
    .from(process_instances)
    .where(eq(process_instances.id, instanceId))
    .limit(1);
  if (!instance || instance.status !== "in_progress") return;

  const [{ open }] = await db
    .select({ open: sql<number>`count(*)::int` })
    .from(process_tasks)
    .where(
      and(
        eq(process_tasks.instance_id, instanceId),
        eq(process_tasks.is_blocking, true),
        eq(process_tasks.status, "pending"),
      ),
    );
  if (open > 0) return;

  await withDbTransaction(async (tx) => {
    await tx
      .update(process_instances)
      .set({ status: "completed", completed_at: new Date(), updated_at: new Date() })
      .where(eq(process_instances.id, instanceId));

    if (instance.type === "onboarding") {
      await tx
        .update(employees)
        .set({ status: "active", updated_at: new Date() })
        .where(eq(employees.id, instance.employee_id));
    }
  });

  try {
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, instance.employee_id))
      .limit(1);
    await sendNotification({
      type: "PROCESS_COMPLETED",
      triggeredBy: 0,
      relatedEntity: {},
      recipientUserIds: [employee.user_id, ...(await userIdsWithRole(db, "hr"))],
      title: `${instance.type === "onboarding" ? "Onboarding" : "Offboarding"} complete`,
      message: `${employee.first_name} ${employee.last_name} has finished ${instance.type}.`,
      priority: "NORMAL",
    });
  } catch {
    // Never fail completion on a notification.
  }
}

export interface ProcessView {
  instance: typeof process_instances.$inferSelect;
  tasks: (typeof process_tasks.$inferSelect)[];
  progress: { done: number; total: number; percent: number };
  can_manage: boolean;
}

/**
 * Read an instance as a specific viewer. HR sees everything; the subject employee and other
 * viewers never receive `staff_only` rows, and progress is computed over the rows returned.
 */
export async function getProcessForViewer(
  viewerUserId: number,
  instanceId: number,
): Promise<ProcessView> {
  const [instance] = await db
    .select()
    .from(process_instances)
    .where(eq(process_instances.id, instanceId))
    .limit(1);
  if (!instance) throw new AppError("Process not found", 404, "PROCESS_NOT_FOUND");

  const canManage = await isHrOrAdmin(db, viewerUserId);
  const viewer = await employeeForUser(db, viewerUserId);
  const isSubject = viewer?.id === instance.employee_id;

  const allTasks = await db
    .select()
    .from(process_tasks)
    .where(eq(process_tasks.instance_id, instanceId))
    .orderBy(asc(process_tasks.sort_order));

  const isAssignee = allTasks.some((t) => t.assignee_user_id === viewerUserId);
  const isManager = viewer ? await isManagerOf(viewer.id, instance.employee_id) : false;

  if (!canManage && !isSubject && !isAssignee && !isManager) {
    throw new AppError("You cannot view this process", 403, "FORBIDDEN");
  }

  // staff_only exists to hide internal steps from the *subject*. Someone assigned such a task
  // still has to see the work they owe, so their own rows stay visible either way.
  const tasks = canManage
    ? allTasks
    : allTasks.filter((t) => t.visibility !== "staff_only" || t.assignee_user_id === viewerUserId);
  const blocking = tasks.filter((t) => t.is_blocking);
  const done = blocking.filter((t) => t.status !== "pending").length;

  return {
    instance,
    tasks,
    progress: {
      done,
      total: blocking.length,
      percent: blocking.length ? Math.round((done / blocking.length) * 100) : 0,
    },
    can_manage: canManage,
  };
}

/** Open tasks assigned to me across every instance — drives the "my duties" widget. */
export function listMyTasks(userId: number) {
  return db
    .select()
    .from(process_tasks)
    .where(and(eq(process_tasks.assignee_user_id, userId), eq(process_tasks.status, "pending")))
    .orderBy(asc(process_tasks.due_date), asc(process_tasks.sort_order));
}

export interface ListFilters {
  type?: ProcessType;
  status?: string;
  employeeId?: string;
}

export async function listProcesses(filters: ListFilters = {}) {
  const conditions = [];
  if (filters.type) conditions.push(eq(process_instances.type, filters.type));
  if (filters.status) conditions.push(eq(process_instances.status, filters.status));
  if (filters.employeeId) conditions.push(eq(process_instances.employee_id, filters.employeeId));

  const rows = await db
    .select({
      instance: process_instances,
      employee: {
        id: employees.id,
        first_name: employees.first_name,
        last_name: employees.last_name,
        job_title: employees.job_title,
        employment_type: employees.employment_type,
      },
    })
    .from(process_instances)
    .innerJoin(employees, eq(employees.id, process_instances.employee_id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(process_instances.started_at));

  if (!rows.length) return [];

  const counts = await db
    .select({
      instanceId: process_tasks.instance_id,
      total: sql<number>`count(*) filter (where ${process_tasks.is_blocking})::int`,
      done: sql<number>`count(*) filter (where ${process_tasks.is_blocking} and ${process_tasks.status} <> 'pending')::int`,
      overdue: sql<number>`count(*) filter (where ${process_tasks.status} = 'pending' and ${process_tasks.due_date} < current_date)::int`,
    })
    .from(process_tasks)
    .where(
      inArray(
        process_tasks.instance_id,
        rows.map((r) => r.instance.id),
      ),
    )
    .groupBy(process_tasks.instance_id);

  const byInstance = new Map(counts.map((c) => [c.instanceId, c]));

  return rows.map(({ instance, employee }) => {
    const c = byInstance.get(instance.id);
    const total = c?.total ?? 0;
    const done = c?.done ?? 0;
    return {
      ...instance,
      employee,
      progress: { done, total, percent: total ? Math.round((done / total) * 100) : 0 },
      overdue_count: c?.overdue ?? 0,
    };
  });
}

export async function reassignTask(
  taskId: number,
  patch: {
    assignee_user_id?: number | null;
    due_date?: string | null;
    link_ref?: Record<string, unknown>;
  },
  actorUserId: number,
) {
  const [before] = await db.select().from(process_tasks).where(eq(process_tasks.id, taskId));
  if (!before) throw new AppError("Task not found", 404, "TASK_NOT_FOUND");

  const set: Record<string, unknown> = { updated_at: new Date() };
  if (patch.assignee_user_id !== undefined) set.assignee_user_id = patch.assignee_user_id;
  if (patch.due_date !== undefined) set.due_date = patch.due_date;
  if (patch.link_ref !== undefined) set.link_ref = patch.link_ref;

  const [row] = await db
    .update(process_tasks)
    .set(set)
    .where(eq(process_tasks.id, taskId))
    .returning();
  if (!row) throw new AppError("Task not found", 404, "TASK_NOT_FOUND");

  const beforeContractId = (before.link_ref as Record<string, unknown> | null)?.contract_id;
  const afterContractId = (row.link_ref as Record<string, unknown> | null)?.contract_id;
  if (row.kind === "contract_signing" && afterContractId && afterContractId !== beforeContractId) {
    const [instance] = await db
      .select()
      .from(process_instances)
      .where(eq(process_instances.id, row.instance_id))
      .limit(1);
    if (instance) {
      await startContractSigning({
        contractId: afterContractId as string,
        employeeId: instance.employee_id,
        hrUserId: actorUserId,
      });
    }
  }

  return row;
}

/**
 * Kicks off the HR-then-employee signing sequence when a contract gets linked to a
 * contract_signing task. HR is the actor who did the linking (they're presumed to be the
 * countersigning HR rep); the employee is resolved from the onboarding instance's employee row.
 * Both are internal signers — the employee already has an authenticated users account by the
 * time onboarding exists, so there's no need for the external emailed-token path.
 */
async function startContractSigning(input: {
  contractId: string;
  employeeId: string;
  hrUserId: number;
}): Promise<void> {
  const template = await getTemplateByName(EMPLOYMENT_CONTRACT_TEMPLATE_NAME);
  if (!template) {
    throw new AppError(
      `No "${EMPLOYMENT_CONTRACT_TEMPLATE_NAME}" signature template configured — create one in ` +
        `Settings → E-Signing Templates before linking a contract to this task.`,
      422,
      "SIGNING_TEMPLATE_MISSING",
    );
  }

  const [employee] = await db
    .select({
      userId: employees.user_id,
      firstName: employees.first_name,
      lastName: employees.last_name,
    })
    .from(employees)
    .where(eq(employees.id, input.employeeId))
    .limit(1);
  if (!employee) throw new AppError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");

  await createSequentialRequests(
    {
      template_id: template.id,
      subject: `Employment contract — ${employee.firstName} ${employee.lastName}`,
      ref_kind: "contract",
      ref_id: input.contractId,
      signerUserIds: [input.hrUserId, employee.userId],
    },
    input.hrUserId,
  );
}

/** Stops the checklist without judging the employee's status — HR decides that separately. */
export async function cancelProcess(instanceId: number) {
  const [row] = await db
    .update(process_instances)
    .set({ status: "cancelled", updated_at: new Date() })
    .where(and(eq(process_instances.id, instanceId), eq(process_instances.status, "in_progress")))
    .returning();
  if (!row) throw new AppError("No active process to cancel", 404, "PROCESS_NOT_FOUND");
  return row;
}

/** Pending tasks past their due date — the nightly overdue notification sweep. */
export async function notifyOverdueTasks(): Promise<{ notified: number }> {
  const overdue = await db
    .select()
    .from(process_tasks)
    .innerJoin(process_instances, eq(process_instances.id, process_tasks.instance_id))
    .where(
      and(
        eq(process_tasks.status, "pending"),
        eq(process_instances.status, "in_progress"),
        sql`${process_tasks.due_date} < current_date`,
      ),
    );

  const recipients = [
    ...new Set(
      overdue.map((r) => r.process_tasks.assignee_user_id).filter((id): id is number => id != null),
    ),
  ];
  if (!recipients.length) return { notified: 0 };

  try {
    await sendNotification({
      type: "PROCESS_TASK_OVERDUE",
      triggeredBy: 0,
      relatedEntity: {},
      recipientUserIds: recipients,
      title: "Overdue lifecycle tasks",
      message: "You have onboarding or offboarding tasks past their due date.",
      priority: "HIGH",
    });
  } catch {
    return { notified: 0 };
  }
  return { notified: recipients.length };
}

// --- Template management (processes:manage) ---

export function listTemplates(type?: ProcessType) {
  const query = db.select().from(process_templates);
  if (!type) return query.orderBy(asc(process_templates.id));
  return query.where(eq(process_templates.type, type)).orderBy(asc(process_templates.id));
}

export async function getTemplate(templateId: number) {
  const [template] = await db
    .select()
    .from(process_templates)
    .where(eq(process_templates.id, templateId))
    .limit(1);
  if (!template) throw new AppError("Template not found", 404, "TEMPLATE_NOT_FOUND");

  const tasks = await db
    .select()
    .from(process_template_tasks)
    .where(eq(process_template_tasks.template_id, templateId))
    .orderBy(asc(process_template_tasks.sort_order));

  return { ...template, tasks };
}

export async function createTemplate(
  input: { type: ProcessType; name: string; employment_types?: string[] | null },
  actorUserId: number,
) {
  const [row] = await db
    .insert(process_templates)
    .values({
      type: input.type,
      name: input.name,
      employment_types: input.employment_types ?? null,
      created_by: actorUserId,
    })
    .returning();
  return row;
}

export async function updateTemplate(
  templateId: number,
  patch: { name?: string; employment_types?: string[] | null; is_active?: boolean },
) {
  const [row] = await db
    .update(process_templates)
    .set({ ...patch, updated_at: new Date() })
    .where(eq(process_templates.id, templateId))
    .returning();
  if (!row) throw new AppError("Template not found", 404, "TEMPLATE_NOT_FOUND");
  return row;
}

/**
 * Templates are deactivated rather than deleted once used — instances keep a reference, and the
 * audit trail of "which checklist did this person get" has to survive.
 */
export async function deactivateTemplate(templateId: number) {
  return updateTemplate(templateId, { is_active: false });
}

export async function addTemplateTask(
  templateId: number,
  input: {
    title: string;
    description?: string;
    sort_order?: number;
    default_assignee: AssigneeClass;
    visibility?: "all" | "staff_only";
    due_offset_days?: number | null;
    is_blocking?: boolean;
    kind?: string;
  },
) {
  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${process_template_tasks.sort_order}), -1) + 1` })
    .from(process_template_tasks)
    .where(eq(process_template_tasks.template_id, templateId));

  const [row] = await db
    .insert(process_template_tasks)
    .values({
      template_id: templateId,
      title: input.title,
      description: input.description ?? null,
      sort_order: input.sort_order ?? next,
      default_assignee: input.default_assignee,
      visibility: input.visibility ?? "all",
      due_offset_days: input.due_offset_days ?? null,
      is_blocking: input.is_blocking ?? false,
      kind: input.kind ?? "checklist",
    })
    .returning();
  return row;
}

export async function removeTemplateTask(taskId: number) {
  const [row] = await db
    .delete(process_template_tasks)
    .where(eq(process_template_tasks.id, taskId))
    .returning();
  if (!row) throw new AppError("Template task not found", 404, "TEMPLATE_TASK_NOT_FOUND");
  return row;
}
