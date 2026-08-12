/**
 * MOD-02 one-off backfill CLI: run the name-match backfill (backend/src/services/hr/org-
 * backfill.service.ts) against whatever DATABASE_URL points at, then print a summary.
 *
 * Idempotent — safe to re-run; already-resolved employees (manager_id set) are skipped, and
 * already-recorded unresolved rows are not duplicated.
 *
 *   pnpm tsx scripts/backfill-managers.ts
 *
 * Do not run this against production without HR reviewing the report it prints (rollout note,
 * MOD-02 §10 — ship API+backfill first, run with HR reviewing, then chart UI).
 */
import { backfillManagers } from "../src/services/hr/org-backfill.service";

async function main() {
  const result = await backfillManagers();
  console.log("MOD-02 manager backfill complete:");
  console.log(`  resolved:   ${result.resolved} (manager_id set from a unique name match)`);
  console.log(
    `  unresolved: ${result.unresolved} (zero/ambiguous match, or would-be cycle — see org_backfill_unresolved)`,
  );
  console.log(`  skipped:    ${result.skipped} (already had a manager_id)`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("backfill-managers failed:", err.message ?? err);
    process.exit(1);
  });
