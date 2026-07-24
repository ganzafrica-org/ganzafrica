import { numeric, pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { hr_users } from "./employee";
import { employees } from "./employees";
import { hr_assets } from "./assets";
import { maintenanceStatusEnum } from "./hr.enums";
import { timestampFields } from "../common";

export const hr_asset_maintenance = pgTable("hr_asset_maintenance", {
  id: uuid("id").primaryKey().defaultRandom(),
  asset_id: uuid("asset_id")
    .notNull()
    .references(() => hr_assets.id, { onDelete: "cascade" }),
  // Legacy hr_users FK, nullable pending the FND-07 drop. MOD-01 writes requester_employee_id.
  requester_id: uuid("requester_id").references(() => hr_users.id),
  requester_employee_id: uuid("requester_employee_id").references(() => employees.id),
  title: text("title").notNull(),
  description: text("description"),
  status: maintenanceStatusEnum("status").notNull().default("PENDING"),
  rejection_reason: text("rejection_reason"),
  price: numeric("price", { precision: 12, scale: 2 }),
  maintenance_date: timestamp("maintenance_date", { withTimezone: true }).defaultNow(),

  ...timestampFields,
});

export type AssetMaintenance = typeof hr_asset_maintenance.$inferSelect;
export type NewAssetMaintenance = typeof hr_asset_maintenance.$inferInsert;
