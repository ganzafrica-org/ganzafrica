import { z } from "zod";
import { RULE_OPERATORS } from "../types/recruitment";

const idParam = z
  .string()
  .refine((v) => !Number.isNaN(parseInt(v)), { message: "ID must be a number" })
  .transform((v) => parseInt(v));

const formFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum([
    "text",
    "textarea",
    "select",
    "multiselect",
    "number",
    "date",
    "file",
    "boolean",
    "country",
  ]),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  max_length: z.number().int().positive().optional(),
  order: z.number().int(),
  section: z.string(),
});

const formDefinitionSchema = z.object({
  standard: z.array(formFieldSchema),
  custom: z.array(formFieldSchema),
});

export const idParamSchema = z.object({
  params: z.object({ id: idParam }),
});

export const eligibilityCheckSchema = z.object({
  params: z.object({ id: idParam }),
  body: z.object({
    answers: z.record(z.string(), z.unknown()).default({}),
  }),
});

export const putFormSchema = z.object({
  params: z.object({ id: idParam }),
  body: z.object({
    definition: formDefinitionSchema,
  }),
});

const operatorEnum = z.enum(RULE_OPERATORS as unknown as [string, ...string[]]);

export const createRuleSchema = z.object({
  params: z.object({ id: idParam }),
  body: z.object({
    field_key: z.string().min(1),
    operator: operatorEnum,
    value: z.unknown().optional(),
    reject_message: z.string().min(1),
    is_active: z.boolean().optional(),
    sort_order: z.number().int().optional(),
  }),
});

export const patchRuleSchema = z.object({
  params: z.object({
    id: idParam,
    ruleId: idParam,
  }),
  body: z.object({
    field_key: z.string().min(1).optional(),
    operator: operatorEnum.optional(),
    value: z.unknown().optional(),
    reject_message: z.string().min(1).optional(),
    is_active: z.boolean().optional(),
    sort_order: z.number().int().optional(),
  }),
});

export const deleteRuleSchema = z.object({
  params: z.object({
    id: idParam,
    ruleId: idParam,
  }),
});
