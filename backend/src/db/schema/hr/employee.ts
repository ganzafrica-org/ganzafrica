import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { hrRoleEnum, userStatusEnum } from "./hr.enums";
import { users } from "../users";

/** HR portal employee record (logical "employees" table). */
export const hr_users = pgTable("hr_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  platform_user_id: integer("platform_user_id")
    .unique()
    .references(() => users.id, { onDelete: "set null" }),

  // ── Personal Details (Step 1) ──────────────
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  personal_email: text("personal_email").notNull().unique(),
  work_email: text("work_email"),
  phone: text("phone"),
  picture: text("picture"),
  citizenship: text("citizenship"),
  home_country: text("home_country"),
  home_city: text("home_city"),

  // ── Auth & System ──────────────────────────
  password_hash: text("password_hash").notNull(),
  role: hrRoleEnum("role").notNull(),
  status: userStatusEnum("status").notNull().default("ACTIVE"),
  avatar_initials: text("avatar_initials").notNull(),
  refresh_token_hash: text("refresh_token_hash"),
  last_password_change: timestamp("last_password_change", { withTimezone: true })
    .notNull()
    .defaultNow(),
  requires_password_reset: boolean("requires_password_reset").notNull().default(false),
  profile_setup_completed: boolean("profile_setup_completed").notNull().default(true),

  ...timestampFields,
});

export const hr_otps = pgTable("hr_otps", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull(),
  email: text("email").notNull(),
  created_by_id: uuid("created_by_id")
    .notNull()
    .references(() => hr_users.id, { onDelete: "cascade" }),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Employee = typeof hr_users.$inferSelect;
export type NewEmployee = typeof hr_users.$inferInsert;
export type HrOtp = typeof hr_otps.$inferSelect;
export type NewHrOtp = typeof hr_otps.$inferInsert;
