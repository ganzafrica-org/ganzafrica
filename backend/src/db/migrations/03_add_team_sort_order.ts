import { sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export async function up(db: NodePgDatabase<any>) {
  // 1) Add nullable column (safe for existing rows)
  await db.execute(sql`
    ALTER TABLE teams
    ADD COLUMN IF NOT EXISTS sort_order INTEGER NULL
  `);

  // 2) Backfill existing rows with a stable initial order by created_at then id
  await db.execute(sql`
    WITH ordered AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS rn
      FROM teams
    )
    UPDATE teams t
    SET sort_order = o.rn
    FROM ordered o
    WHERE t.id = o.id
      AND t.sort_order IS NULL
  `);

  // 3) Create index to speed up sorting by sort_order
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS teams_sort_order_idx ON teams(sort_order)
  `);
}

export async function down(db: NodePgDatabase<any>) {
  // Usually keep column for future; if you must rollback:
  // await db.execute(sql`ALTER TABLE teams DROP COLUMN IF EXISTS sort_order`);
}
