// hr.assets.ts
import { boolean, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { assetIssueEnum, assetStatusEnum } from "./hr.enums";
import { hr_users } from "./employee";
import { employees } from "./employees";
import { hr_asset_categories } from "./asset-categories";

export const hr_assets = pgTable("hr_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  device_name: text("device_name").notNull(),
  serial_number: text("serial_number").notNull().unique(),

  // FK to category — replaces the raw text "category" column
  category_id: uuid("category_id")
    .notNull()
    .references(() => hr_asset_categories.id),

  purchase_price: numeric("purchase_price", { precision: 12, scale: 2 }),
  status: assetStatusEnum("status").notNull().default("AVAILABLE"),

  assigned_to_id: uuid("assigned_to_id").references(() => hr_users.id, {
    onDelete: "set null",
  }),
  // FND-05 expand: new employees FK, backfilled by the merge script.
  assigned_to_employee_id: uuid("assigned_to_employee_id").references(() => employees.id, {
    onDelete: "set null",
  }),
  assigned_at: timestamp("assigned_at", { withTimezone: true }),
  returned_at: timestamp("returned_at", { withTimezone: true }),

  notes: text("notes"),
  has_issue: assetIssueEnum("has_issue").notNull().default("NO"),
  is_flagged: boolean("is_flagged").notNull().default(false),

  ...timestampFields,
});

export type Asset = typeof hr_assets.$inferSelect;
export type NewAsset = typeof hr_assets.$inferInsert;
