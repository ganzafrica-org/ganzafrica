/**
 * Marks existing generated migrations as already-applied in drizzle's own
 * `drizzle.__drizzle_migrations` table, so `drizzle-kit migrate` treats a database
 * that already contains the schema (prod, long-lived dev DBs) as up to date instead
 * of re-running 0000 and failing with "type ... already exists".
 *
 * Replicates drizzle-kit's exact bookkeeping (see docs/architecture/database-migrations.md):
 *   - table: drizzle.__drizzle_migrations (id serial, hash text, created_at bigint)
 *   - hash:  sha256 hex of the migration .sql file content
 *   - created_at: the journal entry's `when` (folderMillis)
 *
 * Idempotent: only inserts rows whose hash is not already present. Run once per DB.
 *
 * Usage:  DATABASE_URL=... tsx scripts/mark-baseline-applied.ts
 *   By default marks EVERY migration in the journal (use when the DB already has the
 *   full schema, e.g. prod). Pass --upto=NNNN to mark only through a given index.
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

const uptoArg = process.argv.find((a) => a.startsWith("--upto="));
const uptoIdx = uptoArg ? parseInt(uptoArg.split("=")[1], 10) : Infinity;

const drizzleDir = path.resolve(__dirname, "../drizzle");

type JournalEntry = { idx: number; tag: string; when: number };

async function main() {
  const journal = JSON.parse(
    fs.readFileSync(path.join(drizzleDir, "meta", "_journal.json"), "utf-8"),
  ) as { entries: JournalEntry[] };

  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    await pool.query(`CREATE SCHEMA IF NOT EXISTS "drizzle"`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);

    const existing = await pool.query<{ hash: string }>(
      `SELECT hash FROM "drizzle"."__drizzle_migrations"`,
    );
    const existingHashes = new Set(existing.rows.map((r) => r.hash));

    let inserted = 0;
    for (const entry of journal.entries) {
      if (entry.idx > uptoIdx) continue;
      const sqlPath = path.join(drizzleDir, `${entry.tag}.sql`);
      const content = fs.readFileSync(sqlPath).toString();
      const hash = crypto.createHash("sha256").update(content).digest("hex");

      if (existingHashes.has(hash)) {
        console.log(`  = ${entry.tag} already marked`);
        continue;
      }
      await pool.query(
        `INSERT INTO "drizzle"."__drizzle_migrations" ("hash", "created_at") VALUES ($1, $2)`,
        [hash, entry.when],
      );
      inserted++;
      console.log(`  + ${entry.tag} marked as applied`);
    }

    console.log(
      `\nDone. ${inserted} migration(s) marked. \`drizzle-kit migrate\` will now skip them.`,
    );
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("mark-baseline-applied failed:", err);
  process.exit(1);
});
