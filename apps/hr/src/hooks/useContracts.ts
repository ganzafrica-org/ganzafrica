"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contractsService } from "@/services/contracts.service";
import type { CreateContractRequest, UpdateContractRequest } from "@/types/api";
import { toast } from "@/lib/toast";

export function useContracts(employeeId: string) {
  return useQuery({
    queryKey: ["contracts", employeeId],
    queryFn: () => contractsService.listContracts(employeeId),
    enabled: !!employeeId,
  });
}

/** Self-service equivalent of useContracts — for a viewer looking at their own record. */
export function useMyContracts(enabled = true) {
  return useQuery({
    queryKey: ["contracts", "me"],
    queryFn: () => contractsService.listMyContracts(),
    enabled,
  });
}

export function useCreateContract(employeeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateContractRequest) =>
      contractsService.createContract(employeeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      toast.success("Contract created");
    },
  });
}

export function useUpdateContract(employeeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, payload }: { contractId: string; payload: UpdateContractRequest }) =>
      contractsService.updateContract(employeeId, contractId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      toast.success("Contract updated");
    },
  });
}

export function useDeleteContract(employeeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contractId: string) => contractsService.deleteContract(employeeId, contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      toast.success("Contract deleted");
    },
  });
}
