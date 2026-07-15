/**
 * Vitest global setup — runs ONCE before the whole backend suite.
 *
 * - Local: starts the throwaway dockerized Postgres (scripts/test-db.ts) and tears it down
 *   after all tests, so nothing is left running.
 * - CI: a Postgres service container is already up and DATABASE_URL_TEST is set, so we skip
 *   docker and just use it.
 *
 * Either way it applies the drizzle migration baseline once, so every test file starts against
 * the real schema. Sets DATABASE_URL to the test DB for the whole run.
 */
import { spawnSync } from "child_process";
import path from "path";
import { up as startTestDb, down as stopTestDb, TEST_DATABASE_URL } from "../scripts/test-db";

export default async function () {
  const provided = process.env.DATABASE_URL_TEST;
  const usingDocker = !provided;
  const url = provided ?? startTestDb();

  // The whole process (and thus the app's db client) must point at the test DB.
  process.env.DATABASE_URL = url;
  process.env.DATABASE_URL_TEST = url;
  process.env.NODE_ENV = "test";

  // Apply the migration baseline (idempotent) against the test DB.
  const migrate = spawnSync("npx drizzle-kit migrate", {
    shell: true,
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: url },
  });
  if (migrate.status !== 0) {
    if (usingDocker) stopTestDb();
    throw new Error("global-setup: drizzle-kit migrate failed against the test DB");
  }

  // Teardown
  return () => {
    if (usingDocker) stopTestDb();
  };
}
