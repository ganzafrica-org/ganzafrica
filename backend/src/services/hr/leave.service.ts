import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { hr_leaves } from "@/db/schema";
import { AppError } from "@/middlewares";
import type { LeaveRecord } from "@/types/leave.types";

/**
 * MOD-06 is the real leave engine (employees model, `leave-core.service.ts`). This file used to
 * hold a parallel hr_users-shaped CRUD; that is retired with the hr_users drop. What remains is the
 * MOD-06 re-export surface plus the admin list still mounted at `GET /hr/leaves`, now backed by the
 * employees model. Mutating operations moved to `/hr/me/leave` and `/hr/leave/:id/*` (MOD-06).
 */
export {
  ensureBalances,
  requestLeave,
  decideLeave,
  cancelLeaveRequest,
  computeWorkingDays,
  remainingDays,
  listPendingApprovals,
  getLeaveCalendar,
  getMyLeave,
  adjustBalance,
  applyCarryOver,
  backfillBalances,
} from "./leave-core.service";
export type { LeaveTypeName, LeaveDecision, LeaveRequestInput } from "./leave-core.service";

function mapLeave(row: typeof hr_leaves.$inferSelect): LeaveRecord {
  return {
    id: row.id,
    employeeId: row.employee_id ?? "",
    type: row.type,
    startDate: row.start_date,
    endDate: row.end_date,
    reason: row.reason,
    status: row.status,
    reviewedBy: row.reviewed_by_employee_id,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Admin list backing `GET /hr/leaves` (gated on leave:manage in the route). */
export async function listAllLeaves(): Promise<LeaveRecord[]> {
  const rows = await db.select().from(hr_leaves).orderBy(desc(hr_leaves.created_at));
  return rows.map(mapLeave);
}

/** Single leave lookup, kept for the detail route. */
export async function getLeaveById(leaveId: string): Promise<LeaveRecord> {
  const [row] = await db.select().from(hr_leaves).where(eq(hr_leaves.id, leaveId)).limit(1);
  if (!row) throw new AppError("Leave not found", 404, "LEAVE_NOT_FOUND");
  return mapLeave(row);
}
