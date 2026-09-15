import { httpClient } from "@/services/http.service";
import type {
  CreateDocumentRequest,
  DocumentTemplateOption,
  HrDocument,
  PaginatedResponse,
  UpdateDocumentRequest,
} from "@/types/api";

const BASE = "/hr/documents";

function toFormData(payload: Record<string, unknown>, file?: File | null): FormData {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "access") {
      form.append(key, JSON.stringify(value));
    } else {
      form.append(key, String(value));
    }
  });
  if (file) form.append("file", file);
  return form;
}

export const documentsService = {
  async getDocuments(params?: {
    category?: string;
    status?: string;
    search?: string;
    employee?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<HrDocument>> {
    const result = await httpClient.get<PaginatedResponse<HrDocument>>(BASE, { params });
    return result.data;
  },

  async getMyDocuments(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<HrDocument>> {
    const result = await httpClient.get<PaginatedResponse<HrDocument>>("/hr/me/documents", {
      params,
    });
    return result.data;
  },

  async getDocument(id: string): Promise<HrDocument> {
    const result = await httpClient.get<{ data: HrDocument }>(`${BASE}/${id}`);
    return result.data.data;
  },

  /** Exactly one of `file` or `payload.sourceDocumentId` must be set — never both, never neither
   *  (enforced server-side too; see document.service.ts's createDocument). */
  async createDocument(payload: CreateDocumentRequest, file?: File | null): Promise<HrDocument> {
    const form = toFormData(payload as unknown as Record<string, unknown>, file);
    const result = await httpClient.post<{ data: HrDocument }>(BASE, form);
    return result.data.data;
  },

  /** The reusable-template pool for a category — safe to offer as a "use existing" picker source
   *  (never another employee's actual linked document; see backend's listDocumentTemplates). */
  async getDocumentTemplates(category: string): Promise<DocumentTemplateOption[]> {
    const result = await httpClient.get<{ data: DocumentTemplateOption[] }>(`${BASE}/templates`, {
      params: { category },
    });
    return result.data.data;
  },

  async updateDocument(
    id: string,
    payload: UpdateDocumentRequest,
    file?: File | null,
  ): Promise<HrDocument> {
    const form = toFormData(payload as unknown as Record<string, unknown>, file);
    const result = await httpClient.patch<{ data: HrDocument }>(`${BASE}/${id}`, form);
    return result.data.data;
  },

  /** Soft delete — backend archives (status=ARCHIVED), never hard-deletes. */
  async archiveDocument(id: string): Promise<void> {
    await httpClient.delete(`${BASE}/${id}`);
  },

  /**
   * The backend 302-redirects to a 5-minute presigned S3 URL. A plain navigation (not an axios
   * fetch) lets the browser follow that redirect and download directly, carrying the auth cookie.
   */
  downloadUrl(id: string): string {
    const base = httpClient.defaults.baseURL ?? "";
    return `${base}${BASE}/${id}/download`;
  },

  /**
   * Raw presigned URL (JSON, not a redirect) for inline viewing — native <iframe>/<img>/<video>,
   * or handed to the Office Online Viewer. 15-minute expiry, does not count as a download.
   */
  async getViewUrl(id: string): Promise<{ url: string; fileName: string }> {
    const result = await httpClient.get<{ data: { url: string; fileName: string } }>(
      `${BASE}/${id}/view-url`,
    );
    return result.data.data;
  },

  /** Raw text content for formats the frontend renders itself (csv/txt/json/xml/css/js). */
  async getContent(id: string): Promise<{ text: string; fileName: string; truncated: boolean }> {
    const result = await httpClient.get<{
      data: { text: string; fileName: string; truncated: boolean };
    }>(`${BASE}/${id}/content`);
    return result.data.data;
  },
};
