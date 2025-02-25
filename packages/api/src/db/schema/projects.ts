import { bigint, pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { timestampFields } from './common'
import { users } from './users'
import {
    projectStatusEnum,
    projectMemberRoleEnum
} from './enums'

export const projects = pgTable('projects', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    status: projectStatusEnum('status').notNull(),
    start_date: timestamp('start_date').notNull(),
    end_date: timestamp('end_date'),
    created_by: bigint('created_by', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    ...timestampFields,
})

export const project_members = pgTable('project_members', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    project_id: bigint('project_id', { mode: 'number' })
        .notNull()
        .references(() => projects.id),
    user_id: bigint('user_id', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    role: projectMemberRoleEnum('role').notNull(),
    start_date: timestamp('start_date').notNull(),
    end_date: timestamp('end_date'),
})

export const project_updates = pgTable('project_updates', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    project_id: bigint('project_id', { mode: 'number' })
        .notNull()
        .references(() => projects.id),
    author_id: bigint('author_id', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    content: jsonb('content').notNull(),
    ...timestampFields,
})