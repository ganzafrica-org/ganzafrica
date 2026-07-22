"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsPlusService } from "@/services/documents-plus.service";

export function useDocumentSearch(q: string) {
  return useQuery({
    queryKey: ["documents", "search", q],
    queryFn: () => documentsPlusService.search(q),
    enabled: q.trim().length > 0,
  });
}

export function useRetentionPreview() {
  return useQuery({
    queryKey: ["documents", "retention", "preview"],
    queryFn: () => documentsPlusService.retentionPreview(),
  });
}

export function useSetRetention() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, retainUntil }: { id: string; retainUntil: string | null }) =>
      documentsPlusService.setRetention(id, retainUntil),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["documents", "retention", "preview"] }),
  });
}
