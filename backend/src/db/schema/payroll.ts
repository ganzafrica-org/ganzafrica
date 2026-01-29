import {
  pgTable,
  serial,
  text,
  integer,
  decimal,
  timestamp,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { timestampFields } from "./common";
import { users } from "./users";

export const payrolls = pgTable("payrolls", {
  id: serial("id").primaryKey(),

  // User reference - must match user in database by email
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),

  // Period and Payment Info
  payroll_period: text("payroll_period").notNull(), // e.g., "01-31.12.25"
  date_of_payment: date("date_of_payment").notNull(),

  // Employee Details from CSV
  name: text("name").notNull(), // For display and matching
  email: text("email").notNull(), // From CSV - used to match with users table
  staff_fellow_number: text("staff_fellow_number"),
  employee_tin_number: text("employee_tin_number"),
  employee_id: text("employee_id"),
  employee_rssb_no: text("employee_rssb_no"),
  program: text("program"), // e.g., HF, ABF, SFA, BF

  // Salary Information
  basic_salary: decimal("basic_salary", { precision: 15, scale: 2 }).notNull(),
  other: decimal("other", { precision: 15, scale: 2 }).default("0"),
  gross_salary: decimal("gross_salary", { precision: 15, scale: 2 }).notNull(),

  // Employer Contributions
  medical_employer: decimal("medical_employer", {
    precision: 15,
    scale: 2,
  }).default("0"),
  csr_employer: decimal("csr_employer", { precision: 15, scale: 2 }).default(
    "0",
  ),
  maternity_employer: decimal("maternity_employer", {
    precision: 15,
    scale: 2,
  }).default("0"),
  total_employer_expenditure: decimal("total_employer_expenditure", {
    precision: 15,
    scale: 2,
  }).default("0"),

  // Employee Contributions
  medical_employee: decimal("medical_employee", {
    precision: 15,
    scale: 2,
  }).default("0"),
  csr_employee: decimal("csr_employee", { precision: 15, scale: 2 }).default(
    "0",
  ),
  maternity_employee: decimal("maternity_employee", {
    precision: 15,
    scale: 2,
  }).default("0"),
  tpr: decimal("tpr", { precision: 15, scale: 2 }).default("0"),

  // Net Salary Calculations
  net_salary_before_cbhi: decimal("net_salary_before_cbhi", {
    precision: 15,
    scale: 2,
  }).notNull(),
  cbhi: decimal("cbhi", { precision: 15, scale: 2 }).default("0"),
  net_salary: decimal("net_salary", { precision: 15, scale: 2 }).notNull(),

  // Other Financial Info
  total_rra_rssb_cost: decimal("total_rra_rssb_cost", {
    precision: 15,
    scale: 2,
  }).default("0"),
  bnr_exchange_rate_date: date("bnr_exchange_rate_date"),
  exchange_rate_used: decimal("exchange_rate_used", {
    precision: 10,
    scale: 4,
  }),
  net_salary_usd: decimal("net_salary_usd", { precision: 15, scale: 2 }),
  difference_due_to_exchange: decimal("difference_due_to_exchange", {
    precision: 15,
    scale: 2,
  }),
  difference_in_rwf: decimal("difference_in_rwf", { precision: 15, scale: 2 }),
  basic_salary_adjustment: decimal("basic_salary_adjustment", {
    precision: 15,
    scale: 2,
  }),

  // Payslip File Storage - stored as hr/{name}/{month}/payslip.pdf
  payslip_file_url: text("payslip_file_url"), // CDN URL to the generated PDF payslip
  payslip_file_key: text("payslip_file_key"), // Storage key in Digital Ocean Spaces

  // Email Tracking
  email_sent: boolean("email_sent").notNull().default(false),
  email_sent_at: timestamp("email_sent_at"),
  email_error: text("email_error"), // Store any email sending errors

  // Upload/Creation Tracking
  uploaded_by: integer("uploaded_by")
    .notNull()
    .references(() => users.id),
  source_filename: text("source_filename"), // Original CSV filename if uploaded

  ...timestampFields,
});
