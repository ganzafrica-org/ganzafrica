import { and, desc, eq, gte, lte, or } from "drizzle-orm";
import { db, withDbTransaction } from "@/db/client";
import { hr_leaves, hr_users } from "@/db/schema";
import { AppError } from "@/middlewares";
import { assertEmployeeAccess, getActiveEmployee } from "../../services/hr/employee.service";
import type { HrRequester } from "@/types/employee.types";
import { sendNotification, resolveTriggeredByFromHrUser } from "@/modules/hr/notifications/notification.service";
import type {
  CreateLeaveInput,
  LeaveRecord,
  LeaveStatus,
  UpdateLeaveInput,
} from "@/types/leave.types";

function mapLeave(row: typeof hr_leaves.$inferSelect): LeaveRecord {
  return {
    id: row.id,
    employeeId: row.user_id,
    type: row.type,
    startDate: row.start_date,
    endDate: row.end_date,
    reason: row.reason,
    status: row.status,
    reviewedBy: row.reviewed_by_id,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateLeaveDates(startDate: Date, endDate: Date): void {
  if (endDate < startDate) throw new AppError("End date must be after start date", 400);
}

async function assertNoOverlappingLeave(
  employeeId: string,
  startDate: Date,
  endDate: Date,
  excludeLeaveId?: string,
): Promise<void> {
  const rows = await db
    .select({ id: hr_leaves.id })
    .from(hr_leaves)
    .where(
      and(
        eq(hr_leaves.user_id, employeeId),
        lte(hr_leaves.start_date, endDate),
        gte(hr_leaves.end_date, startDate),
        or(eq(hr_leaves.status, "PENDING"), eq(hr_leaves.status, "APPROVED")),
      ),
    );

  const conflict = rows.find((r) => r.id !== excludeLeaveId);
  if (conflict) throw new AppError("Overlapping leave request exists", 409);
}

function todayUtcStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

export async function listAllLeaves(requester: HrRequester): Promise<LeaveRecord[]> {
  if (requester.role !== "HR") throw new AppError("Forbidden", 403);

  const rows = await db.select().from(hr_leaves).orderBy(desc(hr_leaves.created_at));
  return rows.map(mapLeave);
}

export async function listLeavesByEmployee(
  requester: HrRequester,
  employeeId: string,
): Promise<LeaveRecord[]> {
  if (requester.role === "IT") throw new AppError("Forbidden", 403);
  assertEmployeeAccess(requester, employeeId, ["HR", "EMPLOYEE"]);

  const rows = await db
    .select()
    .from(hr_leaves)
    .where(eq(hr_leaves.user_id, employeeId))
    .orderBy(desc(hr_leaves.created_at));

  return rows.map(mapLeave);
}

export async function getLeaveById(requester: HrRequester, leaveId: string): Promise<LeaveRecord> {
  const rows = await db.select().from(hr_leaves).where(eq(hr_leaves.id, leaveId)).limit(1);
  if (!rows.length) throw new AppError("Leave not found", 404);

  const leave = rows[0];
  if (requester.role === "IT") throw new AppError("Forbidden", 403);
  if (requester.role === "EMPLOYEE" && leave.user_id !== requester.id) {
    throw new AppError("Forbidden", 403);
  }

  return mapLeave(leave);
}

export async function createLeave(
  requester: HrRequester,
  employeeId: string,
  input: CreateLeaveInput,
): Promise<LeaveRecord> {
  if (requester.role === "IT") throw new AppError("Forbidden", 403);

  if (requester.role === "EMPLOYEE" && requester.id !== employeeId) {
    throw new AppError("Forbidden", 403);
  }

  await getActiveEmployee(employeeId);
  validateLeaveDates(input.startDate, input.endDate);
  await assertNoOverlappingLeave(employeeId, input.startDate, input.endDate);

  const [inserted] = await db
    .insert(hr_leaves)
    .values({
      user_id: employeeId,
      type: input.type,
      start_date: input.startDate,
      end_date: input.endDate,
      reason: input.reason ?? "",
      status: "PENDING",
    })
    .returning();

  if (!inserted) throw new AppError("Failed to create leave", 400);

  try {
    await sendNotification({
      type: "LEAVE_REQUESTED",
      triggeredBy: await resolveTriggeredByFromHrUser(requester.id),
      relatedEntity: { leaveId: inserted.id, employeeId },
      title: "Leave request submitted",
      message: `A ${inserted.type} leave request is pending review.`,
      priority: "NORMAL",
    });
  } catch {
    // notification failure must not break the main operation
  }

  return mapLeave(inserted);
}

export async function updateLeave(
  requester: HrRequester,
  leaveId: string,
  input: UpdateLeaveInput,
): Promise<LeaveRecord> {
  const rows = await db.select().from(hr_leaves).where(eq(hr_leaves.id, leaveId)).limit(1);
  if (!rows.length) throw new AppError("Leave not found", 404);

  const leave = rows[0];
  if (requester.role === "IT") throw new AppError("Forbidden", 403);

  if (requester.role === "EMPLOYEE") {
    if (leave.user_id !== requester.id) throw new AppError("Forbidden", 403);
    if (leave.status !== "PENDING") throw new AppError("Only pending leave can be updated", 400);
  }

  const startDate = input.startDate ?? leave.start_date;
  const endDate = input.endDate ?? leave.end_date;
  validateLeaveDates(startDate, endDate);

  if (input.startDate !== undefined || input.endDate !== undefined) {
    await assertNoOverlappingLeave(leave.user_id, startDate, endDate, leaveId);
  }

  const patch: Partial<typeof hr_leaves.$inferInsert> = { updated_at: new Date() };

  if (input.type !== undefined) patch.type = input.type;
  if (input.startDate !== undefined) patch.start_date = input.startDate;
  if (input.endDate !== undefined) patch.end_date = input.endDate;
  if (input.reason !== undefined) patch.reason = input.reason ?? "";

  const [updated] = await db.update(hr_leaves).set(patch).where(eq(hr_leaves.id, leaveId)).returning();
  if (!updated) throw new AppError("Leave not found", 404);

  return mapLeave(updated);
}

export async function cancelLeave(requester: HrRequester, leaveId: string): Promise<LeaveRecord> {
  const rows = await db.select().from(hr_leaves).where(eq(hr_leaves.id, leaveId)).limit(1);
  if (!rows.length) throw new AppError("Leave not found", 404);

  const leave = rows[0];
  if (requester.role === "IT") throw new AppError("Forbidden", 403);

  if (requester.role === "EMPLOYEE") {
    if (leave.user_id !== requester.id) throw new AppError("Forbidden", 403);
    if (leave.status !== "PENDING") throw new AppError("Only pending leave can be cancelled", 400);
  }

  const [updated] = await db
    .update(hr_leaves)
    .set({ status: "CANCELLED", updated_at: new Date() })
    .where(eq(hr_leaves.id, leaveId))
    .returning();

  if (!updated) throw new AppError("Leave not found", 404);

  try {
    await sendNotification({
      type: "LEAVE_CANCELLED",
      triggeredBy: await resolveTriggeredByFromHrUser(requester.id),
      relatedEntity: { leaveId: updated.id, employeeId: leave.user_id },
      title: "Leave cancelled",
      message: "A leave request has been cancelled.",
      priority: "LOW",
    });
  } catch {
    // notification failure must not break the main operation
  }

  return mapLeave(updated);
}

async function reviewLeave(
  requester: HrRequester,
  leaveId: string,
  status: Extract<LeaveStatus, "APPROVED" | "REJECTED">,
): Promise<LeaveRecord> {
  if (requester.role !== "HR") throw new AppError("Forbidden", 403);

  return await withDbTransaction(async (tx) => {
    const rows = await tx.select().from(hr_leaves).where(eq(hr_leaves.id, leaveId)).limit(1);
    if (!rows.length) throw new AppError("Leave not found", 404);

    const leave = rows[0];
    if (leave.status !== "PENDING") throw new AppError("Only pending leave can be reviewed", 400);

    const reviewedAt = new Date();

    const [updated] = await tx
      .update(hr_leaves)
      .set({
        status,
        reviewed_by_id: requester.id,
        reviewed_at: reviewedAt,
        updated_at: reviewedAt,
      })
      .where(eq(hr_leaves.id, leaveId))
      .returning();

    if (!updated) throw new AppError("Leave not found", 404);

    const nowStart = todayUtcStart();
    if (status === "APPROVED" && leave.start_date <= nowStart) {
      await tx
        .update(hr_users)
        .set({ status: "ON_LEAVE", updated_at: reviewedAt })
        .where(eq(hr_users.id, leave.user_id));
    } else if (status === "REJECTED") {
      await tx
        .update(hr_users)
        .set({ status: "ACTIVE", updated_at: reviewedAt })
        .where(eq(hr_users.id, leave.user_id));
    }

    const leaveResult = mapLeave(updated);

    try {
      const notificationType = status === "APPROVED" ? "LEAVE_APPROVED" : "LEAVE_REJECTED";
      await sendNotification({
        type: notificationType,
        triggeredBy: await resolveTriggeredByFromHrUser(requester.id),
        relatedEntity: { leaveId: updated.id, employeeId: leave.user_id },
        title: status === "APPROVED" ? "Leave approved" : "Leave rejected",
        message:
          status === "APPROVED"
            ? "Your leave request has been approved."
            : "Your leave request has been rejected.",
        priority: "HIGH",
      });
    } catch {
      // notification failure must not break the main operation
    }

    if (status === "APPROVED" && leave.start_date <= nowStart) {
      try {
        await sendNotification({
          type: "EMPLOYEE_STATUS_CHANGED",
          triggeredBy: await resolveTriggeredByFromHrUser(requester.id),
          relatedEntity: { employeeId: leave.user_id },
          title: "Employee status updated",
          message: "Employee status changed to ON_LEAVE following approved leave.",
          priority: "NORMAL",
        });
      } catch {
        // notification failure must not break the main operation
      }
    }

    return leaveResult;
  });
}

export async function approveLeave(requester: HrRequester, leaveId: string): Promise<LeaveRecord> {
  return reviewLeave(requester, leaveId, "APPROVED");
}

export async function rejectLeave(requester: HrRequester, leaveId: string): Promise<LeaveRecord> {
  return reviewLeave(requester, leaveId, "REJECTED");
}
