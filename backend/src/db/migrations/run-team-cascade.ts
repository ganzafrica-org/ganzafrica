import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function findAndDropFk(db: ReturnType<typeof drizzle>, table: string, column: string) {
  // Find FK constraints on table.column
  const query = sql`SELECT
    tc.constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
   AND tc.table_schema = kcu.table_schema
  WHERE tc.table_name = ${table}
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = ${column}` as any;

  const result = await (db as any).execute(query);
  for (const row of result.rows ?? []) {
    const name = row.constraint_name as string;
    if (name) {
      await (db as any).execute(sql`ALTER TABLE ${sql.raw(table)} DROP CONSTRAINT IF EXISTS ${sql.raw(name)}`);
    }
  }
}

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle(pool);
  try {
    console.log('Applying ON DELETE CASCADE for team references...');

    // project_members.team_id -> teams.id ON DELETE CASCADE
    await findAndDropFk(db, 'project_members', 'team_id');
    await (db as any).execute(sql`
      ALTER TABLE project_members
      ADD CONSTRAINT project_members_team_id_fk
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    `);

    // project_updates.author_id -> teams.id ON DELETE CASCADE
    await findAndDropFk(db, 'project_updates', 'author_id');
    await (db as any).execute(sql`
      ALTER TABLE project_updates
      ADD CONSTRAINT project_updates_author_id_fk
      FOREIGN KEY (author_id) REFERENCES teams(id) ON DELETE CASCADE
    `);

    console.log('Cascade constraints applied successfully.');
  } catch (err) {
    console.error('Failed to apply cascade constraints:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


