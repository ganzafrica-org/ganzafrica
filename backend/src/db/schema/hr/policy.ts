import { boolean, integer, pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { policyCategoryEnum, policyStatusEnum } from "./hr.enums";
import { employees } from "./employees";

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
  created_by_employee_id: uuid("created_by_employee_id").references(() => employees.id, {
    onDelete: "restrict",
  }),
  ...timestampFields,
});

export const hr_policy_acknowledgements = pgTable(
  "hr_policy_acknowledgements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    policy_id: uuid("policy_id")
      .notNull()
      .references(() => hr_policies.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    employee_id: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    acknowledged_at: timestamp("acknowledged_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqueAcknowledgement: uniqueIndex("hr_policy_acknowledgements_unique_idx").on(
      t.policy_id,
      t.version,
      t.employee_id,
    ),
  }),
);

export type Policy = typeof hr_policies.$inferSelect;
export type NewPolicy = typeof hr_policies.$inferInsert;
export type PolicyAcknowledgement = typeof hr_policy_acknowledgements.$inferSelect;
export type NewPolicyAcknowledgement = typeof hr_policy_acknowledgements.$inferInsert;
