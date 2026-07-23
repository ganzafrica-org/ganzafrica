/**
 * MOD-06 §8 — year-boundary carry-over. The year is a parameter rather than read from the clock,
 * so these assert real numbers without freezing time.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { and, eq } from "drizzle-orm";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import { hr_leave_balances } from "../../src/db/schema";
import {
  applyCarryOver,
  backfillBalances,
  ensureBalances,
} from "../../src/services/hr/leave-core.service";
import { makeEmployeeUser, makeLeavePolicy, ensureRole } from "../factories";

const FROM = 2026;
const TO = 2027;

async function balance(employeeId: string, year: number, type = "ANNUAL") {
  const [row] = await db
    .select()
    .from(hr_leave_balances)
    .where(
      and(
        eq(hr_leave_balances.employee_id, employeeId),
        eq(hr_leave_balances.year, year),
        eq(hr_leave_balances.type, type as never),
      ),
    )
    .limit(1);
  return row;
}

describe("MOD-06 carry-over", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await makeLeavePolicy({
      employmentType: "staff",
      type: "ANNUAL",
      annualDays: 20,
      maxCarryOver: 5,
    });
  });

  it("carries unused days forward, capped at max_carry_over", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await ensureBalances(employee.id, FROM);
    // Used 2 of 20 → 18 remaining, but the cap is 5.
    await db
      .update(hr_leave_balances)
      .set({ used_days: "2" })
      .where(eq(hr_leave_balances.employee_id, employee.id));

    await applyCarryOver(FROM);

    expect(Number((await balance(employee.id, TO)).carried_over_days)).toBe(5);
  });

  it("carries the exact remainder when it is under the cap", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await ensureBalances(employee.id, FROM);
    await db
      .update(hr_leave_balances)
      .set({ used_days: "17" }) // 3 remaining, cap 5
      .where(eq(hr_leave_balances.employee_id, employee.id));

    await applyCarryOver(FROM);

    expect(Number((await balance(employee.id, TO)).carried_over_days)).toBe(3);
  });

  it("carries nothing when the balance is fully used", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await ensureBalances(employee.id, FROM);
    await db
      .update(hr_leave_balances)
      .set({ used_days: "20" })
      .where(eq(hr_leave_balances.employee_id, employee.id));

    await applyCarryOver(FROM);

    const next = await balance(employee.id, TO);
    expect(next == null || Number(next.carried_over_days) === 0).toBe(true);
  });

  it("is idempotent — a second run does not stack carry-over", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await ensureBalances(employee.id, FROM);
    await db
      .update(hr_leave_balances)
      .set({ used_days: "18" }) // 2 remaining
      .where(eq(hr_leave_balances.employee_id, employee.id));

    await applyCarryOver(FROM);
    await applyCarryOver(FROM);

    expect(Number((await balance(employee.id, TO)).carried_over_days)).toBe(2);
  });

  it("skips exited employees", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff", status: "exited" });
    await ensureBalances(employee.id, FROM);

    const { carried } = await applyCarryOver(FROM);
    expect(carried).toBe(0);
  });

  it("backfills balances for active employees only", async () => {
    await makeEmployeeUser({ employmentType: "staff" });
    await makeEmployeeUser({ employmentType: "staff" });
    await makeEmployeeUser({ employmentType: "staff", status: "exited" });

    const { processed } = await backfillBalances(FROM);
    expect(processed).toBe(2);
  });

  it("skips employment types with no policy rather than failing the run", async () => {
    await makeEmployeeUser({ employmentType: "staff" });
    await makeEmployeeUser({ employmentType: "contractor" }); // no policy seeded

    const { processed } = await backfillBalances(FROM);
    expect(processed).toBe(1);
  });
});
