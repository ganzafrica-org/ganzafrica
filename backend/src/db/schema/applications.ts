import {
  integer,
  pgTable,
  text,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { timestampFields } from "./common";
import { users } from "./users";
import { departments } from "./departments";
import {
  jobPostingTypeEnum,
  applicationStageStatusEnum,
  postingStatusEnum,
  jobTypeEnum,
  documentTypeEnum,
} from "./enums";

export const job_postings = pgTable("job_postings", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  department_id: integer("department_id").references(() => departments.id),
  type: jobTypeEnum("type").notNull(),
  posting_type: jobPostingTypeEnum("posting_type").notNull(),
  visibility: jsonb("visibility").notNull(),
  target_groups: jsonb("target_groups").notNull(),
  partner_organization: text("partner_organization"),
  status: postingStatusEnum("status").notNull(),
  published_at: timestamp("published_at"),
  closes_at: timestamp("closes_at"),
  created_by: integer("created_by")
    .notNull()
    .references(() => users.id),
  ...timestampFields,
});

export const application_stages = pgTable("application_stages", {
  id: integer("id").primaryKey(),
  job_posting_id: integer("job_posting_id")
    .notNull()
    .references(() => job_postings.id),
  stage_order: integer("stage_order").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  is_active: boolean("is_active").notNull().default(true),
  ...timestampFields,
});

export const applications = pgTable("applications", {
  id: integer("id").primaryKey(),
  job_posting_id: integer("job_posting_id")
    .notNull()
    .references(() => job_postings.id),
  applicant_id: integer("applicant_id")
    .notNull()
    .references(() => users.id),
  current_stage_id: integer("current_stage_id")
    .notNull()
    .references(() => application_stages.id),
  future_consideration: boolean("future_consideration")
    .notNull()
    .default(false),
  submitted_at: timestamp("submitted_at").notNull(),
  ...timestampFields,
});

export const application_stage_history = pgTable("application_stage_history", {
  id: integer("id").primaryKey(),
  application_id: integer("application_id")
    .notNull()
    .references(() => applications.id),
  stage_id: integer("stage_id")
    .notNull()
    .references(() => application_stages.id),
  status: applicationStageStatusEnum("status").notNull(),
  feedback: text("feedback"),
  updated_by: integer("updated_by")
    .notNull()
    .references(() => users.id),
  ...timestampFields,
});

export const application_documents = pgTable("application_documents", {
  id: integer("id").primaryKey(),
  application_id: integer("application_id")
    .notNull()
    .references(() => applications.id),
  type: documentTypeEnum("type").notNull(),
  file_url: text("file_url").notNull(),
  uploaded_at: timestamp("uploaded_at").notNull(),
  ...timestampFields,
});
