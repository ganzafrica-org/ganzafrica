import { integer, pgTable, text, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { timestampFields } from './common'
import { users } from './users'

export const roles = pgTable('roles', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    ...timestampFields,
})

export const permissions = pgTable('permissions', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    resource: text('resource').notNull(),
    action: text('action').notNull(),
    ...timestampFields,
})

export const role_permissions = pgTable('role_permissions', {
    id: integer('id').primaryKey(),
    role_id: integer('role_id')
        .notNull()
        .references(() => roles.id),
    permission_id: integer('permission_id')
        .notNull()
        .references(() => permissions.id),
})

export const user_roles = pgTable('user_roles', {
    id: integer('id').primaryKey(),
    user_id: integer('user_id')
        .notNull()
        .references(() => users.id),
    role_id: integer('role_id')
        .notNull()
        .references(() => roles.id),
    granted_by: integer('granted_by')
        .notNull()
        .references(() => users.id),
    granted_at: timestamp('granted_at').notNull(),
    expires_at: timestamp('expires_at'),
})