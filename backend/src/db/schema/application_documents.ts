import { bigint, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { timestampFields } from './common'
import { applications } from './applications'
import { documentTypeEnum } from './enums'

export const application_documents = pgTable('application_documents', {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    application_id: bigint('application_id', { mode: 'number' })
        .notNull()
        .references(() => applications.id),
    type: documentTypeEnum('type').notNull(),
    file_url: text('file_url').notNull(),
    uploaded_at: timestamp('uploaded_at').notNull(),
})