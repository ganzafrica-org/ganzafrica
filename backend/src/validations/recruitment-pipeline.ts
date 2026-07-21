import { z } from "zod";
import { RULE_OPERATORS } from "../types/recruitment";
import { PIPELINE_STAGES } from "../db/schema/recruitment/pipeline";

const idParam = z
  .string()
  .refine((v) => !Number.isNaN(parseInt(v)), { message: "ID must be a number" })
  .transform((v) => parseInt(v));

const operatorEnum = z.enum(RULE_OPERATORS as unknown as [string, ...string[]]);
const stageEnum = z.enum(PIPELINE_STAGES as unknown as [string, ...string[]]);

export const idParamSchema = z.object({ params: z.object({ id: idParam }) });

export const transitionSchema = z.object({
  params: z.object({ id: idParam }),
  body: z.object({
    to_stage: stageEnum,
    note: z.string().optional(),
    send_email: z.boolean().optional(),
  }),
});

export const createScreeningRuleSchema = z.object({
  params: z.object({ id: idParam }),
  body: z.object({
    field_key: z.string().min(1),
    operator: operatorEnum,
    value: z.unknown().optional(),
    action: z.enum(["auto_reject", "flag"]),
    email_template: z.string().nullable().optional(),
    rejection_reason: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const patchScreeningRuleSchema = z.object({
  params: z.object({ id: idParam, ruleId: idParam }),
  body: z.object({
    field_key: z.string().min(1).optional(),
    operator: operatorEnum.optional(),
    value: z.unknown().optional(),
    action: z.enum(["auto_reject", "flag"]).optional(),
    email_template: z.string().nullable().optional(),
    rejection_reason: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const screeningRuleIdSchema = z.object({
  params: z.object({ id: idParam, ruleId: idParam }),
});

export const createCriterionSchema = z.object({
  params: z.object({ id: idParam }),
  body: z.object({
    name: z.string().min(1),
    weight: z.union([z.number(), z.string()]).optional(),
    max_score: z.number().int().positive().optional(),
    sort_order: z.number().int().optional(),
  }),
});

export const patchCriterionSchema = z.object({
  params: z.object({ id: idParam, criterionId: idParam }),
  body: z.object({
    name: z.string().min(1).optional(),
    weight: z.union([z.number(), z.string()]).optional(),
    max_score: z.number().int().positive().optional(),
    sort_order: z.number().int().optional(),
  }),
});

export const criterionIdSchema = z.object({
  params: z.object({ id: idParam, criterionId: idParam }),
});

export const putScoresSchema = z.object({
  params: z.object({ id: idParam }),
  body: z.object({
    scores: z.array(
      z.object({
        criterion_id: z.number().int(),
        score: z.number().int(),
        comment: z.string().optional(),
      }),
    ),
  }),
});

// --- REC-06 ---
export const assignReviewerSchema = z.object({
  params: z.object({ id: idParam }),
  body: z.object({
    reviewer_user_id: z.number().int(),
    role: z.string().optional(),
  }),
});

export const reviewerIdSchema = z.object({
  params: z.object({ id: idParam, reviewerId: idParam }),
});

export const addNoteSchema = z.object({
  params: z.object({ id: idParam }),
  body: z.object({
    stage: z.string().min(1),
    note: z.string().min(1),
    rating: z.number().int().min(1).max(5).optional(),
  }),
});

export const closeOutSchema = z.object({
  params: z.object({ id: idParam }),
  body: z.object({ rejection_reason: z.string().optional() }).optional(),
});

// --- REC-07 CV ranking ---
export const createRankingCriterionSchema = z.object({
  params: z.object({ id: idParam }),
  body: z.object({
    keyword: z.string().min(1),
    weight: z.union([z.number(), z.string()]).optional(),
    category: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const patchRankingCriterionSchema = z.object({
  params: z.object({ id: idParam, criterionId: idParam }),
  body: z.object({
    keyword: z.string().min(1).optional(),
    weight: z.union([z.number(), z.string()]).optional(),
    category: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const rankingCriterionIdSchema = z.object({
  params: z.object({ id: idParam, criterionId: idParam }),
});
