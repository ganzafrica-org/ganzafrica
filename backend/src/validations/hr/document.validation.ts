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

// Frozen ACL shape (MOD-05 §3): any-clause-match; null/empty = hr/admin only.
const documentAccessSchema = z
  .object({
    roles: z.array(z.string()).optional(),
    employee_ids: z.array(z.string().uuid()).optional(),
    departments: z.array(z.string()).optional(),
  })
  .strict();

// Uploads are multipart/form-data — `access` arrives as a JSON string field, not a JSON body.
const accessField = z.preprocess((val) => {
  if (val === undefined || val === null || val === "") return {};
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return val; // let the object schema below reject it with a clear error
    }
  }
  return val;
}, documentAccessSchema);

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
    status: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]).optional(),
    search: z.string().optional(),
    employee: z.string().uuid().optional(),
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

// Create Document Body Schema — multipart/form-data (file arrives separately as req.file).
export const createDocumentSchema = z.object({
  body: z
    .object({
      document_name: z.string().min(1),
      category: z.enum(DOCUMENT_CATEGORIES),
      description: z.string().min(1),
      department: z.string().min(1),
      status: z.enum(["PUBLISHED", "DRAFT"]).optional(),
      access: accessField.optional(),
      contractId: z.string().uuid().optional(),
    })
    .superRefine((body, ctx) => {
      if (body.category === "Contract Templates" && !body.contractId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "contractId is required when category is 'Contract Templates'.",
          path: ["contractId"],
        });
      }
    }),
});

// Update Document Body Schema — multipart/form-data; a new file is optional (req.file).
export const updateDocumentSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid document UUID payload inside parameter structure"),
  }),
  body: z.object({
    document_name: z.string().min(1).optional(),
    category: z.enum(DOCUMENT_CATEGORIES).optional(),
    description: z.string().min(1).optional(),
    department: z.string().min(1).optional(),
    status: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]).optional(),
    access: accessField.optional(),
    contractId: z.string().uuid("Invalid contractId format").optional(),
  }),
});
