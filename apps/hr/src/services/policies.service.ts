import { httpClient } from "@/services/http.service";
import type { PaginatedResponse, Policy, PolicyAcknowledgementReport } from "@/types/api";

/** hr_policies still takes a base64 file body (unlike hr_documents, which is multipart+S3). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export interface CreatePolicyPayload {
  title: string;
  content?: string | null;
  category: string;
  policyCategory?: string;
  version: string;
  status?: "PUBLISHED" | "DRAFT";
}

export interface UpdatePolicyPayload {
  title?: string;
  content?: string | null;
  category?: string;
  policyCategory?: string;
  version?: string;
  status?: "PUBLISHED" | "DRAFT";
  isActive?: boolean;
}

export const policiesService = {
  async getPolicies(params?: {
    search?: string;
    feature?: string;
    status?: string;
    active?: boolean;
    page?: number;
    limit?: number;
  }) {
    const response = await httpClient.get<Policy[] | PaginatedResponse<Policy>>("/hr/policies", {
      params,
    });
    return response.data;
  },

  async getPolicy(id: string): Promise<Policy> {
    const result = await httpClient.get<{ data: Policy }>(`/hr/policies/${id}`);
    return result.data.data;
  },

  async createPolicy(payload: CreatePolicyPayload, file: File): Promise<Policy> {
    const fileContentBase64 = await fileToBase64(file);
    const result = await httpClient.post<{ data: Policy }>("/hr/policies", {
      ...payload,
      fileName: file.name,
      fileContentBase64,
    });
    return result.data.data;
  },

  async updatePolicy(
    id: string,
    payload: UpdatePolicyPayload,
    file?: File | null,
  ): Promise<Policy> {
    const filePart = file
      ? { fileName: file.name, fileContentBase64: await fileToBase64(file) }
      : {};
    const result = await httpClient.patch<{ data: Policy }>(`/hr/policies/${id}`, {
      ...payload,
      ...filePart,
    });
    return result.data.data;
  },

  async deletePolicy(id: string): Promise<void> {
    await httpClient.delete(`/hr/policies/${id}`);
  },

  async publishPolicy(id: string): Promise<Policy> {
    const result = await httpClient.post<{ data: Policy }>(`/hr/policies/${id}/publish`);
    return result.data.data;
  },

  async acknowledgePolicy(id: string): Promise<void> {
    await httpClient.post(`/hr/policies/${id}/acknowledge`);
  },

  async getAcknowledgementReport(id: string): Promise<PolicyAcknowledgementReport> {
    const result = await httpClient.get<{ data: PolicyAcknowledgementReport }>(
      `/hr/policies/${id}/acknowledgements`,
    );
    return result.data.data;
  },

  downloadUrl(id: string): string {
    const base = httpClient.defaults.baseURL ?? "";
    return `${base}/hr/policies/${id}/download`;
  },
};
