import {
  bigint,
  pgTable,
  text,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { timestampFields } from "./common";
import { users } from "./users";

export const roles = pgTable("roles", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ...timestampFields,
});

export const permissions = pgTable("permissions", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  resource: text("resource").notNull(),
  action: text("action").notNull(),
  ...timestampFields,
});

export const role_permissions = pgTable("role_permissions", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  role_id: bigint("role_id", { mode: "number" })
    .notNull()
    .references(() => roles.id),
  permission_id: bigint("permission_id", { mode: "number" })
    .notNull()
    .references(() => permissions.id),
});

export const user_roles = pgTable("user_roles", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  user_id: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id),
  role_id: bigint("role_id", { mode: "number" })
    .notNull()
    .references(() => roles.id),
  granted_by: bigint("granted_by", { mode: "number" })
    .notNull()
    .references(() => users.id),
  granted_at: timestamp("granted_at").notNull(),
  expires_at: timestamp("expires_at"),
});
