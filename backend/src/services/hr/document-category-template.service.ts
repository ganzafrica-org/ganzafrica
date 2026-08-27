import { eq, ne, and } from "drizzle-orm";
import { db } from "../../db/client";
import { hr_document_category_templates } from "../../db/schema/hr/document-category-template";
import { AppError } from "../../middlewares/error.middleware";

export type TemplateColor = "green" | "yellow" | "blue" | "orange";

export interface CreateDocumentCategoryTemplateInput {
  name: string;
  color: TemplateColor;
  header_text?: string;
  description?: string;
}

export type UpdateDocumentCategoryTemplateInput = Partial<CreateDocumentCategoryTemplateInput>;

export async function listDocumentCategoryTemplates() {
  return db
    .select()
    .from(hr_document_category_templates)
    .orderBy(hr_document_category_templates.name);
}

export async function getDocumentCategoryTemplate(id: string) {
  const [row] = await db
    .select()
    .from(hr_document_category_templates)
    .where(eq(hr_document_category_templates.id, id))
    .limit(1);
  if (!row) throw new AppError("Category template not found", 404);
  return row;
}

export async function createDocumentCategoryTemplate(input: CreateDocumentCategoryTemplateInput) {
  const existing = await db
    .select({ id: hr_document_category_templates.id })
    .from(hr_document_category_templates)
    .where(eq(hr_document_category_templates.name, input.name))
    .limit(1);
  if (existing.length) {
    throw new AppError("A category template with this name already exists", 409);
  }

  const [inserted] = await db
    .insert(hr_document_category_templates)
    .values({
      name: input.name,
      color: input.color,
      header_text: input.header_text ?? null,
      description: input.description ?? null,
    })
    .returning();

  if (!inserted) throw new AppError("Failed to create category template", 400);
  return inserted;
}

export async function updateDocumentCategoryTemplate(
  id: string,
  input: UpdateDocumentCategoryTemplateInput,
) {
  if (input.name) {
    const dupe = await db
      .select({ id: hr_document_category_templates.id })
      .from(hr_document_category_templates)
      .where(
        and(
          eq(hr_document_category_templates.name, input.name),
          ne(hr_document_category_templates.id, id),
        ),
      )
      .limit(1);
    if (dupe.length) {
      throw new AppError("A category template with this name already exists", 409);
    }
  }

  const [updated] = await db
    .update(hr_document_category_templates)
    .set({ ...input, updated_at: new Date() })
    .where(eq(hr_document_category_templates.id, id))
    .returning();

  if (!updated) throw new AppError("Category template not found", 404);
  return updated;
}

export async function deleteDocumentCategoryTemplate(id: string): Promise<void> {
  const [deleted] = await db
    .delete(hr_document_category_templates)
    .where(eq(hr_document_category_templates.id, id))
    .returning({ id: hr_document_category_templates.id });
  if (!deleted) throw new AppError("Category template not found", 404);
}
