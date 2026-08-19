"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { signingService } from "@/services/signing.service";
import { toast } from "@/lib/toast";

export function useMySignatures() {
  return useQuery({
    queryKey: ["signing", "my"],
    queryFn: () => signingService.listMine(),
  });
}

/** HR-only: the full signer sequence for a reference (e.g. a contract). */
export function useSignatureSequence(refKind: string, refId: string | null) {
  return useQuery({
    queryKey: ["signing", "by-ref", refKind, refId],
    queryFn: () => signingService.listByRef(refKind, refId!),
    enabled: !!refId,
  });
}

export function useSignDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fieldValues }: { id: number; fieldValues: Record<string, unknown> }) =>
      signingService.sign(id, fieldValues),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signing", "my"] });
      toast.success("Document signed");
    },
  });
}
