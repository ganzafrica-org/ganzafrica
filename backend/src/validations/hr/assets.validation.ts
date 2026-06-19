import { z } from "zod";

export const assetIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid asset id"),
  }),
});

export const listAssetsSchema = z.object({
  query: z.object({
    assignedTo: z.string().uuid("Invalid assignedTo id").optional(),
    hasIssue: z.enum(["YES", "NO"]).optional(),
    isFlagged: z.enum(["true", "false"]).optional().transform((value) => value === "true"),
  }),
});

export const createAssetSchema = z.object({
  body: z.object({
    deviceName: z.string().min(1, "Device name is required"),
    serialNumber: z.string().min(1, "Serial number is required"),
    generation: z.string().min(1, "Generation is required"),
    core: z.string().min(1, "Core is required"),
    ram: z.string().min(1, "RAM is required"),
    hardDisk: z.string().min(1, "Hard disk is required"),
    purchasePrice: z.string().optional().nullable(),
    assignedToId: z.string().uuid("Invalid assignedToId").optional().nullable(),
    hasIssue: z.enum(["YES", "NO"]).optional(),
    isFlagged: z.boolean().optional(),
  }),
});

export const updateAssetSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid asset id"),
  }),
  body: z.object({
    deviceName: z.string().min(1).optional(),
    serialNumber: z.string().min(1).optional(),
    generation: z.string().min(1).optional(),
    core: z.string().min(1).optional(),
    ram: z.string().min(1).optional(),
    hardDisk: z.string().min(1).optional(),
    purchasePrice: z.string().optional().nullable(),
    assignedToId: z.string().uuid("Invalid assignedToId").optional().nullable(),
    hasIssue: z.enum(["YES", "NO"]).optional(),
    isFlagged: z.boolean().optional(),
  }),
});
