import { httpClient } from "@/services/http.service"
import type { PaginatedResponse, Policy } from "@/types/api"

export const policiesService = {
    async getPolicies(params?: { search?: string; feature?: string; status?: string; page?: number; limit?: number }) {
        const response = await httpClient.get<Policy[] | PaginatedResponse<Policy>>("/policies", { params })
        return response.data
    },
}
