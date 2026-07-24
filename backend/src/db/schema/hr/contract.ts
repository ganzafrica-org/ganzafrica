import { integer, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { contractStatusEnum, contractTypeEnum } from "./hr.enums";
import { employees } from "./employees";

export const hr_contracts = pgTable("hr_contracts", {
  id: uuid("id").primaryKey().defaultRandom(),

  employee_ref_id: uuid("employee_ref_id").references(() => employees.id, { onDelete: "cascade" }),

  // ── Job Details (Step 2) ───────────────────
  job_title: text("job_title").notNull(),
  department: text("department"),
  work_location: text("work_location"),
  manager: text("manager"),
  report_to: text("report_to"),

  // ── Contract Details (Step 3) ──────────────
  start_date: timestamp("start_date", { withTimezone: true }).notNull(),
  employment_term: text("employment_term").notNull(), // 'indefinite' | 'definite'
  end_date: timestamp("end_date", { withTimezone: true }), // only if definite
  employment_type: text("employment_type").notNull(), // 'full-time' | 'part-time'
  days_per_week: integer("days_per_week"), // only if part-time
  compensation_type: text("compensation_type").notNull(), // 'hourly' | 'salaried'
  salary_scale: text("salary_scale"), // 'annual'|'monthly'|'weekly'|'daily'
  currency: text("currency").notNull().default("RWF"),
  base_monthly_rate: numeric("base_monthly_rate", { precision: 14, scale: 2 }),
  gross_annual_rate: numeric("gross_annual_rate", { precision: 14, scale: 2 }),
  employment_agreement_url: text("employment_agreement_url"),

  // ── Status ─────────────────────────────────
  status: contractStatusEnum("status").notNull().default("ACTIVE"),
  notes: text("notes"),

  ...timestampFields,
});

export type Contract = typeof hr_contracts.$inferSelect;
export type NewContract = typeof hr_contracts.$inferInsert;
