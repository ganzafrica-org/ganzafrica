import {
  integer,
  pgTable,
  text,
  serial,
  varchar,
  index,
  boolean,
  timestamp,
  jsonb,
  decimal,
} from "drizzle-orm/pg-core";
import { timestampFields } from "./common";
import { users } from "./users";
import { task_teams } from "./task-teams";
import { task_team_projects } from "./task-teams";
import { tasks } from "./tasks";

// Report Categories Table
export const report_categories = pgTable("report_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }), // Hex color for UI
  icon: varchar("icon", { length: 50 }), // Icon identifier
  ...timestampFields,
});

// Project Deliverables Table - Final products/documents for each project
export const project_deliverables = pgTable(
  "project_deliverables",
  {
    id: serial("id").primaryKey(),
    project_id: integer("project_id")
      .notNull()
      .references(() => task_team_projects.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    file_type: varchar("file_type", { length: 50 }).notNull(), // pdf, docx, xlsx, etc.
    file_size: integer("file_size"), // Size in bytes
    file_path: varchar("file_path", { length: 1000 }).notNull(), // Storage path
    file_url: varchar("file_url", { length: 1000 }), // Public URL if available
    version: varchar("version", { length: 20 }).default("1.0"),
    is_final: boolean("is_final").notNull().default(false), // Mark as final deliverable
    uploaded_by: integer("uploaded_by")
      .notNull()
      .references(() => users.id),
    metadata: jsonb("metadata").$type<{
      original_filename?: string;
      mime_type?: string;
      checksum?: string;
      tags?: string[];
      [key: string]: any;
    }>(),
    ...timestampFields,
  },
  (table) => {
    return {
      projectIdx: index("project_deliverables_project_id_idx").on(table.project_id),
      uploadedByIdx: index("project_deliverables_uploaded_by_idx").on(table.uploaded_by),
      fileTypeIdx: index("project_deliverables_file_type_idx").on(table.file_type),
      isFinalIdx: index("project_deliverables_is_final_idx").on(table.is_final),
    };
  },
);

// Report Files Table - General file storage for reports and documents
export const report_files = pgTable(
  "report_files",
  {
    id: serial("id").primaryKey(),
    team_id: integer("team_id").references(() => task_teams.id, { onDelete: "cascade" }),
    project_id: integer("project_id").references(() => task_team_projects.id, {
      onDelete: "cascade",
    }),
    task_id: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }),
    filename: varchar("filename", { length: 500 }).notNull(),
    original_filename: varchar("original_filename", { length: 500 }),
    file_type: varchar("file_type", { length: 50 }).notNull(),
    file_size: integer("file_size").notNull(), // Size in bytes
    file_path: varchar("file_path", { length: 1000 }).notNull(),
    file_url: varchar("file_url", { length: 1000 }),
    mime_type: varchar("mime_type", { length: 100 }),
    uploaded_by: integer("uploaded_by")
      .notNull()
      .references(() => users.id),
    category_id: integer("category_id").references(() => report_categories.id),
    is_public: boolean("is_public").notNull().default(false),
    metadata: jsonb("metadata").$type<{
      description?: string;
      tags?: string[];
      version?: string;
      checksum?: string;
      [key: string]: any;
    }>(),
    ...timestampFields,
  },
  (table) => {
    return {
      teamIdx: index("report_files_team_id_idx").on(table.team_id),
      projectIdx: index("report_files_project_id_idx").on(table.project_id),
      taskIdx: index("report_files_task_id_idx").on(table.task_id),
      uploadedByIdx: index("report_files_uploaded_by_idx").on(table.uploaded_by),
      categoryIdx: index("report_files_category_id_idx").on(table.category_id),
      fileTypeIdx: index("report_files_file_type_idx").on(table.file_type),
    };
  },
);

// Report Analytics Table - Track report generation and usage
export const report_analytics = pgTable(
  "report_analytics",
  {
    id: serial("id").primaryKey(),
    report_type: varchar("report_type", { length: 100 }).notNull(), // 'team', 'project', 'task', 'file'
    entity_id: integer("entity_id").notNull(), // ID of team/project/task
    entity_type: varchar("entity_type", { length: 50 }).notNull(), // 'team', 'project', 'task'
    generated_by: integer("generated_by")
      .notNull()
      .references(() => users.id),
    date_range_start: timestamp("date_range_start", { withTimezone: true }),
    date_range_end: timestamp("date_range_end", { withTimezone: true }),
    filters_applied: jsonb("filters_applied").$type<{
      date_range?: { start: string; end: string };
      team_ids?: number[];
      project_ids?: number[];
      file_types?: string[];
      [key: string]: any;
    }>(),
    generated_at: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
    ...timestampFields,
  },
  (table) => {
    return {
      reportTypeIdx: index("report_analytics_report_type_idx").on(table.report_type),
      entityIdx: index("report_analytics_entity_id_idx").on(table.entity_id),
      generatedByIdx: index("report_analytics_generated_by_idx").on(table.generated_by),
      generatedAtIdx: index("report_analytics_generated_at_idx").on(table.generated_at),
    };
  },
);

// Report Templates Table - Predefined report templates
export const report_templates = pgTable(
  "report_templates",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    template_type: varchar("template_type", { length: 50 }).notNull(), // 'team', 'project', 'task', 'file'
    config: jsonb("config").$type<{
      include_files?: boolean;
      include_tasks?: boolean;
      include_comments?: boolean;
      date_range?: string;
      group_by?: string;
      [key: string]: any;
    }>(),
    created_by: integer("created_by")
      .notNull()
      .references(() => users.id),
    is_public: boolean("is_public").notNull().default(false),
    ...timestampFields,
  },
  (table) => {
    return {
      templateTypeIdx: index("report_templates_template_type_idx").on(table.template_type),
      createdByIdx: index("report_templates_created_by_idx").on(table.created_by),
    };
  },
);

// Default export
export default {
  report_categories,
  project_deliverables,
  report_files,
  report_analytics,
  report_templates,
};
