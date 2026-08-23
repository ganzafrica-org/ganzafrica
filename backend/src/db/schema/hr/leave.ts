import {
  date,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { leaveStatusEnum, leaveTypeEnum } from "./hr.enums";
import { employees } from "./employees";
import { users } from "../users";

export const hr_leaves = pgTable("hr_leaves", {
  id: uuid("id").primaryKey().defaultRandom(),
  employee_id: uuid("employee_id").references(() => employees.id, { onDelete: "cascade" }),
  type: leaveTypeEnum("type").notNull(),
  start_date: timestamp("start_date", { withTimezone: true }).notNull(),
  end_date: timestamp("end_date", { withTimezone: true }).notNull(),
  reason: text("reason").notNull(),
  status: leaveStatusEnum("status").notNull().default("PENDING"),
  reviewed_by_employee_id: uuid("reviewed_by_employee_id").references(() => employees.id, {
    onDelete: "set null",
  }),
  reviewed_at: timestamp("reviewed_at", { withTimezone: true }),
  // MOD-06: working days computed at request time (weekends + org holidays excluded), so a later
  // holiday edit never silently restates an approved request.
  days: numeric("days", { precision: 5, scale: 1 }),
  approver_note: text("approver_note"),
  ...timestampFields,
});

/**
 * Org-wide entitlement defaults (MOD-06). One row per (employment_type, leave type); balances are
 * instantiated from these, so changing a policy affects future grants only.
 */
export const hr_leave_policies = pgTable(
  "hr_leave_policies",
  {
    id: serial("id").primaryKey(),
    employment_type: text("employment_type").notNull(), // fellow|analyst|staff|contractor|intern
    type: leaveTypeEnum("type").notNull(),
    annual_days: numeric("annual_days", { precision: 5, scale: 1 }).notNull(),
    max_carry_over: numeric("max_carry_over", { precision: 5, scale: 1 }).notNull().default("0"),
    ...timestampFields,
  },
  (t) => ({ uniq: uniqueIndex("leave_policy_uniq").on(t.employment_type, t.type) }),
);

/**
 * Per-employee, per-year entitlement (MOD-06). `used_days` is denormalized from approved leave and
 * recomputed on every approve/cancel so reads stay a single row lookup.
 */
export const hr_leave_balances = pgTable(
  "hr_leave_balances",
  {
    id: serial("id").primaryKey(),
    employee_id: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),
    type: leaveTypeEnum("type").notNull(),
    entitled_days: numeric("entitled_days", { precision: 5, scale: 1 }).notNull(),
    carried_over_days: numeric("carried_over_days", { precision: 5, scale: 1 })
      .notNull()
      .default("0"),
    used_days: numeric("used_days", { precision: 5, scale: 1 }).notNull().default("0"),
    ...timestampFields,
  },
  (t) => ({ uniq: uniqueIndex("balance_uniq").on(t.employee_id, t.year, t.type) }),
);

/** Public/company holidays excluded from working-day counts (MOD-06). */
export const hr_org_holidays = pgTable(
  "hr_org_holidays",
  {
    id: serial("id").primaryKey(),
    date: date("date").notNull(),
    name: text("name").notNull(),
    ...timestampFields,
  },
  (t) => ({ uniq: uniqueIndex("org_holiday_date_uniq").on(t.date) }),
);

// Idempotent record of leave-flow emails: one row per (leave, email_type, recipient). Keyed by
// recipient too, not just (leave, type) like recruitment_emails — a submit notification can have
// several HR recipients when the requester has no manager, and each needs its own guard so a retry
// can't double-send to one of them while silently skipping ones that hadn't gone out yet. The
// unique index is the idempotency guard — insert-first, unique-violation => already sent, skip.
export const leave_emails = pgTable(
  "leave_emails",
  {
    id: serial("id").primaryKey(),
    leave_id: uuid("leave_id")
      .notNull()
      .references(() => hr_leaves.id, { onDelete: "cascade" }),
    email_type: text("email_type").notNull(), // 'submitted' | 'decided'
    recipient_user_id: integer("recipient_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sent_at: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex("leave_email_once").on(t.leave_id, t.email_type, t.recipient_user_id),
  }),
);

export type Leave = typeof hr_leaves.$inferSelect;
export type NewLeave = typeof hr_leaves.$inferInsert;
export type LeavePolicy = typeof hr_leave_policies.$inferSelect;
export type LeaveBalance = typeof hr_leave_balances.$inferSelect;
export type OrgHoliday = typeof hr_org_holidays.$inferSelect;
