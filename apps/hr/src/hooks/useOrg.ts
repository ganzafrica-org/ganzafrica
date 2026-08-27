"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orgService } from "@/services/org.service";
import type { SetManagerRequest } from "@/types/api";

export function useOrgTree() {
  return useQuery({
    queryKey: ["org-chart"],
    queryFn: () => orgService.getOrgTree(),
  });
}

export function useReports(employeeId: string, direct = true) {
  return useQuery({
    queryKey: ["org-reports", employeeId, direct],
    queryFn: () => orgService.getReports(employeeId, direct),
    enabled: !!employeeId,
  });
}

export function useUnresolvedManagers(enabled = true) {
  return useQuery({
    queryKey: ["org-unresolved"],
    queryFn: () => orgService.getUnresolved(),
    enabled,
  });
}

export function useSetManager() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, payload }: { employeeId: string; payload: SetManagerRequest }) =>
      orgService.setManager(employeeId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["org-chart"] });
      queryClient.invalidateQueries({ queryKey: ["org-unresolved"] });
      queryClient.invalidateQueries({ queryKey: ["employee", variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    // Both callers already show a specific toast for this (including the "would
    // create a reporting cycle" case), so the global handler would just double up.
    meta: { silentError: true },
  });
}
