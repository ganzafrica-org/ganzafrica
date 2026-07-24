import { z } from "zod";

const POLICY_CATEGORIES = ["GENERAL", "HR", "IT", "FINANCE", "COMPLIANCE", "OTHER"] as const;
const POLICY_STATUSES = ["PUBLISHED", "DRAFT"] as const;

export const policyIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid policy id"),
  }),
});

export const listPoliciesSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    category: z.string().optional(),
    status: z.enum(POLICY_STATUSES).optional(),
    sortBy: z.enum(["title", "version", "updatedAt", "downloads"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const createPolicySchema = z.object({
  body: z.object({
    title: z.string().min(1),
    content: z.string().nullable().optional(),
    category: z.string().min(1),
    policyCategory: z.enum(POLICY_CATEGORIES).optional(),
    version: z.string().min(1),
    status: z.enum(POLICY_STATUSES).optional(),
    fileName: z.string().min(1),
    fileContentBase64: z.string().min(1),
    createdById: z.string().uuid(),
  }),
});

export const updatePolicySchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid policy id"),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    content: z.string().nullable().optional(),
    category: z.string().min(1).optional(),
    policyCategory: z.enum(POLICY_CATEGORIES).optional(),
    version: z.string().min(1).optional(),
    status: z.enum(POLICY_STATUSES).optional(),
    isActive: z.boolean().optional(),
    fileName: z.string().min(1).optional(),
    fileContentBase64: z.string().min(1).optional(),
  }),
});
