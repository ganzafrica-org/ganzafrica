/**
 * Manages a THROWAWAY Postgres for local integration tests. Spins up a disposable
 * `postgres:16` container and tears it down — nothing is left running or on disk.
 *
 *   pnpm test:db:up    -> start container, wait for ready, print the DATABASE_URL_TEST to use
 *   pnpm test:db:down  -> stop & remove the container
 *
 * The vitest global setup (tests/setup.ts) starts it automatically when running the suite,
 * so most people never call these directly. CI uses a GitHub service container instead and
 * sets DATABASE_URL_TEST itself, so this script is a no-op there.
 *
 * Cross-platform: shells out to `docker` via a single command string.
 */
import { spawnSync } from "child_process";

const NAME = "ganzafrica_test_pg";
// Overridable because 55432 is a popular choice — another project's container may already hold it.
const PORT = Number(process.env.TEST_DB_PORT ?? 55432);
export const TEST_DATABASE_URL = `postgres://postgres:test@localhost:${PORT}/ganzafrica_test`;

function sh(cmd: string, opts: { silent?: boolean } = {}) {
  return spawnSync(cmd, {
    shell: true,
    stdio: opts.silent ? "pipe" : "inherit",
    encoding: "utf-8",
  });
}

function isRunning(): boolean {
  const r = sh(`docker ps --filter name=^/${NAME}$ --format "{{.Names}}"`, { silent: true });
  return (r.stdout ?? "").trim() === NAME;
}

export function up(): string {
  if (isRunning()) return TEST_DATABASE_URL;
  // Remove a stopped leftover of the same name, then start fresh.
  sh(`docker rm -f ${NAME}`, { silent: true });
  sh(
    `docker run -d --name ${NAME} -e POSTGRES_PASSWORD=test -e POSTGRES_DB=ganzafrica_test ` +
      `-p ${PORT}:5432 --health-cmd "pg_isready -U postgres" --health-interval 2s postgres:16`,
    { silent: true },
  );
  // Wait for readiness (max ~40s). `docker exec` on a container that is still booting exits
  // non-zero, which doubles as the sleep — `timeout`/`sleep` are unreliable with piped stdin.
  for (let i = 0; i < 40; i++) {
    const r = sh(`docker exec ${NAME} pg_isready -U postgres`, { silent: true });
    if (r.status === 0) return TEST_DATABASE_URL;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
  }
  throw new Error(
    `test-db: Postgres did not become ready in time. Is port ${PORT} free? ` +
      `Set TEST_DB_PORT to use another one.`,
  );
}

export function down() {
  sh(`docker rm -f ${NAME}`, { silent: true });
}

if (require.main === module) {
  const cmd = process.argv[2];
  if (cmd === "up") {
    const url = up();
    console.log(url);
  } else if (cmd === "down") {
    down();
    console.log(`${NAME} removed`);
  } else {
    console.error("usage: tsx scripts/test-db.ts <up|down>");
    process.exit(1);
  }
}
