import { httpClient } from "@/services/http.service"
import type { Asset, AssetStats, CreateAssetRequest, PaginatedResponse, UpdateAssetRequest } from "@/types/api"

export const assetsService = {
    async getAssets(params?: { search?: string; ownerId?: string; fromDate?: string; page?: number; limit?: number }) {
        const response = await httpClient.get<PaginatedResponse<Asset>>("/assets", { params })
        return response.data
    },
    async getAssetById(id: string) {
        const response = await httpClient.get<Asset>(`/assets/${id}`)
        return response.data
    },
    async getAssetStats() {
        const response = await httpClient.get<AssetStats>("/assets/stats")
        return response.data
    },
    async createAsset(payload: CreateAssetRequest) {
        const response = await httpClient.post<Asset>("/assets", payload)
        return response.data
    },
    async updateAsset(id: string, payload: UpdateAssetRequest) {
        const response = await httpClient.patch<Asset>(`/assets/${id}`, payload)
        return response.data
    },
    async deleteAsset(id: string) {
        await httpClient.delete(`/assets/${id}`)
    },
    async assignAsset(id: string, employeeId: string) {
        const response = await httpClient.post<Asset>(`/assets/${id}/assign`, { employeeId })
        return response.data
    },
    async unassignAsset(id: string) {
        const response = await httpClient.post<Asset>(`/assets/${id}/unassign`)
        return response.data
    },
}
