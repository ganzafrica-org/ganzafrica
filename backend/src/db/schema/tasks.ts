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
} from "drizzle-orm/pg-core";
import { timestampFields } from "./common";
import { users } from "./users";
import { task_team_projects } from "./task-teams";

// Task Priority and Status Enums
import { pgEnum } from "drizzle-orm/pg-core";

export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high"]);
export const taskStatusEnum = pgEnum("task_status", [
  "overdue",
  "todo",
  "inprogress",
  "review",
  "done",
]);

// Tasks Table
export const tasks = pgTable(
  "tasks",
  {
    id: serial("id").primaryKey(),
    project_id: integer("project_id").references(() => task_team_projects.id, {
      onDelete: "cascade",
    }),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"), // Activities to do
    deliverables: text("deliverables"), // Expected deliverables
    status: taskStatusEnum("status").notNull().default("todo"),
    priority: taskPriorityEnum("priority").notNull().default("medium"),
    due_date: timestamp("due_date", { withTimezone: true }),
    labels: jsonb("labels").$type<Array<{ id: string; name: string; color: string }>>().default([]),
    attachments: jsonb("attachments")
      .$type<
        Array<{
          id: string;
          filename: string;
          url: string;
          uploaded_by: number;
          uploaded_at: string;
        }>
      >()
      .default([]),
    created_by: integer("created_by")
      .notNull()
      .references(() => users.id),
    ...timestampFields,
  },
  (table) => {
    return {
      projectIdx: index("tasks_project_id_idx").on(table.project_id),
      statusIdx: index("tasks_status_idx").on(table.status),
      priorityIdx: index("tasks_priority_idx").on(table.priority),
      createdByIdx: index("tasks_created_by_idx").on(table.created_by),
      dueDateIdx: index("tasks_due_date_idx").on(table.due_date),
    };
  },
);

// Task Assignees Table - Users assigned to tasks
export const task_assignees = pgTable(
  "task_assignees",
  {
    id: serial("id").primaryKey(),
    task_id: integer("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    assigned_at: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
    ...timestampFields,
  },
  (table) => {
    return {
      taskIdx: index("task_assignees_task_id_idx").on(table.task_id),
      userIdx: index("task_assignees_user_id_idx").on(table.user_id),
    };
  },
);

// Task Comments Table
export const task_comments = pgTable(
  "task_comments",
  {
    id: serial("id").primaryKey(),
    task_id: integer("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => {
    return {
      taskIdx: index("task_comments_task_id_idx").on(table.task_id),
      userIdx: index("task_comments_user_id_idx").on(table.user_id),
    };
  },
);

// Default export
export default {
  tasks,
  task_assignees,
  task_comments,
  taskPriorityEnum,
  taskStatusEnum,
};
