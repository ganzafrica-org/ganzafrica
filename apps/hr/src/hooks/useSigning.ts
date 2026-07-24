"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { signingService } from "@/services/signing.service";

export function useMySignatures() {
  return useQuery({
    queryKey: ["signing", "my"],
    queryFn: () => signingService.listMine(),
  });
}

export function useSignDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fieldValues }: { id: number; fieldValues: Record<string, unknown> }) =>
      signingService.sign(id, fieldValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["signing", "my"] }),
  });
}
