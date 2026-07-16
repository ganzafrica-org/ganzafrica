import { jsonb, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { documentCategoryEnum, documentStatusEnum } from "./hr.enums";
import { hr_users } from "./employee";
import { hr_contracts } from "@/db/schema/hr/contract";

export const hr_documents = pgTable("hr_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  document_name: text("document_name").notNull(),
  category: documentCategoryEnum("document_category").notNull(), // Validated at service layer against structural strings
  version: text("version").notNull(),
  description: text("description").notNull(),
  department: text("department").notNull(),
  file_path: text("file_path").notNull(),
  file_size: text("file_size").notNull(),
  downloads: integer("downloads").default(0).notNull(),
  status: documentStatusEnum("status").default("DRAFT").notNull(),
  access: jsonb("access").notNull(), // Stores rules containing types, targets, permissions, and owners
  contract_id: uuid("contract_id").references(() => hr_contracts.id), // The dynamic Foreign Key link requested
  created_by_id: uuid("created_by_id")
    .references(() => hr_users.id)
    .notNull(),
  ...timestampFields,
});

export type document = typeof hr_documents.$inferSelect;
export type NewDocument = typeof hr_documents.$inferInsert;
