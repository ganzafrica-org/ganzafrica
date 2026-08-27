// hr.document-category-templates.ts
//
// Additive, standalone v1 entity for "Add the option to create a document template"
// (Things-to-work-on.md). Lets HR design how documents in a given category should look —
// a name, one of four brand colors, and a couple of simple branding fields — WITHOUT touching
// the existing hr_documents.category enum or the document upload/category-select flow.
//
// Deliberately not wired to hr_documents via FK: auto-generating a document from one of these
// templates is explicit follow-up work, not built here.
import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { documentCategoryTemplateColorEnum } from "./hr.enums";

export const hr_document_category_templates = pgTable("hr_document_category_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  color: documentCategoryTemplateColorEnum("color").notNull(),
  // Branding fields for "how it should look" — kept simple for v1.
  header_text: text("header_text"), // e.g. text shown at the top of documents in this category
  description: text("description"),
  ...timestampFields,
});

export type DocumentCategoryTemplate = typeof hr_document_category_templates.$inferSelect;
export type NewDocumentCategoryTemplate = typeof hr_document_category_templates.$inferInsert;
