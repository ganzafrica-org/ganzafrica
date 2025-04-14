import {
  bigint,
  pgTable,
  text,
  jsonb,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { timestampFields } from "./common";
import { users } from "./users";
import { subscriptionStatusEnum } from "./enums";

export const notifications = pgTable("notifications", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  user_id: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  content: jsonb("content").notNull(),
  read: boolean("read").notNull().default(false),
  ...timestampFields,
});

export const messages = pgTable("messages", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  sender_id: bigint("sender_id", { mode: "number" })
    .notNull()
    .references(() => users.id),
  recipient_id: bigint("recipient_id", { mode: "number" })
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  read: boolean("read").notNull().default(false),
  ...timestampFields,
});

export const newsletter_subscriptions = pgTable("newsletter_subscriptions", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  email: text("email").notNull(),
  status: subscriptionStatusEnum("status").notNull(),
  subscribed_at: timestamp("subscribed_at").notNull(),
  unsubscribed_at: timestamp("unsubscribed_at"),
});
