import { z } from "zod";

export const policyIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid policy id"),
  }),
});

export const listPoliciesSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 10)),
    category: z.string().optional(),
    status: z.enum(["PUBLISHED", "DRAFT"]).optional(),
    sortBy: z.enum(["title", "version", "updatedAt", "downloads"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

// No Multer in this repo; accept file as base64 in JSON body.
export const createPolicySchema = z.object({
  body: z.object({
    title: z.string().min(1),
    category: z.string().min(1),
    version: z.string().min(1),
    status: z.enum(["PUBLISHED", "DRAFT"]).optional(),
    fileName: z.string().min(1),
    fileContentBase64: z.string().min(1),
    createdById: z.string().uuid("Invalid createdById"),
  }),
});

export const updatePolicySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    version: z.string().min(1).optional(),
    status: z.enum(["PUBLISHED", "DRAFT"]).optional(),
    fileName: z.string().min(1).optional(),
    fileContentBase64: z.string().min(1).optional(),
  }),
});

