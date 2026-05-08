import {
    pgTable,
    text,
    timestamp,
    boolean,
    integer,
    uuid,
    numeric,
  } from "drizzle-orm/pg-core";
  import { relations } from "drizzle-orm";
  import { timestampFields } from "./common";
  import {
    assetIssueEnum,
    hrRoleEnum,
    leaveStatusEnum,
    leaveTypeEnum,
    policyStatusEnum,
    ticketStatusEnum,
    userStatusEnum,
  } from "./enums";
  
  export const hr_users = pgTable("hr_users", {
    id: uuid("id").primaryKey().defaultRandom(),
    first_name: text("first_name").notNull(),
    last_name: text("last_name").notNull(),
    email: text("email").notNull().unique(),
    password_hash: text("password_hash").notNull(),
    role: hrRoleEnum("role").notNull(),
    status: userStatusEnum("status").notNull().default("ACTIVE"),
    department: text("department"),
    position: text("position"),
    location: text("location"),
    join_date: timestamp("join_date", { withTimezone: true }).notNull().defaultNow(),
    avatar_initials: text("avatar_initials").notNull(),
    refresh_token_hash: text("refresh_token_hash"),
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
  
  export const hr_assets = pgTable("hr_assets", {
    id: uuid("id").primaryKey().defaultRandom(),
    device_name: text("device_name").notNull(),
    serial_number: text("serial_number").notNull().unique(),
    generation: text("generation").notNull(),
    core: text("core").notNull(),
    ram: text("ram").notNull(),
    hard_disk: text("hard_disk").notNull(),
    purchase_price: numeric("purchase_price", { precision: 12, scale: 2 }),
    assigned_to_id: uuid("assigned_to_id").references(() => hr_users.id, {
      onDelete: "set null",
    }),
    assigned_at: timestamp("assigned_at", { withTimezone: true }),
    has_issue: assetIssueEnum("has_issue").notNull().default("NO"),
    is_flagged: boolean("is_flagged").notNull().default(false),
    ...timestampFields,
  });
  
  export const hr_leaves = pgTable("hr_leaves", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => hr_users.id, { onDelete: "cascade" }),
    type: leaveTypeEnum("type").notNull(),
    start_date: timestamp("start_date", { withTimezone: true }).notNull(),
    end_date: timestamp("end_date", { withTimezone: true }).notNull(),
    reason: text("reason").notNull(),
    status: leaveStatusEnum("status").notNull().default("PENDING"),
    reviewed_by_id: uuid("reviewed_by_id").references(() => hr_users.id, {
      onDelete: "set null",
    }),
    reviewed_at: timestamp("reviewed_at", { withTimezone: true }),
    ...timestampFields,
  });
  
  export const hr_policies = pgTable("hr_policies", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    version: text("version").notNull(),
    file_path: text("file_path").notNull(),
    file_size: text("file_size").notNull(),
    downloads: integer("downloads").notNull().default(0),
    status: policyStatusEnum("status").notNull().default("PUBLISHED"),
    created_by_id: uuid("created_by_id")
      .notNull()
      .references(() => hr_users.id, { onDelete: "restrict" }),
    ...timestampFields,
  });
  
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
    answer: text("answer"),
    answered_at: timestamp("answered_at", { withTimezone: true }),
    ...timestampFields,
  });
  
  export const hrUsersRelations = relations(hr_users, ({ many }) => ({
    createdOtps: many(hr_otps, { relationName: "created_otps" }),
  }));
  
  