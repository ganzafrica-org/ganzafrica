import { boolean, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { policyCategoryEnum, policyStatusEnum } from "./hr.enums";
import { hr_users } from "./employee";

export const hr_policies = pgTable("hr_policies", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content"),
  category: text("category").notNull(),
  policy_category: policyCategoryEnum("policy_category").default("GENERAL"),
  version: text("version").notNull(),
  file_path: text("file_path").notNull(),
  file_size: text("file_size").notNull(),
  downloads: integer("downloads").notNull().default(0),
  is_active: boolean("is_active").notNull().default(true),
  status: policyStatusEnum("status").notNull().default("PUBLISHED"),
  created_by_id: uuid("created_by_id")
    .notNull()
    .references(() => hr_users.id, { onDelete: "restrict" }),
  ...timestampFields,
});

export type Policy = typeof hr_policies.$inferSelect;
export type NewPolicy = typeof hr_policies.$inferInsert;
