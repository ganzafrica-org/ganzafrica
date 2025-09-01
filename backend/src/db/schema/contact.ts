import {
    pgTable,
    text,
    serial,
    varchar,
    boolean,
    timestamp,
  } from "drizzle-orm/pg-core";
  import { timestampFields } from "./common";
  
  // Contacts Table for contact form submissions
  export const contacts = pgTable("contacts", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    message: text("message").notNull(),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    is_resolved: boolean("is_resolved").notNull().default(false),
    responded_at: timestamp("responded_at", { mode: "date" }),
    location: varchar("location", { length: 100 }).default("global"),
    ...timestampFields,
  });
  
  // Newsletter Subscribers Table
  export const newsletter_subscribers = pgTable("newsletter_subscribers", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    is_active: boolean("is_active").notNull().default(true),
    subscribed_at: timestamp("subscribed_at", { mode: "date" }).defaultNow().notNull(),
    unsubscribed_at: timestamp("unsubscribed_at", { mode: "date" }),
    ...timestampFields,
  });
  
  // Default export for schema
  export default { contacts, newsletter_subscribers };