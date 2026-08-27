import { httpClient } from "@/services/http.service";
import type { Leave } from "@/types/api";

export const leavesService = {
  /**
   * Role-scoped leave request list: own + reports' for an employee/manager, everyone's for
   * HR/admin — resolved server-side in `listVisibleLeaves`. Was `/hr/leaves`, an HR-only
   * (`leave:manage`) admin route that 403'd for every non-HR viewer of the "Leave Requests" table.
   */
  async getLeaves(params?: { employeeId?: string; status?: string }) {
    const response = await httpClient.get<{ leaves: Leave[] }>("/hr/leave/requests", { params });
    return response.data.leaves;
  },
  async createLeave(payload: Omit<Leave, "id">) {
    const response = await httpClient.post<Leave>("/hr/leaves", payload);
    return response.data;
  },
  async updateLeaveStatus(id: string, status: Leave["status"]) {
    const response = await httpClient.patch<Leave>(`/hr/leaves/${id}/status`, { status });
    return response.data;
  },
};
