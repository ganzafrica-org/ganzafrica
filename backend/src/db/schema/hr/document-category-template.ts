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
import {
  documentCategoryTemplateColorEnum,
  documentCategoryTemplateBorderStyleEnum,
  documentCategoryTemplateLogoPositionEnum,
  documentCategoryEnum,
} from "./hr.enums";

export const hr_document_category_templates = pgTable("hr_document_category_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  color: documentCategoryTemplateColorEnum("color").notNull(),
  // Which hr_documents.category this template applies to when picked from the "use a saved
  // template" flow (document.service.ts's createDocument, via document-form-sheet.tsx). Nullable
  // and left unenforced by FK deliberately: null means "universal" — offered regardless of the
  // category being created — so a template made before this field existed keeps showing up
  // everywhere instead of silently disappearing from every picker.
  category: documentCategoryEnum("category"),
  // Branding fields for "how it should look" — kept simple for v1.
  header_text: text("header_text"), // e.g. text shown at the top of documents in this category
  description: text("description"),
  // Branding fields (v1.1, additive): all default so existing templates keep rendering unchanged.
  titleColor: text("title_color").notNull().default("#1a1a1a"),
  borderStyle: documentCategoryTemplateBorderStyleEnum("border_style").notNull().default("NONE"),
  // Absolute https:// URL or data: URI only — a relative path won't resolve at render time.
  logoUrl: text("logo_url").notNull().default(""),
  logoPosition: documentCategoryTemplateLogoPositionEnum("logo_position")
    .notNull()
    .default("TOP_LEFT"),
  ...timestampFields,
});

export type DocumentCategoryTemplate = typeof hr_document_category_templates.$inferSelect;
export type NewDocumentCategoryTemplate = typeof hr_document_category_templates.$inferInsert;
