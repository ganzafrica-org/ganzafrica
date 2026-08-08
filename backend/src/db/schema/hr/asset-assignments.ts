// hr.asset-assignments.ts
// MOD-04 §3 — assignment history. hr_assets keeps the "current holder" denormalized
// (assigned_to_employee_id / assigned_at / returned_at); this table is the append-only
// timeline of every assign→return cycle, written in the same transaction as the
// denormalized fields on hr_assets.
import { pgTable, uuid, text, timestamp, integer, index, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { timestampFields } from "../common";
import { hr_assets } from "./assets";
import { employees } from "./employees";
import { users } from "../users";

export const hr_asset_assignments = pgTable(
  "hr_asset_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    asset_id: uuid("asset_id")
      .notNull()
      .references(() => hr_assets.id, { onDelete: "cascade" }),
    employee_id: uuid("employee_id")
      .notNull()
      .references(() => employees.id),
    // users.id (integer PK) of whoever performed the assignment — an HR/admin actor, not
    // necessarily the holder. Nullable: system/seed-created assignments have no actor.
    assigned_by: integer("assigned_by").references(() => users.id),

    assigned_at: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
    returned_at: timestamp("returned_at", { withTimezone: true }),
    return_condition: text("return_condition"),
    notes: text("notes"),

    ...timestampFields,
  },
  (t) => ({
    assetIdx: index("hr_asset_assignments_asset_idx").on(t.asset_id),
    employeeIdx: index("hr_asset_assignments_employee_idx").on(t.employee_id),
    // DB-level backstop for the AVAILABLE-only assign guard (spec §8 concurrency case):
    // at most one open (returned_at IS NULL) assignment row per asset, ever.
    oneOpenAssignmentPerAsset: uniqueIndex("hr_asset_assignments_one_open_per_asset")
      .on(t.asset_id)
      .where(sql`${t.returned_at} IS NULL`),
  }),
);

export type AssetAssignment = typeof hr_asset_assignments.$inferSelect;
export type NewAssetAssignment = typeof hr_asset_assignments.$inferInsert;
