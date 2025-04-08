import { bigint, pgTable, text, boolean, jsonb, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core'
import { timestampFields } from './common'
import {
    jobPostingTypeEnum,
    applicationStageStatusEnum,
    postingStatusEnum, jobTypeEnum,
} from './enums'
import { users } from './users'
import { departments} from "./departments";

export const job_postings = pgTable('job_postings', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    department_id: bigint('department_id', { mode: 'number' })
        .references(() => departments.id),
    type: jobTypeEnum('type').notNull(),
    posting_type: jobPostingTypeEnum('posting_type').notNull(),
    visibility: jsonb('visibility').notNull(), // Array of roles
    target_groups: jsonb('target_groups').notNull(), // Array of user groups
    partner_organization: text('partner_organization'),
    status: postingStatusEnum('status').notNull(),
    published_at: timestamp('published_at'),
    closes_at: timestamp('closes_at'),
    created_by: bigint('created_by', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    ...timestampFields,
})

export const application_stages = pgTable('application_stages', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    job_posting_id: bigint('job_posting_id', { mode: 'number' })
        .notNull()
        .references(() => job_postings.id),
    stage_order: integer('stage_order').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    is_active: boolean('is_active').notNull().default(true),
    ...timestampFields,
})

export const applications = pgTable('applications', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    job_posting_id: bigint('job_posting_id', { mode: 'number' })
        .notNull()
        .references(() => job_postings.id),
    applicant_id: bigint('applicant_id', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    current_stage_id: bigint('current_stage_id', { mode: 'number' })
        .notNull()
        .references(() => application_stages.id),
    future_consideration: boolean('future_consideration').notNull().default(false),
    submitted_at: timestamp('submitted_at').notNull(),
    ...timestampFields,
})

export const application_stage_history = pgTable('application_stage_history', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    application_id: bigint('application_id', { mode: 'number' })
        .notNull()
        .references(() => applications.id),
    stage_id: bigint('stage_id', { mode: 'number' })
        .notNull()
        .references(() => application_stages.id),
    status: applicationStageStatusEnum('status').notNull(),
    feedback: text('feedback'),
    updated_by: bigint('updated_by', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    ...timestampFields,
})