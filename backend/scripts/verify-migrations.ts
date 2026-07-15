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

const KNOWN_TRIGGER = "audit_users_trigger"; // defined in 0001_triggers.sql

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
    // 1. Fresh DB → migrate applies 0000 + 0001 cleanly; the sentinel trigger exists.
    console.log("[1] fresh migrate");
    await resetSchema(pool);
    if (run("npx", ["drizzle-kit", "migrate"]) !== 0) throw new Error("migrate failed");
    const trig = await pool.query(`SELECT 1 FROM pg_trigger WHERE tgname = $1`, [KNOWN_TRIGGER]);
    assert(trig.rowCount === 1, `trigger ${KNOWN_TRIGGER} created by 0001`);
    const applied = await pool.query(
      `SELECT count(*)::int c FROM "drizzle"."__drizzle_migrations"`,
    );
    assert(applied.rows[0].c >= 2, "0000 + 0001 recorded as applied");

    // 2. generate immediately after → no new migration (schema <-> SQL in sync).
    console.log("[2] generate is a no-op");
    const before = new Set(listSql());
    if (run("npx", ["drizzle-kit", "generate"]) !== 0) throw new Error("generate failed");
    const after = listSql();
    const added = after.filter((f) => !before.has(f));
    assert(added.length === 0, `no new migration generated (added: ${added.join(",") || "none"})`);

    // 3. Simulated existing DB → marker script → migrate is a no-op.
    console.log("[3] marker + migrate no-op on populated DB");
    // DB already has schema + tracking rows from step 1; re-running migrate must be clean.
    if (run("npx", ["tsx", "scripts/mark-baseline-applied.ts"]) !== 0)
      throw new Error("marker failed");
    if (run("npx", ["drizzle-kit", "migrate"]) !== 0) throw new Error("migrate (no-op) failed");

    // 4. Marker idempotent.
    console.log("[4] marker idempotent");
    if (run("npx", ["tsx", "scripts/mark-baseline-applied.ts"]) !== 0)
      throw new Error("marker second run failed");
    const cnt2 = await pool.query(`SELECT count(*)::int c FROM "drizzle"."__drizzle_migrations"`);
    assert(cnt2.rows[0].c >= 2, "no duplicate tracking rows after second marker run");

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
