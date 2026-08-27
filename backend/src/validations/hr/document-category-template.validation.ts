import { z } from "zod";

const colorSchema = z.enum(["green", "yellow", "blue", "orange"], {
  errorMap: () => ({ message: "Color must be one of green, yellow, blue, orange" }),
});

export const createDocumentCategoryTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    color: colorSchema,
    header_text: z.string().max(200).optional(),
    description: z.string().max(1000).optional(),
  }),
});

export const updateDocumentCategoryTemplateSchema = z.object({
  params: z.object({ id: z.string().uuid("Invalid category template id") }),
  body: createDocumentCategoryTemplateSchema.shape.body.partial(),
});

export const documentCategoryTemplateIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid("Invalid category template id") }),
});
