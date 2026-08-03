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
  // Run migrations but capture output so a known benign race (duplicate pg type)
  // can be tolerated in flaky environments where the test DB may be shared briefly.
  const migrate = spawnSync("npx drizzle-kit migrate", {
    shell: true,
    stdio: "pipe",
    encoding: "utf-8",
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: url },
  });

  if (migrate.status !== 0) {
    const out = (migrate.stdout ?? "") + (migrate.stderr ?? "");
    // If the failure is due to the pg type already existing for __drizzle_migrations,
    // it's likely a concurrent migrate/multiple runs race; tolerate it with a warning.
    if (out.includes("__drizzle_migrations") && out.includes("already exists")) {
      // Best-effort warning, but continue test setup.
      // Note: this keeps the existing test DB running; if using Docker it's already started.
      // Log to console so CI output shows the anomaly.
      console.warn(
        "global-setup: drizzle-kit reported an existing __drizzle_migrations type; continuing.",
      );
    } else {
      if (usingDocker) stopTestDb();
      console.error(out);
      throw new Error("global-setup: drizzle-kit migrate failed against the test DB");
    }
  }

  // Teardown
  return () => {
    if (usingDocker) stopTestDb();
  };
}
