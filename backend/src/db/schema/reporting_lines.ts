import { bigint, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { timestampFields } from './common'
import { users } from './users'
import {contextTypeEnum} from "./enums";

export const reporting_lines = pgTable('reporting_lines', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    user_id: bigint('user_id', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    reports_to_id: bigint('reports_to_id', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    context_type: contextTypeEnum('context_type').notNull(),
    context_id: bigint('context_id', { mode: 'number' }),
    description: text('description'),
    start_date: timestamp('start_date').notNull(),
    end_date: timestamp('end_date'),
    ...timestampFields,
})