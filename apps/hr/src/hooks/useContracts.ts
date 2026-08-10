"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contractsService } from "@/services/contracts.service";
import type { CreateContractRequest, UpdateContractRequest } from "@/types/api";

export function useContracts(employeeId: string) {
  return useQuery({
    queryKey: ["contracts", employeeId],
    queryFn: () => contractsService.listContracts(employeeId),
    enabled: !!employeeId,
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
    },
  });
}
