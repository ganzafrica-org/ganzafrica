/**
 * Per-file test setup (vitest setupFiles). Runs before each test module in every worker.
 *
 * 1. Fills in the env vars the app's config/env.ts requires at import time with safe dummy
 *    values (real secrets never touch tests). DATABASE_URL is set by global-setup to the test DB.
 * 2. Exposes resetDb() to truncate all application tables between tests, keeping the schema and
 *    the drizzle migration bookkeeping intact.
 */
import { beforeEach } from "vitest";

// --- env defaults (only set if not already provided, so CI/global-setup win) ---
const TEST_ENV: Record<string, string> = {
  NODE_ENV: "test",
  API_BASE_URL: "http://localhost:3002",
  WEBSITE_URL: "http://localhost:3000",
  PORTAL_URL: "http://localhost:3001",
  SESSION_SECRET: "test_session_secret_at_least_32_chars_long_xx",
  JWT_SECRET: "test_jwt_secret_at_least_32_characters_long_xx",
  JWT_REFRESH_SECRET: "test_jwt_refresh_secret_at_least_32_chars_xx",
  CORS_ORIGINS: "http://localhost:3000,http://localhost:3001",
  DO_SPACES_ENDPOINT: "https://test.digitaloceanspaces.com",
  DO_SPACES_REGION: "nyc3",
  DO_SPACES_ACCESS_KEY: "test-key",
  DO_SPACES_SECRET_KEY: "test-secret",
  DO_SPACES_BUCKET: "test-bucket",
};
for (const [k, v] of Object.entries(TEST_ENV)) {
  if (!process.env[k]) process.env[k] = v;
}
// Real secrets never touch tests (see file doc above). RESEND_API_KEY needs the same "set it here
// first" treatment as everything above: config/env.ts's dotenv.config() only fills in vars that
// aren't already present in process.env, and this file's setupFiles hook runs before that — so
// pre-setting it to "" here (falsy, same as unset) blocks the developer's real backend/.env value
// from ever reaching a test run, the same way it would if we'd never run dotenv at all.
if (!process.env.RESEND_API_KEY) process.env.RESEND_API_KEY = "";

// DATABASE_URL comes from global-setup; fall back to the conventional local test DB.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.DATABASE_URL_TEST ?? "postgres://postgres:test@localhost:55432/ganzafrica_test";
}

/**
 * Truncate every application table (fast, resets identities), preserving schema and the
 * `drizzle` bookkeeping schema. Call in a test file's beforeEach for isolation.
 */
export async function resetDb() {
  const { db } = await import("../src/db/client");
  const { sql } = await import("drizzle-orm");
  const rows = await db.execute(
    sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE '\\_\\_%'`,
  );
  const tables = (rows.rows as { tablename: string }[]).map((r) => `"public"."${r.tablename}"`);
  if (tables.length === 0) return;
  await db.execute(sql.raw(`TRUNCATE ${tables.join(", ")} RESTART IDENTITY CASCADE`));
}

// Opt-in convenience: integration tests can `import "./setup"` and get a clean DB each test by
// calling resetDb() themselves; we don't auto-truncate globally so pure unit tests stay fast.
export { beforeEach };
