import { bigint, pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { timestampFields } from './common'
import { users } from './users'

export const departments = pgTable('departments', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    ...timestampFields,
})

export const employee_departments = pgTable('employee_departments', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    employee_id: bigint('employee_id', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    department_id: bigint('department_id', { mode: 'number' })
        .notNull()
        .references(() => departments.id),
    is_primary: boolean('is_primary').notNull().default(false),
    start_date: timestamp('start_date').notNull(),
    end_date: timestamp('end_date'),
    ...timestampFields,
})