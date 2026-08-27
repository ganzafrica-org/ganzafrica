export type EmployeeLeaveStatus = "pending" | "approved" | "rejected";

export interface EmployeeLeaveRequest {
  id: number;
  /** The real hr_leaves.id (uuid) — `id` above is a display/table-key number, not the API id. */
  realId: string;
  employeeId: string;
  name: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: EmployeeLeaveStatus;
  appliedDate: string;
  reason: string;
  approver: string;
  coveringEmployee: string;
}
