import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { ticketPriorityEnum, ticketStatusEnum } from "./hr.enums";
import { hr_users } from "./employee";
import { employees } from "./employees";

export const hr_helpdesk_tickets = pgTable("hr_helpdesk_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  // Legacy hr_users FK, nullable pending the FND-07 drop. MOD-01 writes the employee_id columns.
  submitted_by_id: uuid("submitted_by_id").references(() => hr_users.id, { onDelete: "cascade" }),
  submitted_by_employee_id: uuid("submitted_by_employee_id").references(() => employees.id, {
    onDelete: "cascade",
  }),
  assigned_to_id: uuid("assigned_to_id").references(() => hr_users.id, {
    onDelete: "set null",
  }),
  assigned_to_employee_id: uuid("assigned_to_employee_id").references(() => employees.id, {
    onDelete: "set null",
  }),
  status: ticketStatusEnum("status").notNull().default("OPEN"),
  priority: ticketPriorityEnum("priority").notNull().default("MEDIUM"),
  answer: text("answer"),
  answered_at: timestamp("answered_at", { withTimezone: true }),
  resolved_at: timestamp("resolved_at", { withTimezone: true }),
  ...timestampFields,
});

export type HelpdeskTicket = typeof hr_helpdesk_tickets.$inferSelect;
export type NewHelpdeskTicket = typeof hr_helpdesk_tickets.$inferInsert;
