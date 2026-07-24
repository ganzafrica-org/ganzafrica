export type EmployeeLeaveStatus = "pending" | "approved" | "rejected";

export interface EmployeeLeaveRequest {
  id: number;
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
