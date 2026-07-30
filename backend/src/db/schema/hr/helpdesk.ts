import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import {
  ticketCategoryEnum,
  ticketPriorityEnum,
  ticketSourceEnum,
  ticketStatusEnum,
} from "./hr.enums";
import { employees } from "./employees";
import { hr_assets } from "./assets";

export const hr_helpdesk_tickets = pgTable("hr_helpdesk_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  submitted_by_employee_id: uuid("submitted_by_employee_id").references(() => employees.id, {
    onDelete: "cascade",
  }),
  assigned_to_employee_id: uuid("assigned_to_employee_id").references(() => employees.id, {
    onDelete: "set null",
  }),
  category: ticketCategoryEnum("category").notNull().default("OTHER"),
  status: ticketStatusEnum("status").notNull().default("OPEN"),
  priority: ticketPriorityEnum("priority").notNull().default("MEDIUM"),
  // MOD-04 "report issue" creates a ticket with source=asset_issue + the offending asset linked.
  source: ticketSourceEnum("source").notNull().default("manual"),
  asset_id: uuid("asset_id").references(() => hr_assets.id, { onDelete: "set null" }),
  answer: text("answer"),
  answered_at: timestamp("answered_at", { withTimezone: true }),
  resolved_at: timestamp("resolved_at", { withTimezone: true }),
  closed_at: timestamp("closed_at", { withTimezone: true }),
  ...timestampFields,
});

/** Threaded comments on a ticket (MOD-08). Author is any participant: requester or triage staff. */
export const hr_helpdesk_comments = pgTable("hr_helpdesk_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticket_id: uuid("ticket_id")
    .notNull()
    .references(() => hr_helpdesk_tickets.id, { onDelete: "cascade" }),
  author_employee_id: uuid("author_employee_id").references(() => employees.id, {
    onDelete: "set null",
  }),
  body: text("body").notNull(),
  ...timestampFields,
});

export type HelpdeskTicket = typeof hr_helpdesk_tickets.$inferSelect;
export type NewHelpdeskTicket = typeof hr_helpdesk_tickets.$inferInsert;
export type HelpdeskComment = typeof hr_helpdesk_comments.$inferSelect;
export type NewHelpdeskComment = typeof hr_helpdesk_comments.$inferInsert;
