"use client"

import { useQuery } from "@tanstack/react-query"
import { policiesService } from "@/services/policies.service"

export function usePolicies(params?: { search?: string; feature?: string; status?: string; page?: number; limit?: number }) {
    return useQuery({
        queryKey: ["policies", params],
        queryFn: () => policiesService.getPolicies(params),
    })
}
