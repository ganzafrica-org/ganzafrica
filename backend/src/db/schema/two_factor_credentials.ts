import { bigint, pgTable, text, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { timestampFields } from './common'
import { users } from './users'

export const two_factor_credentials = pgTable('two_factor_credentials', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    user_id: bigint('user_id', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    method: text('method').notNull(), // 'email_otp' or 'authenticator'
    secret: text('secret'),
    verified: boolean('verified').notNull().default(false),
    ...timestampFields,
});