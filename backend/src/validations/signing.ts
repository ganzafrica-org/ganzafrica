import { z } from "zod";

const idParam = z
  .string()
  .refine((v) => !Number.isNaN(parseInt(v)), { message: "ID must be a number" })
  .transform((v) => parseInt(v));

export const idSchema = z.object({ params: z.object({ id: idParam }) });
export const tokenSchema = z.object({ params: z.object({ token: z.string().min(10) }) });

export const createTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    file_key: z.string().nullable().optional(),
  }),
});

export const addFieldSchema = z.object({
  params: z.object({ id: idParam }),
  body: z.object({
    key: z.string().min(1),
    label: z.string().min(1),
    type: z.enum(["signature", "text", "date", "checkbox"]),
    required: z.boolean().optional(),
    signer_index: z.number().int().optional(),
    sort_order: z.number().int().optional(),
  }),
});

export const fieldIdSchema = z.object({ params: z.object({ id: idParam, fieldId: idParam }) });

export const createRequestSchema = z.object({
  body: z.object({
    template_id: z.number().int(),
    subject: z.string().min(1),
    signer_type: z.enum(["internal", "external"]),
    signer_user_id: z.number().int().nullable().optional(),
    signer_email: z.string().email().nullable().optional(),
    signer_name: z.string().nullable().optional(),
    ref_kind: z.string().nullable().optional(),
    ref_id: z.number().int().nullable().optional(),
    expires_at: z.string().nullable().optional(),
  }),
});

export const signSchema = z.object({
  params: z.object({ id: idParam }),
  body: z.object({ field_values: z.record(z.string(), z.unknown()).optional() }),
});

export const signTokenSchema = z.object({
  params: z.object({ token: z.string().min(10) }),
  body: z.object({ field_values: z.record(z.string(), z.unknown()).optional() }),
});
