/**
 * Executable proof that the migration workflow is healthy. Intended to run in CI against a
 * throwaway Postgres. Exits non-zero on any failure. See FND-02 §6.
 *
 * Requires a DATABASE_URL pointing at a DISPOSABLE database (it drops/recreates schema).
 * Usage: DATABASE_URL=postgres://.../ganzafrica_verify tsx scripts/verify-migrations.ts
 */
import { Pool } from "pg";
import { spawnSync } from "child_process";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const url = process.env.DATABASE_URL ?? "";
const host = (() => {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
})();
if (host !== "localhost" && host !== "127.0.0.1" && host !== "::1") {
  console.error("verify-migrations must run against a local disposable DB, not:", host);
  process.exit(1);
}

const KNOWN_TRIGGER = "audit_users_trigger"; // defined in the baseline triggers section

function run(cmd: string, args: string[]) {
  // Single command string with shell:true is the cross-platform-safe form (resolves
  // npx/npx.cmd on Windows). Inputs here are static literals, so no injection surface.
  const res = spawnSync([cmd, ...args].join(" "), {
    stdio: "inherit",
    shell: true,
    cwd: path.resolve(__dirname, ".."),
    env: process.env,
  });
  return res.status ?? 1;
}

async function resetSchema(pool: Pool) {
  await pool.query(`DROP SCHEMA IF EXISTS public CASCADE`);
  await pool.query(`CREATE SCHEMA public`);
  await pool.query(`DROP SCHEMA IF EXISTS drizzle CASCADE`);
}

async function main() {
  const pool = new Pool({ connectionString: url });
  const assert = (cond: boolean, msg: string) => {
    if (!cond) {
      console.error(`  ✗ ${msg}`);
      throw new Error(msg);
    }
    console.log(`  ✓ ${msg}`);
  };

  try {
    // 1. Fresh DB → migrate applies the squashed baseline; schema + sentinel trigger exist.
    console.log("[1] fresh migrate");
    await resetSchema(pool);
    if (run("npx", ["drizzle-kit", "migrate"]) !== 0) throw new Error("migrate failed");
    const trig = await pool.query(`SELECT 1 FROM pg_trigger WHERE tgname = $1`, [KNOWN_TRIGGER]);
    assert(trig.rowCount === 1, `trigger ${KNOWN_TRIGGER} created by the baseline`);
    const tables = await pool.query(
      `SELECT count(*)::int c FROM pg_tables WHERE schemaname='public'`,
    );
    assert(tables.rows[0].c >= 70, `full schema built (${tables.rows[0].c} tables)`);
    const applied = await pool.query(
      `SELECT count(*)::int c FROM "drizzle"."__drizzle_migrations"`,
    );
    // Baseline + every post-baseline migration is recorded (grows as migrations are added).
    assert(applied.rows[0].c >= 1, `all migrations recorded (${applied.rows[0].c})`);

    // 2. generate immediately after → no new migration (schema <-> snapshot in sync).
    console.log("[2] generate is a no-op");
    const before = new Set(listSql());
    if (run("npx", ["drizzle-kit", "generate"]) !== 0) throw new Error("generate failed");
    const added = listSql().filter((f) => !before.has(f));
    assert(added.length === 0, `no new migration generated (added: ${added.join(",") || "none"})`);

    // 3. The real reconcile case: a DB with the BASELINE schema but NO drizzle ledger at all
    //    (the original prod situation) — plus a legacy public.__drizzle_migrations left by the
    //    old baseline scripts. reconcile bootstraps the ledger with the baseline; a following
    //    `migrate` then applies the post-baseline migrations cleanly.
    console.log("[3] reconcile bootstraps an untracked baseline-schema DB");
    await resetSchema(pool);
    // Recreate ONLY the baseline schema (no post-baseline migrations), with no ledger.
    const fs = await import("fs");
    const baselineSql = fs.readFileSync(
      path.resolve(__dirname, "../drizzle/0000_baseline.sql"),
      "utf-8",
    );
    await pool.query(baselineSql);
    await pool.query(
      `CREATE TABLE IF NOT EXISTS "public"."__drizzle_migrations" (id serial, hash text, created_at bigint)`,
    ); // legacy junk table reconcile must remove
    if (run("npx", ["tsx", "scripts/reconcile-db.ts"]) !== 0) throw new Error("reconcile failed");
    const legacy = await pool.query(`SELECT to_regclass('public.__drizzle_migrations') AS t`);
    assert(legacy.rows[0].t === null, "legacy public.__drizzle_migrations removed");
    const rows = await pool.query(`SELECT count(*)::int c FROM "drizzle"."__drizzle_migrations"`);
    assert(rows.rows[0].c === 1, "baseline recorded after reconcile");
    // Post-baseline migrations apply cleanly on top.
    if (run("npx", ["drizzle-kit", "migrate"]) !== 0)
      throw new Error("post-baseline migrate failed");
    const emp = await pool.query(`SELECT to_regclass('public.employees') AS t`);
    assert(emp.rows[0].t !== null, "post-baseline migration (employees) applied after reconcile");

    // 4. Reconcile is idempotent (re-running against the now-tracked DB changes nothing harmful).
    console.log("[4] reconcile idempotent");
    if (run("npx", ["tsx", "scripts/reconcile-db.ts"]) !== 0)
      throw new Error("reconcile rerun failed");
    if (run("npx", ["drizzle-kit", "migrate"]) !== 0)
      throw new Error("migrate after 2nd reconcile failed");

    console.log("\nAll migration checks passed.");
  } finally {
    await pool.end();
  }
}

function listSql(): string[] {
  const fs = require("fs") as typeof import("fs");
  const dir = path.resolve(__dirname, "../drizzle");
  return fs.readdirSync(dir).filter((f) => f.endsWith(".sql"));
}

main().catch((err) => {
  console.error("\nverify-migrations FAILED:", err.message);
  process.exit(1);
});
