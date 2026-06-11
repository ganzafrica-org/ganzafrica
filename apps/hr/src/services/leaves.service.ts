import { httpClient } from "@/services/http.service"
import type { Leave } from "@/types/api"

export const leavesService = {
    async getLeaves(params?: { employeeId?: string; status?: string }) {
        const response = await httpClient.get<Leave[]>("/leaves", { params })
        return response.data
    },
    async createLeave(payload: Omit<Leave, "id">) {
        const response = await httpClient.post<Leave>("/leaves", payload)
        return response.data
    },
    async updateLeaveStatus(id: string, status: Leave["status"]) {
        const response = await httpClient.patch<Leave>(`/leaves/${id}/status`, { status })
        return response.data
    },
}
