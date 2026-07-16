import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { leaveStatusEnum, leaveTypeEnum } from "./hr.enums";
import { hr_users } from "./employee";
import { employees } from "./employees";

export const hr_leaves = pgTable("hr_leaves", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => hr_users.id, { onDelete: "cascade" }),
  // FND-05 expand: new employees FK, backfilled by the merge script; user_id dropped in FND-07.
  employee_id: uuid("employee_id").references(() => employees.id, { onDelete: "cascade" }),
  type: leaveTypeEnum("type").notNull(),
  start_date: timestamp("start_date", { withTimezone: true }).notNull(),
  end_date: timestamp("end_date", { withTimezone: true }).notNull(),
  reason: text("reason").notNull(),
  status: leaveStatusEnum("status").notNull().default("PENDING"),
  reviewed_by_id: uuid("reviewed_by_id").references(() => hr_users.id, {
    onDelete: "set null",
  }),
  reviewed_by_employee_id: uuid("reviewed_by_employee_id").references(() => employees.id, {
    onDelete: "set null",
  }),
  reviewed_at: timestamp("reviewed_at", { withTimezone: true }),
  ...timestampFields,
});

export type Leave = typeof hr_leaves.$inferSelect;
export type NewLeave = typeof hr_leaves.$inferInsert;
