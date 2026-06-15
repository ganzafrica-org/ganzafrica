import { and, asc, desc, eq, gte, lte, or } from "drizzle-orm";
import { db, withDbTransaction } from "@/db/client";
import { hr_leaves, hr_users } from "@/db/schema";
import { AppError } from "@/middlewares";

export type HrRole = "EMPLOYEE" | "IT" | "HR";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";
export type UserStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE";

export interface RequestUser {
  id: string;
  role?: string;
}

export interface CreateLeaveInput {
  type: "ANNUAL" | "SICK" | "MATERNITY" | "PATERNITY" | "OTHER";
  startDate: Date;
  endDate: Date;
  reason: string;
}

export interface ListQuery {
  page: number;
  limit: number;
}

function durationDays(start: Date, end: Date): number {
  const startDay = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const endDay = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  return Math.floor((endDay - startDay) / (24 * 60 * 60 * 1000)) + 1;
}

function todayUtcStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

export async function listLeaves(requester: RequestUser, query: ListQuery) {
  const role = requester.role as HrRole | undefined;

  const whereClause =
    role === "HR" ? undefined : eq(hr_leaves.user_id, requester.id);

  const all = await db.select().from(hr_leaves).where(whereClause);
  const total = all.length;

  const rows = await db
    .select()
    .from(hr_leaves)
    .where(whereClause)
    .orderBy(desc(hr_leaves.created_at))
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);

  const data = rows.map((l) => ({
    id: l.id,
    userId: l.user_id,
    type: l.type,
    startDate: l.start_date,
    endDate: l.end_date,
    reason: l.reason,
    status: l.status,
    reviewedById: l.reviewed_by_id,
    reviewedAt: l.reviewed_at,
    durationDays: durationDays(l.start_date, l.end_date),
    createdAt: l.created_at,
    updatedAt: l.updated_at,
  }));

  return { data, total };
}

export async function getLeave(requester: RequestUser, id: string) {
  const role = requester.role as HrRole | undefined;

  const rows = await db.select().from(hr_leaves).where(eq(hr_leaves.id, id)).limit(1);
  if (!rows.length) throw new AppError("Leave not found", 404);
  const leave = rows[0];

  if (role !== "HR" && leave.user_id !== requester.id) throw new AppError("Forbidden", 403);

  return {
    id: leave.id,
    userId: leave.user_id,
    type: leave.type,
    startDate: leave.start_date,
    endDate: leave.end_date,
    reason: leave.reason,
    status: leave.status,
    reviewedById: leave.reviewed_by_id,
    reviewedAt: leave.reviewed_at,
    durationDays: durationDays(leave.start_date, leave.end_date),
    createdAt: leave.created_at,
    updatedAt: leave.updated_at,
  };
}

export async function createLeave(requester: RequestUser, input: CreateLeaveInput) {
  const role = requester.role as HrRole | undefined;
  if (role !== "EMPLOYEE" && role !== "IT") throw new AppError("Forbidden", 403);

  if (input.endDate < input.startDate) throw new AppError("End date must be after start date", 400);

  // Overlap check: existing.start <= new.end AND existing.end >= new.start
  const overlaps = await db
    .select({ id: hr_leaves.id })
    .from(hr_leaves)
    .where(
      and(
        eq(hr_leaves.user_id, requester.id),
        lte(hr_leaves.start_date, input.endDate),
        gte(hr_leaves.end_date, input.startDate),
        or(eq(hr_leaves.status, "PENDING"), eq(hr_leaves.status, "APPROVED")),
      ),
    )
    .limit(1);

  if (overlaps.length) throw new AppError("Overlapping leave request exists", 409);

  const inserted = await db
    .insert(hr_leaves)
    .values({
      user_id: requester.id,
      type: input.type,
      start_date: input.startDate,
      end_date: input.endDate,
      reason: input.reason,
      status: "PENDING",
    })
    .returning();

  return inserted[0];
}

export async function reviewLeave(requester: RequestUser, leaveId: string, status: "APPROVED" | "REJECTED") {
  if (requester.role !== "HR") throw new AppError("Forbidden", 403);

  return await withDbTransaction(async (tx) => {
    const rows = await tx.select().from(hr_leaves).where(eq(hr_leaves.id, leaveId)).limit(1);
    if (!rows.length) throw new AppError("Leave not found", 404);
    const leave = rows[0];

    const reviewedAt = new Date();

    const updated = await tx
      .update(hr_leaves)
      .set({
        status,
        reviewed_by_id: requester.id,
        reviewed_at: reviewedAt,
        updated_at: reviewedAt,
      })
      .where(eq(hr_leaves.id, leaveId))
      .returning();

    const nowStart = todayUtcStart();
    const shouldSetOnLeave = status === "APPROVED" && leave.start_date <= nowStart;

    if (shouldSetOnLeave) {
      await tx.update(hr_users).set({ status: "ON_LEAVE", updated_at: reviewedAt }).where(eq(hr_users.id, leave.user_id));
    } else if (status === "REJECTED") {
      await tx.update(hr_users).set({ status: "ACTIVE", updated_at: reviewedAt }).where(eq(hr_users.id, leave.user_id));
    }

    return updated[0];
  });
}

export async function cancelLeave(requester: RequestUser, leaveId: string): Promise<void> {
  const role = requester.role as HrRole | undefined;
  if (role !== "EMPLOYEE" && role !== "IT") throw new AppError("Forbidden", 403);

  await withDbTransaction(async (tx) => {
    const rows = await tx.select().from(hr_leaves).where(eq(hr_leaves.id, leaveId)).limit(1);
    if (!rows.length) throw new AppError("Leave not found", 404);
    const leave = rows[0];
    if (leave.user_id !== requester.id) throw new AppError("Forbidden", 403);
    if (leave.status !== "PENDING") throw new AppError("Only pending leave can be cancelled", 400);

    await tx.delete(hr_leaves).where(eq(hr_leaves.id, leaveId));

    // Revert user status to ACTIVE on cancel
    await tx.update(hr_users).set({ status: "ACTIVE", updated_at: new Date() }).where(eq(hr_users.id, requester.id));
  });
}

