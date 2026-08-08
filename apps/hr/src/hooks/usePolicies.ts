"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  policiesService,
  type CreatePolicyPayload,
  type UpdatePolicyPayload,
} from "@/services/policies.service";

export function usePolicies(params?: {
  search?: string;
  feature?: string;
  status?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["policies", params],
    queryFn: () => policiesService.getPolicies(params),
  });
}

export function usePolicy(id: string | null) {
  return useQuery({
    queryKey: ["policies", id],
    queryFn: () => policiesService.getPolicy(id as string),
    enabled: !!id,
  });
}

export function useCreatePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, file }: { payload: CreatePolicyPayload; file: File }) =>
      policiesService.createPolicy(payload, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["policies"] }),
  });
}

export function useUpdatePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
      file,
    }: {
      id: string;
      payload: UpdatePolicyPayload;
      file?: File | null;
    }) => policiesService.updatePolicy(id, payload, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["policies"] }),
  });
}

export function useDeletePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => policiesService.deletePolicy(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["policies"] }),
  });
}

export function usePublishPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => policiesService.publishPolicy(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["policies"] }),
  });
}

export function useAcknowledgePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => policiesService.acknowledgePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      queryClient.invalidateQueries({ queryKey: ["policies", "acknowledgements"] });
    },
  });
}

export function usePolicyAcknowledgements(id: string | null) {
  return useQuery({
    queryKey: ["policies", "acknowledgements", id],
    queryFn: () => policiesService.getAcknowledgementReport(id as string),
    enabled: !!id,
  });
}
