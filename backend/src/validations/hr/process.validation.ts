import { z } from "zod";

const numericIdParam = z
  .string()
  .refine((v) => !Number.isNaN(parseInt(v)), { message: "ID must be a number" })
  .transform((v) => parseInt(v));

const processType = z.enum(["onboarding", "offboarding"]);
const assigneeClass = z.enum(["hr", "it", "manager", "finance", "employee"]);
const visibility = z.enum(["all", "staff_only"]);
const taskKind = z.enum([
  "checklist",
  "contract_signing",
  "document_upload",
  "asset_assignment",
  "leave_setup",
]);

export const idSchema = z.object({ params: z.object({ id: numericIdParam }) });

export const listProcessesSchema = z.object({
  query: z.object({
    type: processType.optional(),
    status: z.enum(["in_progress", "completed", "cancelled"]).optional(),
    employee_id: z.string().uuid().optional(),
  }),
});

export const startProcessSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    type: processType,
    template_id: z.number().int().positive().optional(),
    started_at: z.coerce.date().optional(),
  }),
});

export const completeTaskSchema = z.object({
  params: z.object({ id: numericIdParam }),
  body: z.object({ notes: z.string().max(2000).optional() }),
});

export const skipTaskSchema = z.object({
  params: z.object({ id: numericIdParam }),
  body: z.object({ notes: z.string().min(1, "A note is required when skipping").max(2000) }),
});

export const patchTaskSchema = z.object({
  params: z.object({ id: numericIdParam }),
  body: z.object({
    assignee_user_id: z.number().int().positive().nullable().optional(),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
      .nullable()
      .optional(),
    link_ref: z.record(z.unknown()).optional(),
  }),
});

export const createTemplateSchema = z.object({
  body: z.object({
    type: processType,
    name: z.string().min(1).max(200),
    employment_types: z
      .array(z.enum(["fellow", "analyst", "staff", "contractor", "intern"]))
      .nullable()
      .optional(),
  }),
});

export const updateTemplateSchema = z.object({
  params: z.object({ id: numericIdParam }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    employment_types: z
      .array(z.enum(["fellow", "analyst", "staff", "contractor", "intern"]))
      .nullable()
      .optional(),
    is_active: z.boolean().optional(),
  }),
});

export const addTemplateTaskSchema = z.object({
  params: z.object({ id: numericIdParam }),
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    sort_order: z.number().int().min(0).optional(),
    default_assignee: assigneeClass,
    visibility: visibility.optional(),
    due_offset_days: z.number().int().min(-365).max(365).nullable().optional(),
    is_blocking: z.boolean().optional(),
    kind: taskKind.optional(),
  }),
});

export const templateTaskIdSchema = z.object({
  params: z.object({ id: numericIdParam, taskId: numericIdParam }),
});

export const listTemplatesSchema = z.object({
  query: z.object({ type: processType.optional() }),
});
