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

/** The base document behind a signing request, fetched only while its sign dialog is open. */
export function useSignatureDocument(requestId: number | null) {
  return useQuery({
    queryKey: ["signing", "document", requestId],
    queryFn: () => signingService.getDocumentUrl(requestId!),
    enabled: requestId != null,
    staleTime: 0,
  });
}

export function useSignDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fieldValues }: { id: number; fieldValues: Record<string, unknown> }) =>
      signingService.sign(id, fieldValues),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signing", "my"] });
      // Also refetch any open per-signer sequence view (e.g. ContractSigningStatus) — otherwise its
      // badge for the just-signed party stays stale until something else happens to refetch it.
      queryClient.invalidateQueries({ queryKey: ["signing", "by-ref"] });
      toast.success("Document signed");
    },
  });
}

/** HR-only: templates available to send for signature (e.g. the seeded Employment Contract). */
export function useSigningTemplates() {
  return useQuery({
    queryKey: ["signing", "templates"],
    queryFn: () => signingService.listTemplates(),
  });
}

/** HR-only: send one document to an arbitrary, HR-chosen set of signers (sequential or parallel). */
export function useSendSignatureSequence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signingService.sendSequence,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["signing", "by-ref", variables.ref_kind, variables.ref_id],
      });
      toast.success("Sent for signature");
    },
    onError: () => toast.danger("Couldn't send for signature"),
  });
}

// --- Designated co-signer pool ---

export function useSignerPool() {
  return useQuery({
    queryKey: ["signing", "signer-pool"],
    queryFn: () => signingService.listSignerPool(),
  });
}

export function useAddToSignerPool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: string) => signingService.addToSignerPool(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signing", "signer-pool"] });
      toast.success("Added to signer pool");
    },
  });
}

export function useRemoveFromSignerPool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: string) => signingService.removeFromSignerPool(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signing", "signer-pool"] });
      toast.success("Removed from signer pool");
    },
  });
}
