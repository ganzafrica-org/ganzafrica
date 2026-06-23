import { httpClient } from "@/services/http.service"
import type {
  Asset,
  AssetCategory,
  AssetStats,
  CreateAssetRequest,
  CreateCategoryRequest,
  UpdateAssetRequest,
  UpdateCategoryRequest,
} from "@/types/api"

const BASE = "/hr/assets"

export const assetsService = {
  // ── Assets ────────────────────────────────────────────────────────────────

  async getAssets(params?: {
    assignedTo?: string
    hasIssue?: "YES" | "NO"
    isFlagged?: boolean
  }) {
    const response = await httpClient.get<Asset[]>(BASE, { params })
    return response.data
  },

  async getAssetById(id: string) {
    const response = await httpClient.get<Asset>(`${BASE}/${id}`)
    return response.data
  },

  async getAssetStats() {
    const response = await httpClient.get<AssetStats>(`${BASE}/stats`)
    return response.data
  },

  /**
   * Creates an asset with optional image files.
   * Sends as multipart/form-data when images are provided, JSON otherwise.
   */
  async createAsset(payload: CreateAssetRequest, imageFiles?: File[]) {
    if (imageFiles && imageFiles.length > 0) {
      const form = new FormData()
      // Append all JSON fields as individual form fields
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return
        if (key === "specs" && Array.isArray(value)) {
          form.append(key, JSON.stringify(value))
        } else {
          form.append(key, String(value))
        }
      })
      imageFiles.forEach((file) => form.append("images", file))
      const response = await httpClient.post<Asset>(BASE, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return response.data
    }
    const response = await httpClient.post<Asset>(BASE, payload)
    return response.data
  },

  /**
   * Updates an asset. Appends new images if provided (does not replace existing ones).
   */
  async updateAsset(id: string, payload: UpdateAssetRequest, imageFiles?: File[]) {
    if (imageFiles && imageFiles.length > 0) {
      const form = new FormData()
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return
        if (key === "specs" && Array.isArray(value)) {
          form.append(key, JSON.stringify(value))
        } else {
          form.append(key, String(value))
        }
      })
      imageFiles.forEach((file) => form.append("images", file))
      const response = await httpClient.patch<Asset>(`${BASE}/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return response.data
    }
    const response = await httpClient.patch<Asset>(`${BASE}/${id}`, payload)
    return response.data
  },

  async deleteAsset(id: string) {
    await httpClient.delete(`${BASE}/${id}`)
  },

  async deleteAssetImage(assetId: string, imageId: string) {
    await httpClient.delete(`${BASE}/${assetId}/images/${imageId}`)
  },

  // ── Categories ────────────────────────────────────────────────────────────

  async getCategories() {
    const response = await httpClient.get<AssetCategory[]>(`${BASE}/categories`)
    return response.data
  },

  async getCategoryById(id: string) {
    const response = await httpClient.get<AssetCategory>(`${BASE}/categories/${id}`)
    return response.data
  },

  async createCategory(payload: CreateCategoryRequest) {
    const response = await httpClient.post<AssetCategory>(`${BASE}/categories`, payload)
    return response.data
  },

  async updateCategory(id: string, payload: UpdateCategoryRequest) {
    const response = await httpClient.patch<AssetCategory>(`${BASE}/categories/${id}`, payload)
    return response.data
  },

  async deactivateCategory(id: string) {
    await httpClient.delete(`${BASE}/categories/${id}`)
  },
}
