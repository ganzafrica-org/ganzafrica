/**
 * MOD-06 rollout (spec §10): seed the org's default leave policies and instantiate the current
 * year's balances for everyone still employed. Idempotent — safe to re-run.
 *
 *   pnpm db:seed:leave            # policies + balances for the current year
 *   pnpm db:seed:leave -- 2027    # target a specific year
 *
 * HR reviews entitlements after this runs and before announcing the module.
 */
import { db } from "../src/db/client";
import { hr_leave_policies } from "../src/db/schema";
import { backfillBalances } from "../src/services/hr/leave-core.service";
import { Logger } from "../src/config";

const logger = new Logger("SeedLeaveDefaults");

type PolicyRow = {
  employment_type: string;
  type: "ANNUAL" | "SICK";
  annual_days: string;
  max_carry_over: string;
};

// Rwanda statutory minimums as the starting point: 18 working days annual, 15 sick. HR adjusts
// per employment type in settings afterwards.
//
// Maternity (84 days) and Paternity (4 days) are deliberately NOT seeded here — they're opt-in
// per the "Leave-type grants" feature (settings/leave), turned on via setGenderLeaveEnabled and
// granted to specific employees, not a default every employee gets just for existing.
const DEFAULT_POLICIES: PolicyRow[] = [
  "fellow",
  "analyst",
  "staff",
  "contractor",
  "intern",
].flatMap((employment_type) => [
  { employment_type, type: "ANNUAL" as const, annual_days: "18", max_carry_over: "5" },
  { employment_type, type: "SICK" as const, annual_days: "15", max_carry_over: "0" },
]);

async function main() {
  const year = Number(process.argv[2] ?? new Date().getUTCFullYear());
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error(`Invalid year: ${process.argv[2]}`);
  }

  const inserted = await db
    .insert(hr_leave_policies)
    .values(DEFAULT_POLICIES)
    .onConflictDoNothing()
    .returning();
  logger.info(
    `Policies: ${inserted.length} added, ${DEFAULT_POLICIES.length - inserted.length} already present`,
  );

  const { processed } = await backfillBalances(year);
  logger.info(`Balances: instantiated for ${processed} employee(s) for ${year}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error("Leave defaults seed failed", error);
    process.exit(1);
  });
