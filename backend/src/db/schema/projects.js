"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.project_partners = exports.project_documents = exports.project_updates = exports.project_members = exports.projects = exports.project_categories = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
const teams_1 = require("./teams"); // Import teams instead of users
const partners_1 = require("./partners");
const enums_1 = require("./enums");
exports.project_categories = (0, pg_core_1.pgTable)("project_categories", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    ...common_1.timestampFields,
});
// Projects Table
exports.projects = (0, pg_core_1.pgTable)("projects", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.text)("full_description"),
    status: (0, enums_1.projectStatusEnum)("status").notNull().default("planned"),
    category_id: (0, pg_core_1.integer)("category_id")
        .references(() => exports.project_categories.id)
        .notNull(),
    partner_id: (0, pg_core_1.integer)("partner_id")
        .references(() => partners_1.partners.id),
    goals: (0, pg_core_1.jsonb)("goals").$type(),
    outcomes: (0, pg_core_1.jsonb)("outcomes").$type(),
    location: (0, pg_core_1.varchar)("location", { length: 255 }),
    media: (0, pg_core_1.jsonb)("media").$type(),
    other_information: (0, pg_core_1.jsonb)("other_information").$type(),
    start_date: (0, pg_core_1.timestamp)("start_date", { withTimezone: true }).notNull(),
    end_date: (0, pg_core_1.timestamp)("end_date", { withTimezone: true }),
    ...common_1.timestampFields,
}, (table) => {
    return {
        categoryIdx: (0, pg_core_1.index)("projects_category_id_idx").on(table.category_id),
        partnerIdx: (0, pg_core_1.index)("projects_partner_id_idx").on(table.partner_id),
        statusIdx: (0, pg_core_1.index)("projects_status_idx").on(table.status),
    };
});
// Project Team Members Table (now references teams instead of users)
exports.project_members = (0, pg_core_1.pgTable)("project_members", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    project_id: (0, pg_core_1.integer)("project_id")
        .notNull()
        .references(() => exports.projects.id, { onDelete: "cascade" }),
    team_id: (0, pg_core_1.integer)("team_id")
        .notNull()
        .references(() => teams_1.teams.id), // Reference teams instead of users
    role: (0, enums_1.projectMemberRoleEnum)("role").notNull().default("member"),
    start_date: (0, pg_core_1.timestamp)("start_date", { withTimezone: true }).notNull(),
    end_date: (0, pg_core_1.timestamp)("end_date", { withTimezone: true }),
    is_active: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    ...common_1.timestampFields,
}, (table) => {
    return {
        projectIdx: (0, pg_core_1.index)("project_members_project_id_idx").on(table.project_id),
        teamIdx: (0, pg_core_1.index)("project_members_team_id_idx").on(table.team_id), // Team index instead of user index
        uniqueMembership: (0, pg_core_1.uniqueIndex)("unique_project_team").on(table.project_id, table.team_id), // Unique constraint for project-team combination
    };
});
// Project Updates Table (also update to reference teams)
exports.project_updates = (0, pg_core_1.pgTable)("project_updates", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    project_id: (0, pg_core_1.integer)("project_id")
        .notNull()
        .references(() => exports.projects.id, { onDelete: "cascade" }),
    author_id: (0, pg_core_1.integer)("author_id")
        .notNull()
        .references(() => teams_1.teams.id), // Reference teams instead of users for authors
    title: (0, pg_core_1.varchar)("title", { length: 200 }),
    content: (0, pg_core_1.jsonb)("content").notNull(),
    media: (0, pg_core_1.jsonb)("media").$type(),
    update_type: (0, pg_core_1.varchar)("update_type", { length: 50 }).default("general"),
    ...common_1.timestampFields,
}, (table) => {
    return {
        projectIdx: (0, pg_core_1.index)("project_updates_project_id_idx").on(table.project_id),
        authorIdx: (0, pg_core_1.index)("project_updates_author_id_idx").on(table.author_id),
    };
});
// Project Documents Table
exports.project_documents = (0, pg_core_1.pgTable)("project_documents", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    project_id: (0, pg_core_1.integer)("project_id")
        .notNull()
        .references(() => exports.projects.id, { onDelete: "cascade" }),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    file_url: (0, pg_core_1.varchar)("file_url", { length: 1000 }).notNull(), // Long URL field
    file_size: (0, pg_core_1.integer)("file_size"), // Size in bytes
    ...common_1.timestampFields,
}, (table) => {
    return {
        projectIdx: (0, pg_core_1.index)("project_documents_project_id_idx").on(table.project_id),
    };
});
// Project Partners Junction Table - For multiple partners per project
exports.project_partners = (0, pg_core_1.pgTable)("project_partners", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    project_id: (0, pg_core_1.integer)("project_id")
        .notNull()
        .references(() => exports.projects.id, { onDelete: "cascade" }),
    partner_id: (0, pg_core_1.integer)("partner_id")
        .notNull()
        .references(() => partners_1.partners.id, { onDelete: "cascade" }),
    ...common_1.timestampFields,
}, (table) => {
    return {
        projectIdx: (0, pg_core_1.index)("project_partners_project_id_idx").on(table.project_id),
        partnerIdx: (0, pg_core_1.index)("project_partners_partner_id_idx").on(table.partner_id),
        // Ensure a partner can only be added once to a project
        uniqueProjectPartner: (0, pg_core_1.uniqueIndex)("unique_project_partner").on(table.project_id, table.partner_id),
    };
});
