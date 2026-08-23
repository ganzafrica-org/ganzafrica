import { httpClient } from "@/services/http.service";

export type LeaveTypeName = "ANNUAL" | "SICK" | "MATERNITY" | "PATERNITY" | "UNPAID" | "OTHER";
export type LeaveStatusName = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type EmploymentType = "fellow" | "analyst" | "staff" | "contractor" | "intern";

export interface LeaveBalance {
  id: number;
  employee_id: string;
  year: number;
  type: LeaveTypeName;
  entitled_days: string;
  carried_over_days: string;
  used_days: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string | null;
  type: LeaveTypeName;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveStatusName;
  days: string | null;
  approver_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface LeavePolicy {
  id: number;
  employment_type: EmploymentType;
  type: LeaveTypeName;
  annual_days: string;
  max_carry_over: string;
}

export interface OrgHoliday {
  id: number;
  date: string;
  name: string;
  /** "" = universal (applies regardless of country); otherwise matches employees.home_country. */
  country: string;
}

/** Lightweight attachment metadata — open it via documentsService.getDocument(id) + DocumentViewer. */
export interface LeaveAttachment {
  id: string;
  document_name: string;
  file_size: string;
  created_at: string;
}

/** GET /hr/leave/calendar row — any status, in range, scoped to the viewer's team (or org for HR). */
export interface CalendarLeaveEvent {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePicture: string | null;
  type: LeaveTypeName;
  startDate: string;
  endDate: string;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
  reason: string;
}

export interface LeaveDraft {
  type: LeaveTypeName;
  startDate: string;
  endDate: string;
  reason?: string;
}

/** Dry-run result backing the request dialog's day count and insufficient-balance state. */
export interface LeaveValidation {
  days: number;
  remaining: number;
  sufficient: boolean;
}

/** Remaining = entitled + carried over − used. */
export function remainingDays(balance: LeaveBalance): number {
  return (
    Number(balance.entitled_days) + Number(balance.carried_over_days) - Number(balance.used_days)
  );
}

export const leaveBalancesService = {
  async getMine(year?: number) {
    const { data } = await httpClient.get<{ balances: LeaveBalance[]; requests: LeaveRequest[] }>(
      "/hr/me/leave",
      { params: year ? { year } : undefined },
    );
    return data;
  },

  async request(payload: LeaveDraft) {
    const { data } = await httpClient.post<{ leave: LeaveRequest }>("/hr/me/leave", payload);
    return data.leave;
  },

  async validate(payload: LeaveDraft) {
    const { data } = await httpClient.post<LeaveValidation>("/hr/me/leave/validate", payload);
    return data;
  },

  async pendingApprovals() {
    const { data } = await httpClient.get<{ leaves: LeaveRequest[] }>(
      "/hr/leave/pending-approvals",
    );
    return data.leaves;
  },

  async approve(id: string, note?: string) {
    const { data } = await httpClient.post<{ leave: LeaveRequest }>(`/hr/leave/${id}/approve`, {
      note,
    });
    return data.leave;
  },

  async reject(id: string, note: string) {
    const { data } = await httpClient.post<{ leave: LeaveRequest }>(`/hr/leave/${id}/reject`, {
      note,
    });
    return data.leave;
  },

  async cancel(id: string) {
    const { data } = await httpClient.post<{ leave: LeaveRequest }>(`/hr/leave/${id}/cancel`, {});
    return data.leave;
  },

  async listAttachments(leaveId: string) {
    const { data } = await httpClient.get<{ attachments: LeaveAttachment[] }>(
      `/hr/leave/${leaveId}/attachments`,
    );
    return data.attachments;
  },

  /** Optional — a leave request is fully submittable with none of these. */
  async uploadAttachment(leaveId: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    const { data } = await httpClient.post<{ document: { id: string } }>(
      `/hr/leave/${leaveId}/attachments`,
      form,
    );
    return data.document;
  },

  async calendar(from: string, to: string) {
    const { data } = await httpClient.get<{ events: CalendarLeaveEvent[] }>("/hr/leave/calendar", {
      params: { from, to },
    });
    return data.events;
  },

  async listPolicies() {
    const { data } = await httpClient.get<{ policies: LeavePolicy[] }>("/hr/leave-policies");
    return data.policies;
  },

  async savePolicy(payload: {
    employment_type: EmploymentType;
    type: LeaveTypeName;
    annual_days: number;
    max_carry_over?: number;
  }) {
    const { data } = await httpClient.post<{ policy: LeavePolicy }>("/hr/leave-policies", payload);
    return data.policy;
  },

  async deletePolicy(id: number) {
    await httpClient.delete(`/hr/leave-policies/${id}`);
  },

  async listHolidays(year?: number) {
    const { data } = await httpClient.get<{ holidays: OrgHoliday[] }>("/hr/holidays", {
      params: year ? { year } : undefined,
    });
    return data.holidays;
  },

  /** Union of universal + every represented country's holidays — the Leave Calendar's display. */
  async listRelevantHolidays(year?: number) {
    const { data } = await httpClient.get<{ holidays: OrgHoliday[] }>("/hr/holidays", {
      params: { scope: "relevant", ...(year ? { year } : undefined) },
    });
    return data.holidays;
  },

  async createHoliday(payload: { date: string; name: string; country?: string }) {
    const { data } = await httpClient.post<{ holiday: OrgHoliday }>("/hr/holidays", payload);
    return data.holiday;
  },

  async deleteHoliday(id: number) {
    await httpClient.delete(`/hr/holidays/${id}`);
  },

  async adjustBalance(
    id: number,
    payload: {
      entitled_days?: number;
      carried_over_days?: number;
      used_days?: number;
      note: string;
    },
  ) {
    const { data } = await httpClient.patch<{ balance: LeaveBalance }>(
      `/hr/leave-balances/${id}`,
      payload,
    );
    return data.balance;
  },
};
