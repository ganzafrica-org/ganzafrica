import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { timestampFields } from './common'
import { users } from './users'
import {
    cohortStatusEnum,
    fellowStatusEnum,
    milestoneStatusEnum,
} from './enums'

export const cohorts = pgTable('cohorts', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    start_date: timestamp('start_date').notNull(),
    end_date: timestamp('end_date').notNull(),
    status: cohortStatusEnum('status').notNull(),
    description: text('description'),
    ...timestampFields,
})

export const fellows = pgTable('fellows', {
    id: integer('id').primaryKey(),
    user_id: integer('user_id')
        .notNull()
        .references(() => users.id),
    cohort_id: integer('cohort_id')
        .notNull()
        .references(() => cohorts.id),
    status: fellowStatusEnum('status').notNull(),
    start_date: timestamp('start_date').notNull(),
    end_date: timestamp('end_date'),
    ...timestampFields,
})

export const fellowship_milestones = pgTable('fellowship_milestones', {
    id: integer('id').primaryKey(),
    cohort_id: integer('cohort_id')
        .notNull()
        .references(() => cohorts.id),
    name: text('name').notNull(),
    description: text('description'),
    due_date: timestamp('due_date').notNull(),
    ...timestampFields,
})

export const fellow_milestone_progress = pgTable('fellow_milestone_progress', {
    id: integer('id').primaryKey(),
    fellow_id: integer('fellow_id')
        .notNull()
        .references(() => fellows.id),
    milestone_id: integer('milestone_id')
        .notNull()
        .references(() => fellowship_milestones.id),
    status: milestoneStatusEnum('status').notNull(),
    feedback: text('feedback'),
    completed_at: timestamp('completed_at'),
    ...timestampFields,
})