import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { users } from "../users";
import { notificationPriorityEnum, notificationStatusEnum, notificationTypeEnum } from "./hr.enums";

export const hr_notifications = pgTable("hr_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipient_id: integer("recipient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  priority: notificationPriorityEnum("priority").notNull().default("NORMAL"),
  status: notificationStatusEnum("status").notNull().default("UNREAD"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  read_at: timestamp("read_at", { withTimezone: true }),
  ...timestampFields,
});

export const hr_notification_preferences = pgTable("hr_notification_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  email_enabled: boolean("email_enabled").notNull().default(false),
  contract_expiry: boolean("contract_expiry").notNull().default(true),
  leave_updates: boolean("leave_updates").notNull().default(true),
  ticket_updates: boolean("ticket_updates").notNull().default(true),
  asset_updates: boolean("asset_updates").notNull().default(true),
  policy_updates: boolean("policy_updates").notNull().default(true),
  ...timestampFields,
});

export type Notification = typeof hr_notifications.$inferSelect;
export type NewNotification = typeof hr_notifications.$inferInsert;
export type NotificationPreference = typeof hr_notification_preferences.$inferSelect;
export type NewNotificationPreference = typeof hr_notification_preferences.$inferInsert;
