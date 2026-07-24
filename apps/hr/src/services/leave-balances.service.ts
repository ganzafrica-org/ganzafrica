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

  async calendar(from: string, to: string) {
    const { data } = await httpClient.get<{ events: LeaveRequest[] }>("/hr/leave/calendar", {
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

  async createHoliday(payload: { date: string; name: string }) {
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
