import {
  integer,
  pgTable,
  text,
  serial,
  varchar,
  index,
  uniqueIndex,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { timestampFields } from "./common";
import { users } from "./users";
import { taskTeamRoleEnum, taskTeamStatusEnum, taskProjectStatusEnum } from "./enums";

// Task Teams Table - Groups of users working together
export const task_teams = pgTable(
  "task_teams",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    avatar_url: varchar("avatar_url", { length: 500 }),
    color: varchar("color", { length: 7 }), // Hex color for UI
    status: taskTeamStatusEnum("status").notNull().default("active"),
    created_by: integer("created_by")
      .notNull()
      .references(() => users.id),
    settings: text("settings").$type<{
      notifications?: boolean;
      default_view?: string;
      [key: string]: any;
    }>(),
    ...timestampFields,
  },
  (table) => {
    return {
      createdByIdx: index("task_teams_created_by_idx").on(table.created_by),
      statusIdx: index("task_teams_status_idx").on(table.status),
      nameIdx: index("task_teams_name_idx").on(table.name),
    };
  }
);

// Task Team Members Table - Users belonging to task teams
export const task_team_members = pgTable(
  "task_team_members",
  {
    id: serial("id").primaryKey(),
    team_id: integer("team_id")
      .notNull()
      .references(() => task_teams.id, { onDelete: "cascade" }),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // References users table
    name: varchar("name", { length: 200 }), // Cached name from user
    role: taskTeamRoleEnum("role").notNull().default("member"),
    position: varchar("position", { length: 500 }), // User role name
    is_active: boolean("is_active").notNull().default(true),
    joined_at: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
    ...timestampFields,
  },
  (table) => {
    return {
      teamIdx: index("task_team_members_team_id_idx").on(table.team_id),
      userIdx: index("task_team_members_user_id_idx").on(table.user_id),
      roleIdx: index("task_team_members_role_idx").on(table.role),
      uniqueMembership: uniqueIndex("unique_team_user").on(
        table.team_id,
        table.user_id
      ),
    };
  }
);

// Task Team Projects Table - Projects associated with teams
export const task_team_projects = pgTable(
  "task_team_projects",
  {
    id: serial("id").primaryKey(),
    team_id: integer("team_id")
      .notNull()
      .references(() => task_teams.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    status: taskProjectStatusEnum("status").notNull().default("planning"),
    start_date: timestamp("start_date", { withTimezone: true }),
    end_date: timestamp("end_date", { withTimezone: true }),
    color: varchar("color", { length: 7 }), // Hex color for UI
    created_by: integer("created_by")
      .notNull()
      .references(() => users.id),
    settings: text("settings").$type<{
      [key: string]: any;
    }>(),
    ...timestampFields,
  },
  (table) => {
    return {
      teamIdx: index("task_team_projects_team_id_idx").on(table.team_id),
      statusIdx: index("task_team_projects_status_idx").on(table.status),
      createdByIdx: index("task_team_projects_created_by_idx").on(table.created_by),
    };
  }
);

// Task Project Members Table - Users assigned to specific projects
export const task_project_members = pgTable(
  "task_project_members",
  {
    id: serial("id").primaryKey(),
    project_id: integer("project_id")
      .notNull()
      .references(() => task_team_projects.id, { onDelete: "cascade" }),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // References users table
    name: varchar("name", { length: 200 }), // Cached name from user
    role: taskTeamRoleEnum("role").notNull().default("member"),
    position: varchar("position", { length: 500 }), // User role name
    is_active: boolean("is_active").notNull().default(true),
    joined_at: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
    ...timestampFields,
  },
  (table) => {
    return {
      projectIdx: index("task_project_members_project_id_idx").on(table.project_id),
      userIdx: index("task_project_members_user_id_idx").on(table.user_id),
      uniqueMembership: uniqueIndex("unique_project_user").on(
        table.project_id,
        table.user_id
      ),
    };
  }
);

// Default export
export default {
  task_teams,
  task_team_members,
  task_team_projects,
  task_project_members,
};

