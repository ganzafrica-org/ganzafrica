"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { leavesService } from "@/services/leaves.service"
import type { Leave } from "@/types/api"

export function useLeaves(params?: { employeeId?: string; status?: string }) {
    return useQuery({
        queryKey: ["leaves", params],
        queryFn: () => leavesService.getLeaves(params),
    })
}

export function useCreateLeave() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: Omit<Leave, "id">) => leavesService.createLeave(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leaves"] }),
    })
}

export function useUpdateLeaveStatus() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: Leave["status"] }) =>
            leavesService.updateLeaveStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leaves"] }),
    })
}
