/**
 * Guarded wrapper for `drizzle-kit push`. Push bypasses the migration journal and is the
 * original cause of the broken migration state, so it is allowed ONLY against a local
 * database for quick prototyping. Any non-localhost target, or NODE_ENV=production, is
 * refused. See docs/architecture/database-migrations.md.
 */
import { spawnSync } from "child_process";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const url = process.env.DATABASE_URL ?? "";
let host = "";
try {
  host = new URL(url).hostname;
} catch {
  console.error("guard-push: DATABASE_URL is missing or not a valid URL.");
  process.exit(1);
}

const isLocal = host === "localhost" || host === "127.0.0.1" || host === "::1";
const isProd = process.env.NODE_ENV === "production";

if (!isLocal || isProd) {
  console.error(
    `\n✖ db:push is blocked for target host "${host}" (NODE_ENV=${process.env.NODE_ENV ?? "unset"}).\n` +
      `  Push bypasses the migration journal and must never run against a shared/prod DB.\n` +
      `  Use \`pnpm db:generate\` then \`pnpm db:migrate\` instead.\n` +
      `  (Push is permitted only on localhost with NODE_ENV != production.)\n`,
  );
  process.exit(1);
}

// Single command string with shell:true resolves npx/npx.cmd cross-platform.
const res = spawnSync("npx drizzle-kit push", { stdio: "inherit", shell: true });
process.exit(res.status ?? 0);
