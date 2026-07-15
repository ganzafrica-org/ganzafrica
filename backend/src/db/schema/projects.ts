import {
  integer,
  pgTable,
  text,
  timestamp,
  jsonb,
  serial,
  varchar,
  index,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";
import { timestampFields } from "./common";
import { teams } from "./teams"; // Import teams instead of users
import { partners } from "./partners";
import { projectStatusEnum, projectMemberRoleEnum } from "./enums";

export const project_categories = pgTable("project_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  ...timestampFields,
});

// Projects Table
export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("full_description"),
    status: projectStatusEnum("status").notNull().default("planned"),
    category_id: integer("category_id")
      .references(() => project_categories.id)
      .notNull(),
    partner_id: integer("partner_id").references(() => partners.id),
    goals: jsonb("goals").$type<{
      items: Array<{
        id: string;
        title: string;
        description: string;
        completed?: boolean;
        order?: number;
      }>;
    }>(),

    outcomes: jsonb("outcomes").$type<{
      items: Array<{
        id: string;
        title: string;
        description: string;
        status?: string;
        order?: number;
      }>;
    }>(),

    location: varchar("location", { length: 255 }),
    media: jsonb("media").$type<{
      items: Array<{
        id: string;
        type: "image" | "video";
        url: string;
        cover: boolean;
        tag?: "feature" | "description" | "others";
        title?: string;
        description?: string;
        size?: number;
        duration?: number;
        thumbnailUrl?: string;
        order?: number;
      }>;
    }>(),

    other_information: jsonb("other_information").$type<{
      [key: string]: any;
    }>(),
    start_date: timestamp("start_date", { withTimezone: true }).notNull(),
    end_date: timestamp("end_date", { withTimezone: true }),
    is_published: boolean("is_published").notNull().default(false),

    ...timestampFields,
  },
  (table) => {
    return {
      categoryIdx: index("projects_category_id_idx").on(table.category_id),
      partnerIdx: index("projects_partner_id_idx").on(table.partner_id),
      statusIdx: index("projects_status_idx").on(table.status),
    };
  },
);

// Project Team Members Table (now references teams instead of users)
export const project_members = pgTable(
  "project_members",
  {
    id: serial("id").primaryKey(),
    project_id: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    team_id: integer("team_id")
      .notNull()
      .references(() => teams.id), // Reference teams instead of users
    role: projectMemberRoleEnum("role").notNull().default("member"),
    start_date: timestamp("start_date", { withTimezone: true }).notNull(),
    end_date: timestamp("end_date", { withTimezone: true }),
    is_active: boolean("is_active").notNull().default(true),
    ...timestampFields,
  },
  (table) => {
    return {
      projectIdx: index("project_members_project_id_idx").on(table.project_id),
      teamIdx: index("project_members_team_id_idx").on(table.team_id), // Team index instead of user index
      uniqueMembership: uniqueIndex("unique_project_team").on(table.project_id, table.team_id), // Unique constraint for project-team combination
    };
  },
);

// Project Updates Table (also update to reference teams)
export const project_updates = pgTable(
  "project_updates",
  {
    id: serial("id").primaryKey(),
    project_id: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    author_id: integer("author_id")
      .notNull()
      .references(() => teams.id), // Reference teams instead of users for authors
    title: varchar("title", { length: 200 }),
    content: jsonb("content").notNull(),
    media: jsonb("media").$type<{
      items: Array<{
        id: string;
        type: "image" | "video";
        url: string;
        cover: boolean;
        tag?: "feature" | "description" | "others";
        title?: string;
        description?: string;
      }>;
    }>(),
    update_type: varchar("update_type", { length: 50 }).default("general"),
    ...timestampFields,
  },
  (table) => {
    return {
      projectIdx: index("project_updates_project_id_idx").on(table.project_id),
      authorIdx: index("project_updates_author_id_idx").on(table.author_id),
    };
  },
);

// Project Documents Table
export const project_documents = pgTable(
  "project_documents",
  {
    id: serial("id").primaryKey(),
    project_id: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    file_url: varchar("file_url", { length: 1000 }).notNull(), // Long URL field
    file_size: integer("file_size"), // Size in bytes
    ...timestampFields,
  },
  (table) => {
    return {
      projectIdx: index("project_documents_project_id_idx").on(table.project_id),
    };
  },
);

// Project Partners Junction Table - For multiple partners per project
export const project_partners = pgTable(
  "project_partners",
  {
    id: serial("id").primaryKey(),
    project_id: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    partner_id: integer("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    ...timestampFields,
  },
  (table) => {
    return {
      projectIdx: index("project_partners_project_id_idx").on(table.project_id),
      partnerIdx: index("project_partners_partner_id_idx").on(table.partner_id),
      // Ensure a partner can only be added once to a project
      uniqueProjectPartner: uniqueIndex("unique_project_partner").on(
        table.project_id,
        table.partner_id,
      ),
    };
  },
);
