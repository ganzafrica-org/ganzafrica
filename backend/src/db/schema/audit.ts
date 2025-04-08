import { bigint, pgTable, text, jsonb } from 'drizzle-orm/pg-core'
import { timestampFields } from './common'
import { users } from './users'

export const audit_logs = pgTable('audit_logs', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    user_id: bigint('user_id', { mode: 'number' })
        .references(() => users.id),
    action: text('action').notNull(),
    resource_type: text('resource_type').notNull(),
    resource_id: bigint('resource_id', { mode: 'number' }),
    changes: jsonb('changes'),
    ip_address: text('ip_address'),
    ...timestampFields,
})