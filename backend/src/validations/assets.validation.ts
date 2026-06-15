import { z } from "zod";

export const assetIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid asset id"),
  }),
});

export const listAssetsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 10)),
    owner: z.string().optional(), // userId or "unassigned"
    hasIssue: z.enum(["YES", "NO"]).optional(),
    isFlagged: z.string().optional(),
    assignedFrom: z.string().optional(),
    assignedTo: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const createAssetSchema = z.object({
  body: z.object({
    deviceName: z.string().min(1),
    serialNumber: z.string().min(1),
    generation: z.string().min(1),
    core: z.string().min(1),
    ram: z.string().min(1),
    hardDisk: z.string().min(1),
    purchasePrice: z.string().optional().nullable(),
    hasIssue: z.enum(["YES", "NO"]).optional(),
    isFlagged: z.boolean().optional(),
  }),
});

export const updateAssetSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    deviceName: z.string().min(1).optional(),
    serialNumber: z.string().min(1).optional(),
    generation: z.string().min(1).optional(),
    core: z.string().min(1).optional(),
    ram: z.string().min(1).optional(),
    hardDisk: z.string().min(1).optional(),
    purchasePrice: z.string().optional().nullable(),
    hasIssue: z.enum(["YES", "NO"]).optional(),
  }),
});

export const assignAssetSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    userId: z.string().uuid().nullable(),
  }),
});

