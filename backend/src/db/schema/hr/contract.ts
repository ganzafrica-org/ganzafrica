import { numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { contractStatusEnum, contractTypeEnum } from "./hr.enums";
import { hr_users } from "./employee";

export const hr_contracts = pgTable("hr_contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  employee_id: uuid("employee_id")
    .notNull()
    .references(() => hr_users.id, { onDelete: "cascade" }),
  type: contractTypeEnum("type").notNull(),
  start_date: timestamp("start_date", { withTimezone: true }).notNull(),
  end_date: timestamp("end_date", { withTimezone: true }),
  salary: numeric("salary", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  status: contractStatusEnum("status").notNull().default("ACTIVE"),
  notes: text("notes"),
  ...timestampFields,
});

export type Contract = typeof hr_contracts.$inferSelect;
export type NewContract = typeof hr_contracts.$inferInsert;
