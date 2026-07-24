/**
 * Lifecycle process engine (LCM-01 onboarding, LCM-02 offboarding). One set of tables serves both;
 * the `type` column does the splitting, so offboarding extends rather than duplicates.
 *
 * Tasks are *snapshotted* onto an instance at creation: editing a template must never rewrite the
 * checklist of someone already partway through it.
 */
import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { users } from "../users";
import { employees } from "./employees";

export const process_templates = pgTable("process_templates", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'onboarding' | 'offboarding'
  name: text("name").notNull(),
  // null = applies to any employment type; otherwise the auto-pick matches against this list.
  employment_types: jsonb("employment_types").$type<string[]>(),
  is_active: boolean("is_active").notNull().default(true),
  created_by: integer("created_by")
    .notNull()
    .references(() => users.id),
  ...timestampFields,
});

export const process_template_tasks = pgTable("process_template_tasks", {
  id: serial("id").primaryKey(),
  template_id: integer("template_id")
    .notNull()
    .references(() => process_templates.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  sort_order: integer("sort_order").notNull(),
  default_assignee: text("default_assignee").notNull(), // hr|it|manager|finance|employee
  visibility: text("visibility").notNull().default("all"), // 'all' | 'staff_only'
  // Offsets are relative to the instance anchor: start date for onboarding, last working day for
  // offboarding (where negative means "N days before the last day").
  due_offset_days: integer("due_offset_days"),
  is_blocking: boolean("is_blocking").notNull().default(false),
  // Drives a widget on the task card plus a completion side-effect (see process.service.ts).
  kind: text("kind").notNull().default("checklist"),
  ...timestampFields,
});

export const process_instances = pgTable("process_instances", {
  id: serial("id").primaryKey(),
  template_id: integer("template_id").references(() => process_templates.id),
  type: text("type").notNull(),
  employee_id: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("in_progress"), // in_progress|completed|cancelled
  started_at: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  due_date: date("due_date"),
  completed_at: timestamp("completed_at", { withTimezone: true }),
  // Offboarding-only (LCM-02); nullable for onboarding rows.
  offboarding_reason: text("offboarding_reason"),
  last_working_day: date("last_working_day"),
  grant_alumni: boolean("grant_alumni").notNull().default(false),
  ...timestampFields,
});

export const process_tasks = pgTable("process_tasks", {
  id: serial("id").primaryKey(),
  instance_id: integer("instance_id")
    .notNull()
    .references(() => process_instances.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  sort_order: integer("sort_order").notNull(),
  // Resolved from the template's default_assignee at instantiation; reassignable afterwards.
  // Null means nobody held the required role — surfaced as `unresolved_assignees`.
  assignee_user_id: integer("assignee_user_id").references(() => users.id),
  visibility: text("visibility").notNull().default("all"),
  is_blocking: boolean("is_blocking").notNull().default(false),
  kind: text("kind").notNull().default("checklist"),
  status: text("status").notNull().default("pending"), // pending|done|skipped
  due_date: date("due_date"),
  completed_at: timestamp("completed_at", { withTimezone: true }),
  completed_by: integer("completed_by").references(() => users.id),
  notes: text("notes"),
  // Kind-specific payload: {contract_id, request_id} | {document_id} | {asset_id}
  link_ref: jsonb("link_ref").$type<Record<string, unknown>>(),
  ...timestampFields,
});

export type ProcessTemplate = typeof process_templates.$inferSelect;
export type ProcessTemplateTask = typeof process_template_tasks.$inferSelect;
export type ProcessInstance = typeof process_instances.$inferSelect;
export type ProcessTask = typeof process_tasks.$inferSelect;
