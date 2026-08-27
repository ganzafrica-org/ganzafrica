import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { employees } from "./employees";

/**
 * MOD-02 backfill leftovers: rows the name-match against legacy `hr_contracts.manager`/
 * `report_to` text couldn't resolve to a single employee (zero or multiple matches), or that
 * would have introduced a manager_id cycle. Drives the "unresolved managers" worklist so HR can
 * assign manually; a row is deleted (or marked resolved) once HR picks a manager for it.
 */
export const org_backfill_unresolved = pgTable("org_backfill_unresolved", {
  id: uuid("id").primaryKey().defaultRandom(),
  employee_id: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  raw_text: text("raw_text").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  ...timestampFields,
});

export type OrgBackfillUnresolved = typeof org_backfill_unresolved.$inferSelect;
export type NewOrgBackfillUnresolved = typeof org_backfill_unresolved.$inferInsert;
