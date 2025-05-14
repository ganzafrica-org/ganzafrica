"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsletter_subscribers = exports.contacts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
// Contacts Table for contact form submissions
exports.contacts = (0, pg_core_1.pgTable)("contacts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull(),
    phone: (0, pg_core_1.varchar)("phone", { length: 50 }),
    message: (0, pg_core_1.text)("message").notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).notNull().default("pending"),
    is_resolved: (0, pg_core_1.boolean)("is_resolved").notNull().default(false),
    responded_at: (0, pg_core_1.timestamp)("responded_at", { mode: "date" }),
    location: (0, pg_core_1.varchar)("location", { length: 100 }).default("global"),
    ...common_1.timestampFields,
});
// Newsletter Subscribers Table
exports.newsletter_subscribers = (0, pg_core_1.pgTable)("newsletter_subscribers", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    is_active: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    subscribed_at: (0, pg_core_1.timestamp)("subscribed_at", { mode: "date" }).defaultNow().notNull(),
    unsubscribed_at: (0, pg_core_1.timestamp)("unsubscribed_at", { mode: "date" }),
    ...common_1.timestampFields,
});
// Default export for schema
exports.default = { contacts: exports.contacts, newsletter_subscribers: exports.newsletter_subscribers };
