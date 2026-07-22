import { httpClient } from "@/services/http.service";
import type {
  Asset,
  AssetCategory,
  CreateAssetRequest,
  CreateCategoryRequest,
  UpdateAssetRequest,
  UpdateCategoryRequest,
  AssetMaintenance,
  AssetHistoryEntry,
  AssignAssetRequest,
  CreateMaintenanceRequest,
  ReturnAssetRequest,
  UpdateMaintenanceRequest,
} from "@/types/api";

const BASE = "/hr/assets";

export const assetsService = {
  // ── Assets ────────────────────────────────────────────────────────────────
  async getAssets(params?: {
    assignedTo?: string;
    hasIssue?: "YES" | "NO";
    isFlagged?: boolean;
  }): Promise<Asset[]> {
    // Define the custom object payload structure inside the Axios generic <...>
    const result = await httpClient.get<{ success: boolean; data: Asset[] }>(BASE, { params });
    const response = result.data.data;
    return response;
  },

  async getAssetById(id: string): Promise<Asset> {
    // Wrap the expected Asset response type matching your API structure
    const result = await httpClient.get<{ success: boolean; data: Asset }>(`${BASE}/${id}`);
    return result.data.data;
  },

  /**
   * Creates an asset with optional image files.
   * Sends as multipart/form-data when images are provided, JSON otherwise.
   */
  async createAsset(payload: CreateAssetRequest, imageFiles?: File[]): Promise<Asset> {
    if (imageFiles && imageFiles.length > 0) {
      const form = new FormData();
      // Append all JSON fields as individual form fields
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (key === "specs" && Array.isArray(value)) {
          form.append(key, JSON.stringify(value));
        } else {
          form.append(key, String(value));
        }
      });
      imageFiles.forEach((file) => form.append("images", file));
      const result = await httpClient.post<{ success: boolean; data: Asset }>(BASE, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return result.data.data;
    }
    const result = await httpClient.post<{ success: boolean; data: Asset }>(BASE, payload);
    return result.data.data;
  },

  /**
   * Updates an asset. Appends new images if provided (does not replace existing ones).
   */
  async updateAsset(id: string, payload: UpdateAssetRequest, imageFiles?: File[]): Promise<Asset> {
    if (imageFiles && imageFiles.length > 0) {
      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (key === "specs" && Array.isArray(value)) {
          form.append(key, JSON.stringify(value));
        } else if (typeof value === "boolean") {
          form.append(key, JSON.stringify(value)); // ← sends "true" or "false" as JSON boolean string
        } else {
          form.append(key, String(value));
        }
      });
      imageFiles.forEach((file) => form.append("images", file));
      const response = await httpClient.patch<{ success: boolean; data: Asset }>(
        `${BASE}/${id}`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data.data;
    }
    const response = await httpClient.patch<{ success: boolean; data: Asset }>(
      `${BASE}/${id}`,
      payload,
    );
    return response.data.data;
  },

  async deleteAsset(id: string): Promise<void> {
    await httpClient.delete(`${BASE}/${id}`);
  },

  async deleteAssetImage(assetId: string, imageId: string): Promise<void> {
    await httpClient.delete(`${BASE}/${assetId}/images/${imageId}`);
  },

  // ── Categories ────────────────────────────────────────────────────────────

  async getCategories(): Promise<AssetCategory[]> {
    const result = await httpClient.get<{ success: boolean; data: AssetCategory[] }>(
      `${BASE}/categories`,
    );
    return result.data.data;
  },

  async getCategoryById(id: string): Promise<AssetCategory> {
    const result = await httpClient.get<{ success: boolean; data: AssetCategory }>(
      `${BASE}/categories/${id}`,
    );
    return result.data.data;
  },

  async createCategory(payload: CreateCategoryRequest): Promise<AssetCategory> {
    const result = await httpClient.post<{ success: boolean; data: AssetCategory }>(
      `${BASE}/categories`,
      payload,
    );
    return result.data.data;
  },

  async updateCategory(id: string, payload: UpdateCategoryRequest): Promise<AssetCategory> {
    const result = await httpClient.patch<{
      success: boolean;
      data: AssetCategory;
    }>(`${BASE}/categories/${id}`, payload);
    return result.data.data;
  },

  async deactivateCategory(id: string): Promise<void> {
    await httpClient.delete(`${BASE}/categories/${id}`);
  },

  // ── Maintenance ───────────────────────────────────────────────────────────

  async listMaintenance(assetId?: string): Promise<AssetMaintenance[]> {
    const result = await httpClient.get<{ success: boolean; data: AssetMaintenance[] }>(
      `${BASE}/maintenance`,
      {
        params: { assetId },
      },
    );
    return result.data.data;
  },

  async createMaintenance(payload: CreateMaintenanceRequest): Promise<AssetMaintenance> {
    const result = await httpClient.post<{
      success: boolean;
      data: AssetMaintenance;
    }>(`${BASE}/maintenance`, payload);
    return result.data.data;
  },

  async updateMaintenance(
    id: string,
    payload: UpdateMaintenanceRequest,
  ): Promise<AssetMaintenance> {
    const result = await httpClient.patch<{
      success: boolean;
      data: AssetMaintenance;
    }>(`${BASE}/maintenance/${id}`, payload);
    return result.data.data;
  },

  async deleteMaintenance(id: string): Promise<void> {
    await httpClient.delete(`${BASE}/maintenance/${id}`);
  },

  async assignAsset(id: string, payload: AssignAssetRequest): Promise<void> {
    await httpClient.post(`${BASE}/${id}/assign`, payload);
  },

  async returnAsset(id: string, payload: ReturnAssetRequest): Promise<void> {
    await httpClient.post(`${BASE}/${id}/return`, payload);
  },

  async getAssetHistory(id: string): Promise<AssetHistoryEntry[]> {
    const result = await httpClient.get<{ success: boolean; data: AssetHistoryEntry[] }>(
      `${BASE}/${id}/history`,
    );
    return result.data.data;
  },

  async getMyAssets(): Promise<Asset[]> {
    const result = await httpClient.get<{ success: boolean; data: Asset[] }>(`${BASE}/me/assets`);
    return result.data.data;
  },

  async getEmployeeAssets(id: string, open?: boolean): Promise<Asset[]> {
    const result = await httpClient.get<{ success: boolean; data: Asset[] }>(
      `/hr/employees/${id}/assets`,
      { params: open === undefined ? undefined : { open } },
    );
    return result.data.data;
  },
};
