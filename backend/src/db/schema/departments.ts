import {
  integer,
  pgTable,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { timestampFields } from "./common";
import { users } from "./users";

export const departments = pgTable("departments", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ...timestampFields,
});

export const employee_departments = pgTable("employee_departments", {
  id: integer("id").primaryKey(),
  employee_id: integer("employee_id")
    .notNull()
    .references(() => users.id),
  department_id: integer("department_id")
    .notNull()
    .references(() => departments.id),
  is_primary: boolean("is_primary").notNull().default(false),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date"),
  ...timestampFields,
});
