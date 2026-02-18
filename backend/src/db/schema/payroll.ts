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

  // User reference - optional, as some employees may not yet be in the system
  user_id: integer("user_id").references(() => users.id),

  // Period and Payment Info
  payroll_period: text("payroll_period").notNull(),
  date_of_payment: date("date_of_payment").notNull(),

  // Employee Details (common across formats)
  name: text("name").notNull(),
  email: text("email").notNull(),
  staff_fellow_number: text("staff_fellow_number"), // Format1: "Employee No." / Format2: "Consultant ID"
  employee_id: text("employee_id"),                 // Format1: "Employees ID" / Format3: "ID Number" / Format4: "Employee Id"
  program: text("program"),                          // Format1: "Program" / Format2: used as name

  // Format type and currency
  payroll_type: text("payroll_type").default("rwf"), // 'rwf' | 'rwf_usd' | 'wop_usd' | 'xof' | 'rwf_wop'
  currency: text("currency").default("RWF"),

  // Format 1: Rwanda RWF/USD staff
  basic_salary: decimal("basic_salary", { precision: 15, scale: 2 }),
  gross_salary: decimal("gross_salary", { precision: 15, scale: 2 }),
  // Employer contributions
  csr_employer: decimal("csr_employer", { precision: 15, scale: 2 }),
  occupational_hazards: decimal("occupational_hazards", { precision: 15, scale: 2 }), // "Employer_ Occupational Hazards contribution (2%)"
  maternity_employer: decimal("maternity_employer", { precision: 15, scale: 2 }),
  // Employee deductions
  csr_employee: decimal("csr_employee", { precision: 15, scale: 2 }),
  maternity_employee: decimal("maternity_employee", { precision: 15, scale: 2 }),
  tpr: decimal("tpr", { precision: 15, scale: 2 }),
  net_salary_before_cbhi: decimal("net_salary_before_cbhi", { precision: 15, scale: 2 }),
  cbhi: decimal("cbhi", { precision: 15, scale: 2 }),
  net_salary: decimal("net_salary", { precision: 15, scale: 2 }).notNull(),
  // USD employees (Format 1 rwf_usd)
  bnr_exchange_rate_date: date("bnr_exchange_rate_date"),
  exchange_rate_used: decimal("exchange_rate_used", { precision: 10, scale: 4 }),
  net_salary_usd: decimal("net_salary_usd", { precision: 15, scale: 2 }),

  // Format 2: International WOP/USD
  gross_usd: decimal("gross_usd", { precision: 15, scale: 2 }),   // "Gross fees" in USD
  wop_usd: decimal("wop_usd", { precision: 15, scale: 2 }),        // "WOP USD"
  date_rate: date("date_rate"),                                      // "Date rate"
  wop_rwf: decimal("wop_rwf", { precision: 15, scale: 2 }),        // "WOP RWF"
  gross_rwf: decimal("gross_rwf", { precision: 15, scale: 2 }),    // "Gross" (RWF equivalent)

  // Format 3: Burkina Faso XOF allowances
  housing_allowance: decimal("housing_allowance", { precision: 15, scale: 2 }),
  function_allowance: decimal("function_allowance", { precision: 15, scale: 2 }),
  transport_allowance: decimal("transport_allowance", { precision: 15, scale: 2 }),

  // Payslip File Storage
  payslip_file_url: text("payslip_file_url"),
  payslip_file_key: text("payslip_file_key"),

  // Email Tracking
  email_sent: boolean("email_sent").notNull().default(false),
  email_sent_at: timestamp("email_sent_at"),
  email_error: text("email_error"),

  // Upload/Creation Tracking
  uploaded_by: integer("uploaded_by").notNull().references(() => users.id),
  source_filename: text("source_filename"),

  ...timestampFields,
});
