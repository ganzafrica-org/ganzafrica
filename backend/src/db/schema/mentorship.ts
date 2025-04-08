import { bigint, pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { timestampFields } from './common'
import { users } from './users'
import {mentorshipTypeEnum, mentorshipStatusEnum, mentorshipSessionStatusEnum, mentorshipGoalStatusEnum} from './enums'

export const mentorship_relationships = pgTable('mentorship_relationships', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    mentor_id: bigint('mentor_id', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    mentee_id: bigint('mentee_id', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    type: mentorshipTypeEnum('type').notNull(),
    status: mentorshipStatusEnum('status').notNull(),
    start_date: timestamp('start_date').notNull(),
    end_date: timestamp('end_date'),
    goals: jsonb('goals'),
    ...timestampFields,
})

export const mentorship_sessions = pgTable('mentorship_sessions', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    relationship_id: bigint('relationship_id', { mode: 'number' })
        .notNull()
        .references(() => mentorship_relationships.id),
    session_date: timestamp('session_date').notNull(),
    summary: text('summary'),
    feedback: jsonb('feedback'),
    status: mentorshipSessionStatusEnum('status').notNull(),
    ...timestampFields,
})

export const mentorship_goals = pgTable('mentorship_goals', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    relationship_id: bigint('relationship_id', { mode: 'number' })
        .notNull()
        .references(() => mentorship_relationships.id),
    title: text('title').notNull(),
    description: text('description'),
    target_date: timestamp('target_date').notNull(),
    status: mentorshipGoalStatusEnum('status').notNull(),
    feedback: text('feedback'),
    ...timestampFields,
})