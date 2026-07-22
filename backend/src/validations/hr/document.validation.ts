import { z } from "zod";

// Predefined strict categories array
const DOCUMENT_CATEGORIES = [
  "Contract Templates",
  "Policies & Procedures",
  "Forms & Applications",
  "Training Materials",
  "Compliance & Legal",
  "Onboarding Materials",
] as const;

// Reusable Access Control Rule Schema
const documentAccessSchema = z.object({
  type: z.enum(["department", "individual"]),
  target: z.string().min(1, "Target department or user ID is required"),
  permission: z.enum(["see", "edit", "see_only"]),
  owner: z.string().optional(), // validated superRefine below
});

export const documentIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid document id"),
  }),
});

export const listDocumentsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : 10)),
    category: z.enum(DOCUMENT_CATEGORIES).optional(),
    status: z.enum(["PUBLISHED", "DRAFT"]).optional(),
    sortBy: z.enum(["document_name", "version", "updatedAt", "downloads"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const searchDocumentsSchema = z.object({
  query: z.object({
    q: z.string().min(1, "A search query is required"),
    page: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : 10)),
  }),
});

export const setRetentionSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid document ID format"),
  }),
  body: z.object({
    // ISO date string to schedule auto-archiving, null to clear, or omitted to use the category default.
    retain_until: z.string().datetime({ offset: true }).nullable().optional(),
  }),
});

// Create Document Body Schema with Conditional Context Logic
export const createDocumentSchema = z.object({
  body: z
    .object({
      document_name: z.string().min(1),
      category: z.enum(DOCUMENT_CATEGORIES),
      version: z.string().min(1),
      description: z.string().min(1),
      department: z.string().min(1),
      status: z.enum(["PUBLISHED", "DRAFT"]).optional(),
      fileName: z.string().min(1),
      fileContentBase64: z.string().min(1),
      createdById: z.string().uuid(),
      access: documentAccessSchema,
      contractId: z.string().uuid().optional(),
    })
    .superRefine((body, ctx) => {
      // Refining inside the body object keeps the root wrapper a plain ZodObject
      if (body.category === "Contract Templates") {
        if (!body.access.owner || body.access.owner.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Contracts must specify an owner in the access configuration object.",
            path: ["access", "owner"],
          });
        }
        if (!body.contractId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "contractId is required when category is 'Contract Templates'.",
            path: ["contractId"],
          });
        }
      }
    }),
});

// Update Document Body Schema
export const updateDocumentSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid document UUID payload inside parameter structure"),
  }),
  body: z
    .object({
      document_name: z.string().min(1).optional(),
      category: z.enum(DOCUMENT_CATEGORIES).optional(),
      version: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      department: z.string().min(1).optional(),
      status: z.enum(["PUBLISHED", "DRAFT"]).optional(),
      fileName: z.string().min(1).optional(),
      fileContentBase64: z.string().min(1).optional(),
      access: documentAccessSchema.optional(),
      contractId: z.string().uuid("Invalid contractId format").optional(),
    })
    .superRefine((body, ctx) => {
      // Refining directly on the body object preserves ZodObject at the root layer
      if (body.category === "Contract Templates") {
        if (body.access && (!body.access.owner || body.access.owner.trim() === "")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "An owner is required under access properties when switching category to Contract Templates.",
            path: ["access", "owner"], // Adjusted path since we are now inside body
          });
        }
      }
    }),
});
