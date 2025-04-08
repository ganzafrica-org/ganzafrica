import { bigint, pgTable, text, timestamp, jsonb, integer} from 'drizzle-orm/pg-core'
import { timestampFields } from './common'
import { users } from './users'
import {
    projectStatusEnum,
    projectMemberRoleEnum,
    mediaTypeEnum
} from './enums'

export const project_categories = pgTable('project_categories', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    name: text('name').notNull().unique(),
    ...timestampFields,
})

export const projects = pgTable('projects', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    description: text('full_description'),
    status: projectStatusEnum('status').notNull(),
    category_id: bigint('category_id', { mode: 'number' })
        .references(() => project_categories.id),

    location: text('location'),
    impacted_people: integer('impacted_people'),
    media: jsonb('media'),
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
    ...timestampFields,
})

export const project_updates = pgTable('project_updates', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    project_id: bigint('project_id', { mode: 'number' })
        .notNull()
        .references(() => projects.id),
    author_id: bigint('author_id', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    title: text('title'),
    content: jsonb('content').notNull(),
    ...timestampFields,
})