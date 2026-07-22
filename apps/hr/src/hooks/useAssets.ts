"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assetsService } from "@/services/assets.service";
import type {
  AssetCategory,
  CreateAssetRequest,
  UpdateAssetRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/api";

// ── Assets ────────────────────────────────────────────────────────────────────

export function useAssets(filters?: {
  assignedTo?: string;
  hasIssue?: "YES" | "NO";
  isFlagged?: boolean;
}) {
  return useQuery({
    queryKey: ["assets", filters],
    queryFn: () => assetsService.getAssets(filters),
  });
}

export function useAsset(id: string | null) {
  return useQuery({
    queryKey: ["asset", id],
    queryFn: () => assetsService.getAssetById(id!),
    enabled: !!id,
  });
}

export function useAssetHistory(id: string | null) {
  return useQuery({
    queryKey: ["assetHistory", id],
    queryFn: () => assetsService.getAssetHistory(id!),
    enabled: !!id,
  });
}

export function useMyAssets() {
  return useQuery({
    queryKey: ["myAssets"],
    queryFn: () => assetsService.getMyAssets(),
  });
}

export function useEmployeeAssets(employeeId: string | null, open?: boolean) {
  return useQuery({
    queryKey: ["employeeAssets", employeeId, open],
    queryFn: () => assetsService.getEmployeeAssets(employeeId!, open),
    enabled: !!employeeId,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, images }: { payload: CreateAssetRequest; images?: File[] }) =>
      assetsService.createAsset(payload, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assetStats"] });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
      images,
    }: {
      id: string;
      payload: UpdateAssetRequest;
      images?: File[];
    }) => assetsService.updateAsset(id, payload, images),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["assetHistory", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["myAssets"] });
      queryClient.invalidateQueries({ queryKey: ["employeeAssets"] });
      queryClient.invalidateQueries({ queryKey: ["assetStats"] });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetsService.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assetStats"] });
    },
  });
}

export function useDeleteAssetImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assetId, imageId }: { assetId: string; imageId: string }) =>
      assetsService.deleteAssetImage(assetId, imageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["asset", variables.assetId] });
    },
  });
}

export function useAssignAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { employee_id: string; notes?: string };
    }) => assetsService.assignAsset(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assetHistory"] });
      queryClient.invalidateQueries({ queryKey: ["myAssets"] });
      queryClient.invalidateQueries({ queryKey: ["employeeAssets"] });
    },
  });
}

export function useReturnAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { condition: string; notes?: string; has_issue?: boolean };
    }) => assetsService.returnAsset(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assetHistory"] });
      queryClient.invalidateQueries({ queryKey: ["myAssets"] });
      queryClient.invalidateQueries({ queryKey: ["employeeAssets"] });
    },
  });
}

// ── Categories ────────────────────────────────────────────────────────────────

export function useAssetCategories() {
  const { data, ...rest } = useQuery({
    queryKey: ["assetCategories"],
    queryFn: () => assetsService.getCategories(),
  });

  // Ensure data is an array before calling reduce
  const dataArray = Array.isArray(data) ? data : [];

  const categories = dataArray;

  const grouped = dataArray.reduce<Record<string, AssetCategory[]>>((acc, cat) => {
    const key = cat.parent_name ?? "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(cat);
    return acc;
  }, {});

  return { ...rest, data, categories, grouped };
}
export function useAssetCategory(id: string | null) {
  return useQuery({
    queryKey: ["assetCategory", id],
    queryFn: () => assetsService.getCategoryById(id!),
    enabled: !!id,
  });
}

export function useCreateAssetCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryRequest) => assetsService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assetCategories"] });
    },
  });
}

export function useUpdateAssetCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryRequest }) =>
      assetsService.updateCategory(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assetCategories"] });
      queryClient.invalidateQueries({ queryKey: ["assetCategory", variables.id] });
    },
  });
}

export function useDeactivateAssetCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetsService.deactivateCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assetCategories"] });
    },
  });
}
