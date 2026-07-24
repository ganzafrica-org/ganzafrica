export type LeaveType = "ANNUAL" | "SICK" | "MATERNITY" | "PATERNITY" | "UNPAID" | "OTHER";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface LeaveRecord {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string | null;
  status: LeaveStatus;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeaveInput {
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason?: string | null;
}

export interface UpdateLeaveInput {
  type?: LeaveType;
  startDate?: Date;
  endDate?: Date;
  reason?: string | null;
}
