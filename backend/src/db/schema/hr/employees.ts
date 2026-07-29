import { pgTable, uuid, integer, text, date, check, type AnyPgColumn } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { timestampFields } from "../common";
import { users } from "../users";

/**
 * Canonical employee profile, keyed to the single `users` identity. Replaces hr_users as the
 * "who is an employee" record (hr_users auth is retired in FND-07). manager_id gives the org
 * hierarchy (backfilled from contract free-text in MOD-02).
 */
export const employees = pgTable(
  "employees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: integer("user_id")
      .notNull()
      .unique()
      .references(() => users.id),

    employee_number: text("employee_number").unique(),
    work_email: text("work_email").unique(),
    personal_email: text("personal_email"),
    first_name: text("first_name").notNull(),
    last_name: text("last_name").notNull(),
    phone: text("phone"),
    picture: text("picture"),
    citizenship: text("citizenship"),
    home_country: text("home_country"),
    home_city: text("home_city"),
    department: text("department"),
    job_title: text("job_title"),

    manager_id: uuid("manager_id").references((): AnyPgColumn => employees.id, {
      onDelete: "set null",
    }),

    // 'fellow' | 'analyst' | 'staff' | 'contractor' | 'intern'
    employment_type: text("employment_type").notNull().default("staff"),
    // 'onboarding' | 'active' | 'on_leave' | 'offboarding' | 'exited'
    status: text("status").notNull().default("active"),

    hired_at: date("hired_at"),
    exited_at: date("exited_at"),
    ...timestampFields,
  },
  (t) => ({
    employmentTypeCheck: check(
      "employees_employment_type_check",
      sql`${t.employment_type} IN ('fellow','analyst','staff','contractor','intern')`,
    ),
    statusCheck: check(
      "employees_status_check",
      sql`${t.status} IN ('onboarding','active','on_leave','offboarding','exited')`,
    ),
  }),
);

// Named to avoid clashing with the legacy hr_users `Employee` type (retired in FND-07).
export type EmployeeProfile = typeof employees.$inferSelect;
export type NewEmployeeProfile = typeof employees.$inferInsert;
