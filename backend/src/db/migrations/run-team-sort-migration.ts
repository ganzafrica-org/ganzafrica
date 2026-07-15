import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";
import path from "path";

// Load env
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle(pool);

  try {
    console.log("Running one-off team sort_order migration...");

    // 1) Add column if not exists
    await db.execute(sql`
      ALTER TABLE teams
      ADD COLUMN IF NOT EXISTS sort_order INTEGER
    `);

    // 2) Backfill values for existing rows (stable by created_at then id)
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

    // 3) Create index if not exists
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS teams_sort_order_idx ON teams(sort_order)
    `);

    console.log("Team sort_order migration completed successfully.");
  } catch (err) {
    console.error("Team sort_order migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
