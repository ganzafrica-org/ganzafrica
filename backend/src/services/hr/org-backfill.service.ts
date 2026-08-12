/**
 * MOD-02 one-off, idempotent backfill: matches each active employee's legacy
 * `hr_contracts.report_to` free text (falling back to `.manager`) against employee full names
 * and sets `manager_id` on a unique match — through `setManager`, so its own cycle check still
 * applies (a would-be-cycle match is recorded as unresolved, never silently skipped or forced).
 * Zero or multiple matches also go to `org_backfill_unresolved` with the raw text preserved, so
 * HR can resolve them manually via the unresolved-managers worklist.
 */
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { employees, hr_contracts, org_backfill_unresolved } from "@/db/schema";
import { Logger } from "@/config";
import { CycleError, setManager } from "./org.service";

const logger = new Logger("OrgBackfill");

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

export interface BackfillResult {
  resolved: number;
  unresolved: number;
  /** Already had a manager_id (from a prior run or a manual assignment) — left untouched. */
  skipped: number;
}

async function recordUnresolved(employeeId: string, rawText: string) {
  const existing = await db
    .select({ id: org_backfill_unresolved.id })
    .from(org_backfill_unresolved)
    .where(eq(org_backfill_unresolved.employee_id, employeeId))
    .limit(1);
  if (existing.length) return; // idempotent: already recorded, don't duplicate
  await db.insert(org_backfill_unresolved).values({ employee_id: employeeId, raw_text: rawText });
}

export async function backfillManagers(): Promise<BackfillResult> {
  // Candidate pool for name matching: any non-exited employee can legitimately be a manager
  // (on_leave included — someone temporarily out is still validly in the chain).
  const candidates = await db
    .select({ id: employees.id, first_name: employees.first_name, last_name: employees.last_name })
    .from(employees)
    .where(inArray(employees.status, ["active", "on_leave"]));

  const byNormalizedName = new Map<string, string[]>();
  for (const c of candidates) {
    const key = normalize(`${c.first_name} ${c.last_name}`);
    if (!byNormalizedName.has(key)) byNormalizedName.set(key, []);
    byNormalizedName.get(key)!.push(c.id);
  }

  // Subjects needing backfill: active employees only, per MOD-02 §4.
  const subjects = await db
    .select({ id: employees.id, manager_id: employees.manager_id })
    .from(employees)
    .where(eq(employees.status, "active"));

  let resolved = 0;
  let unresolved = 0;
  let skipped = 0;

  for (const subject of subjects) {
    if (subject.manager_id) {
      skipped++;
      continue;
    }

    const [contract] = await db
      .select({ manager: hr_contracts.manager, report_to: hr_contracts.report_to })
      .from(hr_contracts)
      .where(eq(hr_contracts.employee_ref_id, subject.id))
      .orderBy(desc(hr_contracts.created_at))
      .limit(1);

    const rawText = (contract?.report_to || contract?.manager || "").trim();
    if (!rawText) continue; // nothing to backfill from — not treated as an unresolved case

    const matches = (byNormalizedName.get(normalize(rawText)) ?? []).filter(
      (id) => id !== subject.id, // can't be your own manager
    );

    if (matches.length === 1) {
      try {
        await setManager(subject.id, matches[0], { userId: null });
        resolved++;
        continue;
      } catch (err) {
        if (err instanceof CycleError) {
          await recordUnresolved(subject.id, rawText);
          unresolved++;
          continue;
        }
        throw err;
      }
    }

    // Zero or ambiguous (multiple) matches — never guess (MOD-02 §8).
    await recordUnresolved(subject.id, rawText);
    unresolved++;
  }

  logger.info(
    `Backfill complete: ${resolved} resolved, ${unresolved} unresolved, ${skipped} already had a manager`,
  );
  return { resolved, unresolved, skipped };
}
