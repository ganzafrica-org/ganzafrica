import { z } from "zod";

const colorSchema = z.enum(["green", "yellow", "blue", "orange"], {
  errorMap: () => ({ message: "Color must be one of green, yellow, blue, orange" }),
});

// Same six categories document.validation.ts's createDocumentSchema offers (Leave Attachment
// isn't creatable through the generic document form, so a design template for it would never be
// reachable from any picker).
const CATEGORIES = [
  "Contract Templates",
  "Policies & Procedures",
  "Forms & Applications",
  "Training Materials",
  "Compliance & Legal",
  "Onboarding Materials",
] as const;

const categorySchema = z.enum(CATEGORIES, {
  errorMap: () => ({ message: `category must be one of ${CATEGORIES.join(", ")}` }),
});

const titleColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "titleColor must be a hex color like #1a1a1a");

const borderStyleSchema = z.enum(["NONE", "SIMPLE", "DOUBLE", "ACCENT"], {
  errorMap: () => ({ message: "borderStyle must be one of NONE, SIMPLE, DOUBLE, ACCENT" }),
});

// Relative paths won't resolve at server-side render time, so only absolute https:// URLs and
// data: URIs are accepted. Empty string means "no logo". The 300,000-char cap comfortably covers
// a data: URI for the ~200KB image the frontend's file picker caps uploads at (base64 inflates
// size by ~4/3, plus a short "data:image/...;base64," prefix).
const logoUrlSchema = z
  .string()
  .max(300_000)
  .refine((v) => v === "" || v.startsWith("https://") || v.startsWith("data:"), {
    message: "logoUrl must be an absolute https:// URL or a data: URI",
  });

const logoPositionSchema = z.enum(["TOP_LEFT", "BOTTOM_LEFT"], {
  errorMap: () => ({ message: "logoPosition must be one of TOP_LEFT, BOTTOM_LEFT" }),
});

export const createDocumentCategoryTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    color: colorSchema,
    category: categorySchema.nullable().optional(),
    header_text: z.string().max(200).optional(),
    description: z.string().max(1000).optional(),
    titleColor: titleColorSchema.optional(),
    borderStyle: borderStyleSchema.optional(),
    logoUrl: logoUrlSchema.optional(),
    logoPosition: logoPositionSchema.optional(),
  }),
});

export const updateDocumentCategoryTemplateSchema = z.object({
  params: z.object({ id: z.string().uuid("Invalid category template id") }),
  body: createDocumentCategoryTemplateSchema.shape.body.partial(),
});

export const documentCategoryTemplateIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid("Invalid category template id") }),
});
