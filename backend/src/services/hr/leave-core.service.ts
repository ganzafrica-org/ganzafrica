/**
 * MOD-06 leave engine — balances, working-day math, and manager-routed approvals on the
 * `employees` model.
 *
 * The former hr_users-shaped CRUD in `leave.service.ts` is retired; that file now only re-exports
 * shape. New routes call this; the old CRUD keeps working until FND-07's contract phase drops
 * `hr_leaves.user_id`.
 */
import { and, asc, desc, eq, gte, inArray, lte, ne, or, sql } from "drizzle-orm";
import { db, withDbTransaction } from "@/db/client";
import {
  employees,
  hr_leave_balances,
  hr_leave_policies,
  hr_leaves,
  hr_org_holidays,
  hr_documents,
  leave_emails,
  user_roles,
  roles,
  users,
  type Leave,
} from "@/db/schema";
import { AppError } from "@/middlewares";
import { sendNotification } from "@/modules/hr/notifications/notification.service";
import { sendEmail } from "../email.service";
import { leaveSubmittedEmail, leaveDecidedEmail } from "./leave-emails";
import { countWorkingDays, toIsoDate, windowBounds, type SummaryWindow } from "./leave-days";
import { getManagerUserId, isManagerOf } from "./employee-context";
import { createDocument } from "./document.service";

/** Types whose usage draws down a balance. UNPAID/OTHER are tracked but never blocked. */
const BALANCE_TRACKED = new Set(["ANNUAL", "SICK", "MATERNITY", "PATERNITY"]);

export type LeaveTypeName = "ANNUAL" | "SICK" | "MATERNITY" | "PATERNITY" | "UNPAID" | "OTHER";
export type LeaveDecision = "APPROVED" | "REJECTED";

export interface LeaveRequestInput {
  type: LeaveTypeName;
  startDate: Date;
  endDate: Date;
  reason?: string;
}

async function holidaySet(from: Date, to: Date): Promise<Set<string>> {
  const rows = await db
    .select({ date: hr_org_holidays.date })
    .from(hr_org_holidays)
    .where(
      and(gte(hr_org_holidays.date, toIsoDate(from)), lte(hr_org_holidays.date, toIsoDate(to))),
    );
  return new Set(rows.map((r) => r.date));
}

/** Working days for a range, excluding weekends and configured org holidays. */
export async function computeWorkingDays(start: Date, end: Date): Promise<number> {
  return countWorkingDays(start, end, await holidaySet(start, end));
}

async function requireEmployee(employeeId: string) {
  const [row] = await db.select().from(employees).where(eq(employees.id, employeeId)).limit(1);
  if (!row) throw new AppError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");
  return row;
}

async function employeeForUser(userId: number) {
  const [row] = await db.select().from(employees).where(eq(employees.user_id, userId)).limit(1);
  return row ?? null;
}

async function userHasRole(userId: number, names: string[]): Promise<boolean> {
  const rows = await db
    .select({ name: roles.name })
    .from(user_roles)
    .innerJoin(roles, eq(user_roles.role_id, roles.id))
    .where(eq(user_roles.user_id, userId));
  return rows.some((r) => names.includes(r.name));
}

const isHrOrAdmin = (userId: number) => userHasRole(userId, ["hr", "admin"]);

/**
 * Create this year's balance rows from the org policy for the employee's employment type.
 * Idempotent — existing rows (and their used_days) are left untouched, so it is safe to call on
 * every request and from LCM-01's `leave_setup` onboarding task.
 */
export async function ensureBalances(employeeId: string, year: number): Promise<void> {
  const employee = await requireEmployee(employeeId);

  const policies = await db
    .select()
    .from(hr_leave_policies)
    .where(eq(hr_leave_policies.employment_type, employee.employment_type));

  if (!policies.length) {
    throw new AppError(
      `No leave policy configured for employment type '${employee.employment_type}'`,
      422,
      "LEAVE_POLICY_MISSING",
    );
  }

  await db
    .insert(hr_leave_balances)
    .values(
      policies.map((p) => ({
        employee_id: employeeId,
        year,
        type: p.type,
        entitled_days: p.annual_days,
      })),
    )
    .onConflictDoNothing();
}

async function balanceRow(employeeId: string, year: number, type: LeaveTypeName) {
  const [row] = await db
    .select()
    .from(hr_leave_balances)
    .where(
      and(
        eq(hr_leave_balances.employee_id, employeeId),
        eq(hr_leave_balances.year, year),
        eq(hr_leave_balances.type, type),
      ),
    )
    .limit(1);
  return row ?? null;
}

/** Entitled + carried over − used, for the year a request starts in. */
export async function remainingDays(
  employeeId: string,
  year: number,
  type: LeaveTypeName,
): Promise<number> {
  const row = await balanceRow(employeeId, year, type);
  if (!row) return 0;
  return Number(row.entitled_days) + Number(row.carried_over_days) - Number(row.used_days);
}

async function assertNoOverlap(employeeId: string, start: Date, end: Date, excludeId?: string) {
  const conditions = [
    eq(hr_leaves.employee_id, employeeId),
    lte(hr_leaves.start_date, end),
    gte(hr_leaves.end_date, start),
    or(eq(hr_leaves.status, "PENDING"), eq(hr_leaves.status, "APPROVED")),
  ];
  if (excludeId) conditions.push(ne(hr_leaves.id, excludeId));

  const [clash] = await db
    .select({ id: hr_leaves.id })
    .from(hr_leaves)
    .where(and(...conditions))
    .limit(1);

  if (clash) {
    throw new AppError("This overlaps an existing leave request", 409, "LEAVE_OVERLAP");
  }
}

/**
 * Submit a leave request for `employeeId`. `actorUserId` must be the employee themselves or an
 * HR/admin filing on their behalf.
 */
export async function requestLeave(
  actorUserId: number,
  employeeId: string,
  input: LeaveRequestInput,
) {
  await requireEmployee(employeeId);
  const actorEmployee = await employeeForUser(actorUserId);

  if (actorEmployee?.id !== employeeId && !(await isHrOrAdmin(actorUserId))) {
    throw new AppError("Cannot request leave for another employee", 403, "FORBIDDEN");
  }

  if (input.endDate < input.startDate) {
    throw new AppError("End date must not precede start date", 422, "LEAVE_RANGE_INVALID");
  }

  const days = await computeWorkingDays(input.startDate, input.endDate);
  if (days === 0) {
    throw new AppError(
      "Request covers no working days (weekends and holidays are excluded)",
      422,
      "LEAVE_NO_WORKING_DAYS",
    );
  }

  await assertNoOverlap(employeeId, input.startDate, input.endDate);

  const year = input.startDate.getUTCFullYear();
  if (BALANCE_TRACKED.has(input.type)) {
    await ensureBalances(employeeId, year);
    const remaining = await remainingDays(employeeId, year, input.type);
    if (days > remaining) {
      throw new AppError(
        `Insufficient ${input.type} balance: ${days} day(s) requested, ${remaining} remaining`,
        422,
        "LEAVE_INSUFFICIENT_BALANCE",
      );
    }
  }

  const [created] = await db
    .insert(hr_leaves)
    .values({
      employee_id: employeeId,
      type: input.type,
      start_date: input.startDate,
      end_date: input.endDate,
      reason: input.reason ?? "",
      status: "PENDING",
      days: String(days),
    })
    .returning();

  await notifyApprover(created, input.type, days);
  return created;
}

async function hrUserIds(): Promise<number[]> {
  const rows = await db
    .select({ userId: user_roles.user_id })
    .from(user_roles)
    .innerJoin(roles, eq(user_roles.role_id, roles.id))
    .where(eq(roles.name, "hr"));
  return rows.map((r) => r.userId);
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23505";
}

/** userId -> {email, firstName}, firstName null when the account has no employees row (HR/admin). */
async function userMailInfo(
  userIds: number[],
): Promise<Map<number, { email: string; firstName: string | null }>> {
  if (!userIds.length) return new Map();
  const rows = await db
    .select({ id: users.id, email: users.email, firstName: employees.first_name })
    .from(users)
    .leftJoin(employees, eq(employees.user_id, users.id))
    .where(inArray(users.id, userIds));
  return new Map(rows.map((r) => [r.id, { email: r.email, firstName: r.firstName ?? null }]));
}

/**
 * Sends `render()`'s email to `recipientUserId` exactly once per (leave, type, recipient).
 * Insert-first, unique-violation => already sent, skip — mirrors recruitment_emails
 * (recruitment/pipeline.ts sendApplicantEmail). A send failure must never fail the leave action
 * itself, same as the in-app notification it accompanies.
 */
/** Exported for direct idempotency testing — production callers are notifyApprover/decideLeave. */
export async function sendLeaveEmailOnce(
  leaveId: string,
  emailType: "submitted" | "decided",
  recipientUserId: number,
  render: () => { subject: string; html: string; text: string },
) {
  try {
    await db
      .insert(leave_emails)
      .values({ leave_id: leaveId, email_type: emailType, recipient_user_id: recipientUserId });
  } catch (err) {
    if (isUniqueViolation(err)) return;
    throw err;
  }

  const [info] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, recipientUserId));
  if (!info) return;
  const { subject, html, text } = render();
  try {
    await sendEmail(info.email, subject, html, text);
  } catch {
    // A send failure must not fail the leave action that triggered it.
  }
}

/** Notify the manager, or the HR queue when the requester sits at the top of the tree. */
async function notifyApprover(leave: Leave, type: LeaveTypeName, days: number) {
  const employeeId = leave.employee_id!;
  const managerUserId = await getManagerUserId(employeeId);
  const recipients = managerUserId != null ? [managerUserId] : await hrUserIds();
  if (!recipients.length) return;

  try {
    await sendNotification({
      type: "LEAVE_PENDING_APPROVAL",
      triggeredBy: 0,
      relatedEntity: { leaveId: leave.id, employeeId },
      recipientUserIds: recipients,
      title: "Leave request awaiting your approval",
      message: `A ${type} request for ${days} working day(s) needs a decision.`,
      priority: "NORMAL",
    });
  } catch {
    // A notification failure must never fail the request itself.
  }

  const requester = await requireEmployee(employeeId);
  const requesterName = `${requester.first_name} ${requester.last_name}`.trim();
  const mailInfo = await userMailInfo(recipients);
  for (const recipientUserId of recipients) {
    await sendLeaveEmailOnce(leave.id, "submitted", recipientUserId, () =>
      leaveSubmittedEmail({
        approverFirstName: mailInfo.get(recipientUserId)?.firstName ?? null,
        requesterName,
        type,
        days,
        startDate: toIsoDate(leave.start_date),
        endDate: toIsoDate(leave.end_date),
      }),
    );
  }
}

async function requireLeave(leaveId: string) {
  const [row] = await db.select().from(hr_leaves).where(eq(hr_leaves.id, leaveId)).limit(1);
  if (!row) throw new AppError("Leave request not found", 404, "LEAVE_NOT_FOUND");
  if (!row.employee_id) {
    throw new AppError("Leave request predates the employees model", 409, "LEAVE_LEGACY_ROW");
  }
  return row;
}

/** Manager (direct or skip-level) or HR/admin — never the requester themselves. */
async function assertCanDecide(actorUserId: number, employeeId: string) {
  const actor = await employeeForUser(actorUserId);
  if (actor?.id === employeeId) {
    throw new AppError("You cannot decide your own leave request", 403, "FORBIDDEN");
  }
  if (await isHrOrAdmin(actorUserId)) return;
  if (actor && (await isManagerOf(actor.id, employeeId))) return;

  throw new AppError("Only the employee's manager or HR can decide this", 403, "FORBIDDEN");
}

async function recomputeUsedDays(
  tx: typeof db,
  employeeId: string,
  year: number,
  type: LeaveTypeName,
) {
  const [{ total }] = await tx
    .select({ total: sql<string>`coalesce(sum(${hr_leaves.days}), 0)` })
    .from(hr_leaves)
    .where(
      and(
        eq(hr_leaves.employee_id, employeeId),
        eq(hr_leaves.type, type),
        eq(hr_leaves.status, "APPROVED"),
        sql`extract(year from ${hr_leaves.start_date}) = ${year}`,
      ),
    );

  await tx
    .update(hr_leave_balances)
    .set({ used_days: String(Number(total)), updated_at: new Date() })
    .where(
      and(
        eq(hr_leave_balances.employee_id, employeeId),
        eq(hr_leave_balances.year, year),
        eq(hr_leave_balances.type, type),
      ),
    );
}

/** Approve or reject a pending request. Rejection requires a note. */
export async function decideLeave(
  actorUserId: number,
  leaveId: string,
  decision: LeaveDecision,
  note?: string,
) {
  const leave = await requireLeave(leaveId);
  if (leave.status !== "PENDING") {
    throw new AppError("Only pending requests can be decided", 400, "LEAVE_NOT_PENDING");
  }
  await assertCanDecide(actorUserId, leave.employee_id!);

  if (decision === "REJECTED" && !note?.trim()) {
    throw new AppError("A note is required when rejecting", 422, "LEAVE_NOTE_REQUIRED");
  }

  const actor = await employeeForUser(actorUserId);
  const year = leave.start_date.getUTCFullYear();

  const updated = await withDbTransaction(async (tx) => {
    const [row] = await tx
      .update(hr_leaves)
      .set({
        status: decision,
        approver_note: note?.trim() ?? null,
        reviewed_by_employee_id: actor?.id ?? null,
        reviewed_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(hr_leaves.id, leaveId))
      .returning();

    if (decision === "APPROVED" && BALANCE_TRACKED.has(leave.type as LeaveTypeName)) {
      await recomputeUsedDays(tx, leave.employee_id!, year, leave.type as LeaveTypeName);
    }
    return row;
  });

  const requester = await requireEmployee(leave.employee_id!);

  try {
    await sendNotification({
      type: decision === "APPROVED" ? "LEAVE_APPROVED" : "LEAVE_REJECTED",
      triggeredBy: actorUserId,
      relatedEntity: { leaveId, employeeId: leave.employee_id! },
      recipientUserIds: [requester.user_id],
      title: decision === "APPROVED" ? "Leave approved" : "Leave rejected",
      message:
        decision === "APPROVED"
          ? "Your leave request has been approved."
          : `Your leave request was rejected: ${note}`,
      priority: "HIGH",
    });
  } catch {
    // Notification failures must not fail the decision.
  }

  await sendLeaveEmailOnce(leaveId, "decided", requester.user_id, () =>
    leaveDecidedEmail({
      firstName: requester.first_name,
      decision,
      type: leave.type as LeaveTypeName,
      days: Number(leave.days ?? 0),
      startDate: toIsoDate(leave.start_date),
      endDate: toIsoDate(leave.end_date),
      approverNote: updated?.approver_note ?? note?.trim() ?? null,
    }),
  );

  return updated;
}

/**
 * Cancel a request. The requester may cancel their own before it starts; HR/admin any time.
 * Cancelling an approved request releases the days back to the balance.
 */
export async function cancelLeaveRequest(actorUserId: number, leaveId: string) {
  const leave = await requireLeave(leaveId);
  if (leave.status === "CANCELLED") return leave;

  const actor = await employeeForUser(actorUserId);
  const isOwner = actor?.id === leave.employee_id;
  const privileged = await isHrOrAdmin(actorUserId);

  if (!isOwner && !privileged) {
    throw new AppError("Cannot cancel someone else's leave", 403, "FORBIDDEN");
  }
  if (isOwner && !privileged && leave.start_date <= new Date()) {
    throw new AppError("Leave that has already started cannot be cancelled", 400, "LEAVE_STARTED");
  }

  const year = leave.start_date.getUTCFullYear();

  return withDbTransaction(async (tx) => {
    const [row] = await tx
      .update(hr_leaves)
      .set({ status: "CANCELLED", updated_at: new Date() })
      .where(eq(hr_leaves.id, leaveId))
      .returning();

    if (leave.status === "APPROVED" && BALANCE_TRACKED.has(leave.type as LeaveTypeName)) {
      await recomputeUsedDays(tx, leave.employee_id!, year, leave.type as LeaveTypeName);
    }
    return row;
  });
}

/**
 * Punch-list #5 — optional leave-request attachments. Stored as ordinary hr_documents rows
 * (category "Leave Attachment", leave_id set) so upload/storage/versioning/ACL and the shared
 * document viewer are all reused as-is rather than building parallel plumbing. Access is enforced
 * here (relationship check), not at the route: the requester, HR/admin, and the leave's resolved
 * approver (manager chain) may add/list attachments; nobody else.
 */
export async function addLeaveAttachment(
  actorUserId: number,
  leaveId: string,
  file: { key: string; size: number; originalName: string },
) {
  const leave = await requireLeave(leaveId);
  const actor = await employeeForUser(actorUserId);
  const isOwner = actor?.id === leave.employee_id;
  const privileged = await isHrOrAdmin(actorUserId);

  if (!isOwner && !privileged) {
    throw new AppError(
      "Cannot add an attachment to another employee's leave request",
      403,
      "FORBIDDEN",
    );
  }

  const owner = await requireEmployee(leave.employee_id!);
  return createDocument({
    document_name: file.originalName,
    category: "Leave Attachment",
    description: `Attachment for ${owner.first_name} ${owner.last_name}'s ${leave.type.toLowerCase()} leave request`,
    department: owner.department ?? "",
    createdById: actor?.id ?? owner.id,
    file,
    leaveId,
  });
}

export async function listLeaveAttachments(actorUserId: number, leaveId: string) {
  const leave = await requireLeave(leaveId);
  const actor = await employeeForUser(actorUserId);
  const isOwner = actor?.id === leave.employee_id;
  const privileged = await isHrOrAdmin(actorUserId);
  const isApprover = actor && !isOwner ? await isManagerOf(actor.id, leave.employee_id!) : false;

  if (!isOwner && !privileged && !isApprover) {
    throw new AppError("You cannot view this leave's attachments", 403, "FORBIDDEN");
  }

  return db
    .select({
      id: hr_documents.id,
      document_name: hr_documents.document_name,
      file_size: hr_documents.file_size,
      created_at: hr_documents.created_at,
    })
    .from(hr_documents)
    .where(eq(hr_documents.leave_id, leaveId))
    .orderBy(hr_documents.created_at);
}

/** Everyone at or below `employeeId` in the org tree (bounded breadth-first walk). */
async function reportIdsUnder(employeeId: string): Promise<string[]> {
  const collected: string[] = [];
  let frontier = [employeeId];

  for (let depth = 0; depth < 20 && frontier.length; depth++) {
    const rows = await db
      .select({ id: employees.id })
      .from(employees)
      .where(inArray(employees.manager_id, frontier));

    const next = rows.map((r) => r.id).filter((id) => !collected.includes(id));
    if (!next.length) break;
    collected.push(...next);
    frontier = next;
  }
  return collected;
}

/** Pending requests this user may decide: their reports', or everything for HR. */
export async function listPendingApprovals(actorUserId: number) {
  if (await isHrOrAdmin(actorUserId)) {
    return db
      .select()
      .from(hr_leaves)
      .where(eq(hr_leaves.status, "PENDING"))
      .orderBy(asc(hr_leaves.start_date));
  }

  const actor = await employeeForUser(actorUserId);
  if (!actor) return [];

  const reports = await reportIdsUnder(actor.id);
  if (!reports.length) return [];

  return db
    .select()
    .from(hr_leaves)
    .where(and(eq(hr_leaves.status, "PENDING"), inArray(hr_leaves.employee_id, reports)))
    .orderBy(asc(hr_leaves.start_date));
}

const employeeFullName = sql<string>`${employees.first_name} || ' ' || ${employees.last_name}`;

/** DB stores "PENDING"/"APPROVED"/etc; the frontend `Leave` type wants "Pending"/"Approved". */
function titleCaseStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export interface VisibleLeave {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveTypeName;
  startDate: Date;
  endDate: Date;
  status: string;
  reason: string;
}

/**
 * Leave requests (any status) this user may see: their own plus their reports' — the same
 * manager-chain scope as `listPendingApprovals`, just not filtered to PENDING — or every request
 * in the org for HR/admin. Backs the "Leave Requests" table; distinct from `getLeaveCalendar`,
 * which is approved-only and feeds the calendar widget.
 */
export async function listVisibleLeaves(actorUserId: number): Promise<VisibleLeave[]> {
  const select = () =>
    db
      .select({ leave: hr_leaves, employeeName: employeeFullName })
      .from(hr_leaves)
      .leftJoin(employees, eq(employees.id, hr_leaves.employee_id));

  const rows = await (async () => {
    if (await isHrOrAdmin(actorUserId)) {
      return select().orderBy(desc(hr_leaves.start_date));
    }

    const actor = await employeeForUser(actorUserId);
    if (!actor) return [];

    const visible = [actor.id, ...(await reportIdsUnder(actor.id))];
    return select()
      .where(inArray(hr_leaves.employee_id, visible))
      .orderBy(desc(hr_leaves.start_date));
  })();

  return rows.map((r) => ({
    id: r.leave.id,
    employeeId: r.leave.employee_id ?? "",
    employeeName: r.employeeName ?? "—",
    type: r.leave.type as LeaveTypeName,
    startDate: r.leave.start_date,
    endDate: r.leave.end_date,
    status: titleCaseStatus(r.leave.status),
    reason: r.leave.reason,
  }));
}

export interface CalendarRange {
  from: Date;
  to: Date;
}

export interface CalendarLeave {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePicture: string | null;
  type: LeaveTypeName;
  startDate: Date;
  endDate: Date;
  status: string;
  reason: string;
}

/**
 * Leave in range, any status: org-wide for HR/admin, otherwise the viewer's own team — their
 * manager's reports plus anyone beneath them — so people see coverage without seeing the org.
 * All statuses are included (punch-list #6 — the calendar shows pending/rejected too, only the
 * background color is approved-specific, decided by the caller); includes the employee's picture
 * so the calendar can render an avatar without a second round trip.
 */
export async function getLeaveCalendar(
  actorUserId: number,
  range: CalendarRange,
): Promise<CalendarLeave[]> {
  const overlapping = and(lte(hr_leaves.start_date, range.to), gte(hr_leaves.end_date, range.from));

  const select = () =>
    db
      .select({
        leave: hr_leaves,
        employeeName: employeeFullName,
        employeePicture: employees.picture,
      })
      .from(hr_leaves)
      .leftJoin(employees, eq(employees.id, hr_leaves.employee_id));

  const rows = await (async () => {
    if (await isHrOrAdmin(actorUserId)) {
      return select().where(overlapping).orderBy(asc(hr_leaves.start_date));
    }

    const actor = await employeeForUser(actorUserId);
    if (!actor) return [];

    const visible = new Set<string>([actor.id, ...(await reportIdsUnder(actor.id))]);
    if (actor.manager_id) {
      const peers = await db
        .select({ id: employees.id })
        .from(employees)
        .where(eq(employees.manager_id, actor.manager_id));
      peers.forEach((p) => visible.add(p.id));
    }

    return select()
      .where(and(overlapping, inArray(hr_leaves.employee_id, [...visible])))
      .orderBy(asc(hr_leaves.start_date));
  })();

  return rows.map((r) => ({
    id: r.leave.id,
    employeeId: r.leave.employee_id ?? "",
    employeeName: r.employeeName ?? "—",
    employeePicture: r.employeePicture,
    type: r.leave.type as LeaveTypeName,
    startDate: r.leave.start_date,
    endDate: r.leave.end_date,
    status: titleCaseStatus(r.leave.status),
    reason: r.leave.reason,
  }));
}

export interface LeaveSummary {
  window: SummaryWindow;
  from: string;
  to: string;
  requestCount: number;
  totalDays: number;
}

/**
 * Punch-list #8 — historical leave totals for the HR home page's summary card. APPROVED only:
 * "total leave taken" should reflect leave that actually happened, not requests still pending or
 * ones that were rejected. A leave is counted in the window if its range overlaps it at all
 * (boundary case: a leave spanning the edge of the window is counted with its FULL days total,
 * not prorated to the overlapping portion — hr_leaves.days is a single precomputed total for the
 * whole request, not a per-day breakdown, so splitting it at a window edge isn't available data).
 */
export async function getLeaveSummary(window: SummaryWindow, now?: Date): Promise<LeaveSummary> {
  const { from, to } = windowBounds(window, now);

  const [row] = await db
    .select({
      requestCount: sql<number>`count(*)::int`,
      totalDays: sql<string>`coalesce(sum(${hr_leaves.days}), 0)`,
    })
    .from(hr_leaves)
    .where(
      and(
        eq(hr_leaves.status, "APPROVED"),
        lte(hr_leaves.start_date, to),
        gte(hr_leaves.end_date, from),
      ),
    );

  return {
    window,
    from: toIsoDate(from),
    to: toIsoDate(to),
    requestCount: row?.requestCount ?? 0,
    totalDays: Number(row?.totalDays ?? 0),
  };
}

/** An employee's balances plus their request history — the self-service view. */
export async function getMyLeave(employeeId: string, year: number) {
  await ensureBalances(employeeId, year).catch(() => {
    // No policy for this employment type yet — show history with empty balances rather than 422.
  });

  const [balances, requests] = await Promise.all([
    db
      .select()
      .from(hr_leave_balances)
      .where(and(eq(hr_leave_balances.employee_id, employeeId), eq(hr_leave_balances.year, year))),
    db
      .select()
      .from(hr_leaves)
      .where(eq(hr_leaves.employee_id, employeeId))
      .orderBy(desc(hr_leaves.start_date)),
  ]);

  return { balances, requests };
}

// --- Settings: policies & holidays (leave:manage) ---

export function listPolicies() {
  return db
    .select()
    .from(hr_leave_policies)
    .orderBy(asc(hr_leave_policies.employment_type), asc(hr_leave_policies.type));
}

export async function upsertPolicy(input: {
  employment_type: string;
  type: LeaveTypeName;
  annual_days: number;
  max_carry_over?: number;
}) {
  const [row] = await db
    .insert(hr_leave_policies)
    .values({
      employment_type: input.employment_type,
      type: input.type,
      annual_days: String(input.annual_days),
      max_carry_over: String(input.max_carry_over ?? 0),
    })
    .onConflictDoUpdate({
      target: [hr_leave_policies.employment_type, hr_leave_policies.type],
      set: {
        annual_days: String(input.annual_days),
        max_carry_over: String(input.max_carry_over ?? 0),
        updated_at: new Date(),
      },
    })
    .returning();
  return row;
}

export async function updatePolicy(
  id: number,
  patch: { annual_days?: number; max_carry_over?: number },
) {
  const set: Record<string, unknown> = { updated_at: new Date() };
  if (patch.annual_days != null) set.annual_days = String(patch.annual_days);
  if (patch.max_carry_over != null) set.max_carry_over = String(patch.max_carry_over);

  const [row] = await db
    .update(hr_leave_policies)
    .set(set)
    .where(eq(hr_leave_policies.id, id))
    .returning();
  if (!row) throw new AppError("Policy not found", 404, "POLICY_NOT_FOUND");
  return row;
}

export async function deletePolicy(id: number) {
  const [row] = await db.delete(hr_leave_policies).where(eq(hr_leave_policies.id, id)).returning();
  if (!row) throw new AppError("Policy not found", 404, "POLICY_NOT_FOUND");
  return row;
}

/** Every configured holiday, any country — the Settings admin CRUD view. */
export function listHolidays(year?: number) {
  const query = db.select().from(hr_org_holidays);
  if (year == null) return query.orderBy(asc(hr_org_holidays.date));
  return query
    .where(
      and(gte(hr_org_holidays.date, `${year}-01-01`), lte(hr_org_holidays.date, `${year}-12-31`)),
    )
    .orderBy(asc(hr_org_holidays.date));
}

/**
 * Punch-list #7 — the union of holidays relevant to the org: every universal (country = "")
 * holiday, plus every country-scoped one whose country matches an active employee's
 * home_country. A single-country org (or one that has never tagged a holiday with a country)
 * sees every holiday, identical to today's behavior, since untagged holidays default to "".
 */
export async function listRelevantHolidays(year?: number) {
  const countries = await db
    .selectDistinct({ country: employees.home_country })
    .from(employees)
    .where(eq(employees.is_active, true));
  const represented = countries.map((c) => c.country).filter((c): c is string => !!c);

  const scopeMatch = represented.length
    ? or(eq(hr_org_holidays.country, ""), inArray(hr_org_holidays.country, represented))
    : eq(hr_org_holidays.country, "");

  const conditions =
    year == null
      ? [scopeMatch]
      : [
          scopeMatch,
          gte(hr_org_holidays.date, `${year}-01-01`),
          lte(hr_org_holidays.date, `${year}-12-31`),
        ];

  return db
    .select()
    .from(hr_org_holidays)
    .where(and(...conditions))
    .orderBy(asc(hr_org_holidays.date));
}

export async function createHoliday(input: { date: string; name: string; country?: string }) {
  const [row] = await db
    .insert(hr_org_holidays)
    .values({ date: input.date, name: input.name, country: input.country ?? "" })
    .onConflictDoUpdate({
      target: [hr_org_holidays.date, hr_org_holidays.country],
      set: { name: input.name, updated_at: new Date() },
    })
    .returning();
  return row;
}

export async function deleteHoliday(id: number) {
  const [row] = await db.delete(hr_org_holidays).where(eq(hr_org_holidays.id, id)).returning();
  if (!row) throw new AppError("Holiday not found", 404, "HOLIDAY_NOT_FOUND");
  return row;
}

/**
 * Roll unused days from `fromYear` into `fromYear + 1`, capped per policy at `max_carry_over`.
 * Idempotent: the target year's balances are created first, then carried_over_days is *set*
 * (not incremented), so a re-run lands on the same numbers.
 */
export async function applyCarryOver(fromYear: number): Promise<{ carried: number }> {
  const toYear = fromYear + 1;

  const rows = await db
    .select({
      employeeId: hr_leave_balances.employee_id,
      type: hr_leave_balances.type,
      entitled: hr_leave_balances.entitled_days,
      carried: hr_leave_balances.carried_over_days,
      used: hr_leave_balances.used_days,
      maxCarryOver: hr_leave_policies.max_carry_over,
    })
    .from(hr_leave_balances)
    .innerJoin(employees, eq(employees.id, hr_leave_balances.employee_id))
    .innerJoin(
      hr_leave_policies,
      and(
        eq(hr_leave_policies.employment_type, employees.employment_type),
        eq(hr_leave_policies.type, hr_leave_balances.type),
      ),
    )
    .where(and(eq(hr_leave_balances.year, fromYear), ne(employees.status, "exited")));

  let carried = 0;
  for (const row of rows) {
    const remaining = Number(row.entitled) + Number(row.carried) - Number(row.used);
    const amount = Math.max(0, Math.min(remaining, Number(row.maxCarryOver)));
    if (amount === 0) continue;

    await ensureBalances(row.employeeId, toYear).catch(() => {});
    await db
      .update(hr_leave_balances)
      .set({ carried_over_days: String(amount), updated_at: new Date() })
      .where(
        and(
          eq(hr_leave_balances.employee_id, row.employeeId),
          eq(hr_leave_balances.year, toYear),
          eq(hr_leave_balances.type, row.type),
        ),
      );
    carried++;
  }

  return { carried };
}

/** Create the current year's balances for everyone still employed (deploy-time backfill). */
export async function backfillBalances(year: number): Promise<{ processed: number }> {
  const staff = await db
    .select({ id: employees.id })
    .from(employees)
    .where(ne(employees.status, "exited"));

  let processed = 0;
  for (const row of staff) {
    try {
      await ensureBalances(row.id, year);
      processed++;
    } catch {
      // No policy for that employment type yet — skip rather than abort the whole run.
    }
  }
  return { processed };
}

/** Manual balance adjustment (HR only) — the note is required for the audit trail. */
export async function adjustBalance(
  balanceId: number,
  patch: { entitled_days?: number; carried_over_days?: number; used_days?: number },
  note: string,
) {
  if (!note?.trim()) {
    throw new AppError("An adjustment note is required", 422, "ADJUSTMENT_NOTE_REQUIRED");
  }

  const set: Record<string, unknown> = { updated_at: new Date() };
  if (patch.entitled_days != null) set.entitled_days = String(patch.entitled_days);
  if (patch.carried_over_days != null) set.carried_over_days = String(patch.carried_over_days);
  if (patch.used_days != null) set.used_days = String(patch.used_days);

  const [row] = await db
    .update(hr_leave_balances)
    .set(set)
    .where(eq(hr_leave_balances.id, balanceId))
    .returning();

  if (!row) throw new AppError("Balance not found", 404, "BALANCE_NOT_FOUND");
  return row;
}
