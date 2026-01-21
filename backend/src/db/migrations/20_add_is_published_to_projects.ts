import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export async function up(db: NodePgDatabase<any>) {
  // Add is_published column to projects table if it doesn't exist
  await db.execute(sql`
    ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false
  `);
  
  console.log('✓ Added is_published column to projects table');
}

export async function down(db: NodePgDatabase<any>) {
  // Remove the column if rolling back
  await db.execute(sql`
    ALTER TABLE projects
    DROP COLUMN IF EXISTS is_published
  `);
  
  console.log('✓ Removed is_published column from projects table');
}

