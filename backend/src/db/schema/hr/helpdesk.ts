import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { ticketPriorityEnum, ticketStatusEnum } from "./hr.enums";
import { hr_users } from "./employee";

export const hr_helpdesk_tickets = pgTable("hr_helpdesk_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  submitted_by_id: uuid("submitted_by_id")
    .notNull()
    .references(() => hr_users.id, { onDelete: "cascade" }),
  assigned_to_id: uuid("assigned_to_id").references(() => hr_users.id, {
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
