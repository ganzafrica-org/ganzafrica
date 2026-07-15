import { pgTable, serial, char, integer, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const auth_handoff_codes = pgTable("auth_handoff_codes", {
  id: serial("id").primaryKey(),
  code_hash: char("code_hash", { length: 64 }).notNull().unique(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  target_app: text("target_app").notNull(),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  used_at: timestamp("used_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AuthHandoffCode = typeof auth_handoff_codes.$inferSelect;
