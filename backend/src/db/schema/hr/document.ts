import { jsonb, integer, pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { documentCategoryEnum, documentStatusEnum } from "./hr.enums";
import { hr_users } from "./employee";
import { employees } from "./employees";
import { hr_contracts } from "@/db/schema/hr/contract";

export const hr_documents = pgTable(
  "hr_documents",
  {
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
    // DOC-plus: search-in-file — extracted (normalized) text + when it was indexed. Populated
    // out-of-band after upload via the shared text-extraction service (OCR seam for scans).
    extracted_text: text("extracted_text"),
    indexed_at: timestamp("indexed_at", { withTimezone: true }),
    // DOC-plus: retention — retain_until is the auto-archive deadline (null = keep indefinitely);
    // archived_at soft-archives a document past retention (hidden from normal lists, not deleted).
    retain_until: timestamp("retain_until", { withTimezone: true }),
    archived_at: timestamp("archived_at", { withTimezone: true }),
    created_by_id: uuid("created_by_id")
      .references(() => hr_users.id)
      .notNull(),
    // FND-05 expand: new employees FK, backfilled by the merge script.
    created_by_employee_id: uuid("created_by_employee_id").references(() => employees.id),
    ...timestampFields,
  },
  (t) => ({
    retainUntilIdx: index("hr_documents_retain_until_idx").on(t.retain_until),
    archivedAtIdx: index("hr_documents_archived_at_idx").on(t.archived_at),
  }),
);

export type document = typeof hr_documents.$inferSelect;
export type NewDocument = typeof hr_documents.$inferInsert;
