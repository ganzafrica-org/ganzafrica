import { z } from "zod";
import { OFFER_STATUSES } from "../db/schema/recruitment/offers";

void OFFER_STATUSES;

const idParam = z
  .string()
  .refine((v) => !Number.isNaN(parseInt(v)), { message: "ID must be a number" })
  .transform((v) => parseInt(v));

const offerBody = {
  position_title: z.string().min(1),
  employment_type: z.enum(["fellow", "analyst", "staff", "contractor", "intern"]),
  department: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  gross_salary: z.union([z.number(), z.string()]).nullable().optional(),
  currency: z.string().optional(),
  additional_terms: z.string().nullable().optional(),
};

export const createOfferSchema = z.object({
  params: z.object({ id: idParam }),
  body: z.object(offerBody),
});

export const updateOfferSchema = z.object({
  params: z.object({ offerId: idParam }),
  body: z.object({
    position_title: offerBody.position_title.optional(),
    employment_type: offerBody.employment_type.optional(),
    department: offerBody.department,
    start_date: offerBody.start_date,
    gross_salary: offerBody.gross_salary,
    currency: offerBody.currency,
    additional_terms: offerBody.additional_terms,
  }),
});

export const offerIdSchema = z.object({ params: z.object({ offerId: idParam }) });
export const applicationIdSchema = z.object({ params: z.object({ id: idParam }) });

export const setLetterSchema = z.object({
  params: z.object({ offerId: idParam }),
  body: z.object({ letter_file_key: z.string().min(1) }),
});

export const tokenSchema = z.object({
  params: z.object({ token: z.string().min(10) }),
});

export const respondSchema = z.object({
  params: z.object({ token: z.string().min(10) }),
  body: z.object({
    decision: z.enum(["accept", "decline"]),
    decline_reason: z.string().optional(),
  }),
});
