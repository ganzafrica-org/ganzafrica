import { httpClient } from "@/services/http.service";
import type {
  DocumentCategoryTemplate,
  CreateDocumentCategoryTemplateRequest,
  UpdateDocumentCategoryTemplateRequest,
} from "@/types/api";

const BASE = "/hr/document-category-templates";

export const documentCategoryTemplatesService = {
  async getAll(): Promise<DocumentCategoryTemplate[]> {
    const result = await httpClient.get<{ success: boolean; data: DocumentCategoryTemplate[] }>(
      BASE,
    );
    return result.data.data;
  },

  async getById(id: string): Promise<DocumentCategoryTemplate> {
    const result = await httpClient.get<{ success: boolean; data: DocumentCategoryTemplate }>(
      `${BASE}/${id}`,
    );
    return result.data.data;
  },

  async create(payload: CreateDocumentCategoryTemplateRequest): Promise<DocumentCategoryTemplate> {
    const result = await httpClient.post<{ success: boolean; data: DocumentCategoryTemplate }>(
      BASE,
      payload,
    );
    return result.data.data;
  },

  async update(
    id: string,
    payload: UpdateDocumentCategoryTemplateRequest,
  ): Promise<DocumentCategoryTemplate> {
    const result = await httpClient.patch<{ success: boolean; data: DocumentCategoryTemplate }>(
      `${BASE}/${id}`,
      payload,
    );
    return result.data.data;
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`${BASE}/${id}`);
  },
};
