/**
 * ONE command to get ANY database onto the migration rails — prod, a teammate's local copy,
 * a fresh DB, or a half-migrated one. Idempotent and identical on every OS (no schema
 * introspection; the SQL does the "skip if exists" work).
 *
 * What it does:
 *   1. Applies the idempotent squashed baseline (drizzle/baseline/0000_baseline.sql), which
 *      creates any missing tables/enums/constraints/triggers and skips whatever already exists.
 *   2. Removes the legacy `public.__drizzle_migrations` table left by the old baseline scripts
 *      (drizzle-kit uses `drizzle.__drizzle_migrations`, not the public one).
 *   3. Records the baseline migration in drizzle's own `drizzle.__drizzle_migrations` so that
 *      `drizzle-kit migrate` treats it as applied and only runs migrations added AFTER the squash.
 *
 * After running this once, everyone uses plain `pnpm db:migrate` and stays in lockstep.
 *
 * Usage:  DATABASE_URL=... pnpm db:reconcile
 *   Safe to run repeatedly. Does not touch application data.
 */
import { Pool } from "pg";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";
import crypto from "crypto";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const drizzleDir = path.resolve(__dirname, "../drizzle");
const baselinePath = path.join(drizzleDir, "0000_baseline.sql");

type JournalEntry = { idx: number; tag: string; when: number };

async function main() {
  const journal = JSON.parse(
    fs.readFileSync(path.join(drizzleDir, "meta", "_journal.json"), "utf-8"),
  ) as { entries: JournalEntry[] };

  // The squashed baseline is journal entry idx 0. Its tracked hash is the sha256 of the
  // ACTUAL migration file drizzle-kit will read (drizzle/<tag>.sql), so migrate() matches.
  const baselineEntry = journal.entries[0];
  const trackedSqlPath = path.join(drizzleDir, `${baselineEntry.tag}.sql`);
  const trackedHash = crypto
    .createHash("sha256")
    .update(fs.readFileSync(trackedSqlPath))
    .digest("hex");

  const idempotentSql = fs.readFileSync(baselinePath, "utf-8");

  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  try {
    console.log("Reconciling database onto the migration baseline...\n");

    console.log("  [1/3] applying idempotent baseline (creates missing objects, skips existing)");
    await client.query("BEGIN");
    await client.query(idempotentSql);
    await client.query("COMMIT");

    console.log("  [2/3] removing legacy public.__drizzle_migrations (if any)");
    await client.query(`DROP TABLE IF EXISTS "public"."__drizzle_migrations"`);

    console.log("  [3/3] recording baseline in drizzle.__drizzle_migrations");
    await client.query(`CREATE SCHEMA IF NOT EXISTS "drizzle"`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);
    // Reset tracking to exactly the squashed baseline: clear stale rows (e.g. an orphan hash
    // from a previous baseline attempt) and insert the one true baseline row.
    await client.query(`DELETE FROM "drizzle"."__drizzle_migrations"`);
    await client.query(
      `INSERT INTO "drizzle"."__drizzle_migrations" ("hash", "created_at") VALUES ($1, $2)`,
      [trackedHash, baselineEntry.when],
    );

    console.log(
      "\nDone. `pnpm db:migrate` will now apply only migrations added after the baseline.",
    );
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("\nreconcile-db failed:", err.message ?? err);
  process.exit(1);
});
