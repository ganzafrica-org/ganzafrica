import { bigint, pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { timestampFields } from './common'
import { users } from './users'
import {
    cohortStatusEnum,
    fellowStatusEnum,
    milestoneStatusEnum,
} from './enums'

export const cohorts = pgTable('cohorts', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    start_date: timestamp('start_date').notNull(),
    end_date: timestamp('end_date').notNull(),
    status: cohortStatusEnum('status').notNull(),
    description: text('description'),
    ...timestampFields,
})

export const fellows = pgTable('fellows', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    user_id: bigint('user_id', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    cohort_id: bigint('cohort_id', { mode: 'number' })
        .notNull()
        .references(() => cohorts.id),
    status: fellowStatusEnum('status').notNull(),
    start_date: timestamp('start_date').notNull(),
    end_date: timestamp('end_date'),
    ...timestampFields,
})

export const fellowship_milestones = pgTable('fellowship_milestones', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    cohort_id: bigint('cohort_id', { mode: 'number' })
        .notNull()
        .references(() => cohorts.id),
    name: text('name').notNull(),
    description: text('description'),
    due_date: timestamp('due_date').notNull(),
    ...timestampFields,
})

export const fellow_milestone_progress = pgTable('fellow_milestone_progress', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    fellow_id: bigint('fellow_id', { mode: 'number' })
        .notNull()
        .references(() => fellows.id),
    milestone_id: bigint('milestone_id', { mode: 'number' })
        .notNull()
        .references(() => fellowship_milestones.id),
    status: milestoneStatusEnum('status').notNull(),
    feedback: text('feedback'),
    completed_at: timestamp('completed_at'),
    ...timestampFields,
})