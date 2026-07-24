import { httpClient } from "@/services/http.service";

// DOC-plus: search-in-file + retention. These endpoints wrap their payload in the standard
// { success, message, data, meta } envelope, so we unwrap `.data.data`.

export interface DocumentSearchResult {
  id: string;
  document_name: string;
  category: string;
  version: string;
  description: string;
  department: string;
  fileSize: string;
  status: string;
  contract_id: string | null;
  modifiedAt: string;
  snippet: string | null;
}

export interface RetentionDue {
  id: string;
  document_name: string;
  category: string;
  retain_until: string | null;
}

export const documentsPlusService = {
  async search(q: string): Promise<{ results: DocumentSearchResult[]; total: number }> {
    const { data } = await httpClient.get<{
      data: DocumentSearchResult[];
      meta: { total: number };
    }>("/hr/documents/search", { params: { q } });
    return { results: data.data, total: data.meta.total };
  },

  async retentionPreview(): Promise<{ due: RetentionDue[]; count: number }> {
    const { data } = await httpClient.get<{ data: RetentionDue[]; meta: { total: number } }>(
      "/hr/documents/retention/preview",
    );
    return { due: data.data, count: data.meta.total };
  },

  async setRetention(id: string, retainUntil: string | null): Promise<void> {
    await httpClient.patch(`/hr/documents/${id}/retention`, { retain_until: retainUntil });
  },
};
