"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentCategoryTemplatesService } from "@/services/document-category-templates.service";
import type {
  CreateDocumentCategoryTemplateRequest,
  UpdateDocumentCategoryTemplateRequest,
} from "@/types/api";

const KEY = ["documentCategoryTemplates"];

export function useDocumentCategoryTemplates() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => documentCategoryTemplatesService.getAll(),
  });
}

export function useDocumentCategoryTemplate(id: string | null) {
  return useQuery({
    queryKey: ["documentCategoryTemplate", id],
    queryFn: () => documentCategoryTemplatesService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateDocumentCategoryTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDocumentCategoryTemplateRequest) =>
      documentCategoryTemplatesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useUpdateDocumentCategoryTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDocumentCategoryTemplateRequest }) =>
      documentCategoryTemplatesService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: KEY });
      queryClient.invalidateQueries({ queryKey: ["documentCategoryTemplate", variables.id] });
    },
  });
}

export function useDeleteDocumentCategoryTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentCategoryTemplatesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });
}
