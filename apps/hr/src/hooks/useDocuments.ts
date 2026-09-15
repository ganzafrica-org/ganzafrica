"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsService } from "@/services/documents.service";
import type { CreateDocumentRequest, DocumentCategory, UpdateDocumentRequest } from "@/types/api";
import { toast } from "@/lib/toast";

export function useDocuments(params?: {
  category?: string;
  status?: string;
  search?: string;
  employee?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["documents", params],
    queryFn: () => documentsService.getDocuments(params),
  });
}

export function useMyDocuments(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["documents", "me", params],
    queryFn: () => documentsService.getMyDocuments(params),
  });
}

export function useDocument(id: string | null) {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: () => documentsService.getDocument(id as string),
    enabled: !!id,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, file }: { payload: CreateDocumentRequest; file?: File | null }) =>
      documentsService.createDocument(payload, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document uploaded");
    },
  });
}

/** The "use a saved template instead of uploading" picker source for a given category. */
export function useDocumentTemplates(category: DocumentCategory | "") {
  return useQuery({
    queryKey: ["documents", "templates", category],
    queryFn: () => documentsService.getDocumentTemplates(category),
    enabled: !!category,
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
      file,
    }: {
      id: string;
      payload: UpdateDocumentRequest;
      file?: File | null;
    }) => documentsService.updateDocument(id, payload, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document updated");
    },
  });
}

export function useArchiveDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsService.archiveDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document archived");
    },
  });
}
