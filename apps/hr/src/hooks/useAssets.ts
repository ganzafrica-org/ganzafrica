"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { assetsService } from "@/services/assets.service"
import type { CreateAssetRequest, UpdateAssetRequest } from "@/types/api"

export function useAssets(params?: { search?: string; ownerId?: string; fromDate?: string; page?: number; limit?: number }) {
    return useQuery({
        queryKey: ["assets", params],
        queryFn: () => assetsService.getAssets(params),
    })
}

export function useAsset(id: string) {
    return useQuery({
        queryKey: ["asset", id],
        queryFn: () => assetsService.getAssetById(id),
        enabled: !!id,
    })
}

export function useAssetStats() {
    return useQuery({
        queryKey: ["assetStats"],
        queryFn: () => assetsService.getAssetStats(),
    })
}

export function useCreateAsset() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: CreateAssetRequest) => assetsService.createAsset(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assets"] })
            queryClient.invalidateQueries({ queryKey: ["assetStats"] })
        },
    })
}

export function useUpdateAsset() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateAssetRequest }) =>
            assetsService.updateAsset(id, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["assets"] })
            queryClient.invalidateQueries({ queryKey: ["asset", variables.id] })
            queryClient.invalidateQueries({ queryKey: ["assetStats"] })
        },
    })
}

export function useDeleteAsset() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => assetsService.deleteAsset(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assets"] })
            queryClient.invalidateQueries({ queryKey: ["assetStats"] })
        },
    })
}

export function useAssignAsset() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, employeeId }: { id: string; employeeId: string }) =>
            assetsService.assignAsset(id, employeeId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["assets"] })
            queryClient.invalidateQueries({ queryKey: ["asset", variables.id] })
            queryClient.invalidateQueries({ queryKey: ["assetStats"] })
        },
    })
}

export function useUnassignAsset() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => assetsService.unassignAsset(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["assets"] })
            queryClient.invalidateQueries({ queryKey: ["asset", id] })
            queryClient.invalidateQueries({ queryKey: ["assetStats"] })
        },
    })
}
