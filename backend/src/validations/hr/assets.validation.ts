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
    isFlagged: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
  }),
});

export const createAssetSchema = z.object({
  body: z.object({
    deviceName: z.string().min(1, "Device name is required"),
    serialNumber: z.string().min(1, "Serial number is required"),
    categoryId: z.string().uuid("Invalid category id"),
    specs: z
      .array(
        z.object({
          key: z.string().min(1),
          value: z.string().min(1),
        }),
      )
      .optional(),
    purchasePrice: z.string().optional().nullable(),
    assignedToId: z.string().uuid("Invalid assignedToId").optional().nullable(),
    hasIssue: z.enum(["YES", "NO"]).optional(),
    isFlagged: z.boolean().optional(),
    status: z.enum(["AVAILABLE", "ASSIGNED", "UNDER_MAINTENANCE", "DISPOSED"]).optional(),
  }),
});

export const updateAssetSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid asset id"),
  }),
  body: z.object({
    deviceName: z.string().min(1).optional(),
    serialNumber: z.string().min(1).optional(),
    categoryId: z.string().uuid().optional(),
    specs: z
      .array(
        z.object({
          key: z.string().min(1),
          value: z.string().min(1),
        }),
      )
      .optional(),
    purchasePrice: z.string().optional().nullable(),
    hasIssue: z.enum(["YES", "NO"]).optional(),
    isFlagged: z.boolean().optional(),
  }),
});

export const assignAssetSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid asset id"),
  }),
  body: z.object({
    employeeId: z.string().uuid("Invalid employee id"),
    notes: z.string().optional(),
  }),
});

export const returnAssetSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid asset id"),
  }),
  body: z.object({
    condition: z.string().min(1, "Condition is required"),
    notes: z.string().optional(),
    hasIssue: z.boolean().optional(),
  }),
});

export const flagAssetSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid asset id"),
  }),
  body: z.object({
    note: z.string().optional(),
  }),
});

// Same shape as flagAssetSchema (id param + optional note) but kept as its own named export
// for POST /hr/me/assets/:id/report-issue — an employee self-service action, not the
// hr/admin-only flag endpoint above, even though the payload happens to match.
export const reportAssetIssueSchema = flagAssetSchema;

// Used on GET /hr/employees/:id/assets — lives here since it's asset-domain logic even
// though the route is mounted under employee.routes.ts.
export const employeeAssetsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid employee id"),
  }),
  query: z.object({
    open: z.enum(["true", "false"]).optional(),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    parent_name: z.string().optional(),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9_]+$/, "Slug must be lowercase alphanumeric with underscores"),
    spec_schema: z.array(
      z.object({
        key: z.string().min(1),
        label: z.string().min(1),
        type: z.enum(["text", "number", "enum", "boolean"]),
        options: z.array(z.string()).optional(),
        required: z.boolean(),
        unit: z.string().optional(),
      }),
    ),
    sort_order: z.number().int().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createCategorySchema.shape.body.partial(),
});

export const categoryIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid("Invalid category id") }),
});

export const deleteAssetImageSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid asset id"),
    imageId: z.string().uuid("Invalid image id"),
  }),
});

export const createMaintenanceSchema = z.object({
  body: z.object({
    assetId: z.string().uuid("Invalid asset id"),
    requesterId: z.string().uuid("Invalid requester id"),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    rejectionReason: z.string().optional(),
    price: z.string().optional().nullable(),
    maintenanceDate: z.string().datetime().optional(),
  }),
});

export const updateMaintenanceSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid maintenance id"),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    rejectionReason: z.string().optional(),
    price: z.string().optional().nullable(),
    maintenanceDate: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional(),
  }),
});

export const maintenanceIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid maintenance id"),
  }),
});
