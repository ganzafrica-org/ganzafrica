/**
 * MOD-06 §6.2/§6.3/§6.5 — balance instantiation from policy, request guards, and the
 * approve/cancel effects on used_days. Real DB, real service.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { and, eq } from "drizzle-orm";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import { hr_leave_balances } from "../../src/db/schema";
import {
  ensureBalances,
  requestLeave,
  decideLeave,
  cancelLeaveRequest,
  computeWorkingDays,
} from "../../src/services/hr/leave.service";
import { makeEmployeeUser, makeLeavePolicy, makeHoliday, ensureRole } from "../factories";
import { AppError } from "../../src/middlewares";

const YEAR = 2026;
const d = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

async function balanceFor(employeeId: string, type = "ANNUAL") {
  const [row] = await db
    .select()
    .from(hr_leave_balances)
    .where(
      and(
        eq(hr_leave_balances.employee_id, employeeId),
        eq(hr_leave_balances.year, YEAR),
        eq(hr_leave_balances.type, type as never),
      ),
    )
    .limit(1);
  return row;
}

describe("MOD-06 balances", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
  });

  it("instantiates balances from the policy matching the employee's employment type", async () => {
    await makeLeavePolicy({ employmentType: "fellow", type: "ANNUAL", annualDays: 25 });
    await makeLeavePolicy({ employmentType: "staff", type: "ANNUAL", annualDays: 20 });

    const { employee } = await makeEmployeeUser({ employmentType: "fellow" });
    await ensureBalances(employee.id, YEAR);

    const bal = await balanceFor(employee.id);
    expect(Number(bal.entitled_days)).toBe(25);
    expect(Number(bal.used_days)).toBe(0);
  });

  it("is idempotent — repeated calls do not duplicate or reset balances", async () => {
    await makeLeavePolicy({ employmentType: "staff", type: "ANNUAL", annualDays: 20 });
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });

    await ensureBalances(employee.id, YEAR);
    await db
      .update(hr_leave_balances)
      .set({ used_days: "3" })
      .where(eq(hr_leave_balances.employee_id, employee.id));
    await ensureBalances(employee.id, YEAR);

    const rows = await db
      .select()
      .from(hr_leave_balances)
      .where(eq(hr_leave_balances.employee_id, employee.id));

    expect(rows).toHaveLength(1);
    expect(Number(rows[0].used_days)).toBe(3);
  });

  it("throws when no policy covers the employment type", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "contractor" });
    await expect(ensureBalances(employee.id, YEAR)).rejects.toBeInstanceOf(AppError);
  });

  it("subtracts org holidays from the requested day count", async () => {
    await makeHoliday({ date: "2026-01-07", name: "Test Day" });
    // Mon 01-05 → Fri 01-09 with Wed a holiday.
    await expect(computeWorkingDays(d("2026-01-05"), d("2026-01-09"))).resolves.toBe(4);
  });
});

describe("MOD-06 request guards", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    await makeLeavePolicy({ employmentType: "staff", type: "ANNUAL", annualDays: 20 });
    await makeLeavePolicy({ employmentType: "staff", type: "UNPAID", annualDays: 0 });
  });

  it("rejects a request overlapping an existing pending one with 409", async () => {
    const { user, employee } = await makeEmployeeUser({ employmentType: "staff" });

    await requestLeave(user.id, employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-04"),
      reason: "First",
    });

    await expect(
      requestLeave(user.id, employee.id, {
        type: "ANNUAL",
        startDate: d("2026-03-04"),
        endDate: d("2026-03-06"),
        reason: "Overlaps",
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("rejects a request exceeding the remaining balance with 422", async () => {
    const { user, employee } = await makeEmployeeUser({ employmentType: "staff" });

    await expect(
      requestLeave(user.id, employee.id, {
        type: "ANNUAL",
        startDate: d("2026-02-02"),
        endDate: d("2026-04-30"), // way beyond 20 days
        reason: "Too long",
      }),
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  it("lets UNPAID leave bypass the balance check", async () => {
    const { user, employee } = await makeEmployeeUser({ employmentType: "staff" });

    const leave = await requestLeave(user.id, employee.id, {
      type: "UNPAID",
      startDate: d("2026-02-02"),
      endDate: d("2026-04-30"),
      reason: "Sabbatical",
    });

    expect(leave.status).toBe("PENDING");
  });

  it("rejects a zero-working-day request with 422", async () => {
    const { user, employee } = await makeEmployeeUser({ employmentType: "staff" });

    await expect(
      requestLeave(user.id, employee.id, {
        type: "ANNUAL",
        startDate: d("2026-03-07"), // Saturday
        endDate: d("2026-03-08"), // Sunday
        reason: "Weekend only",
      }),
    ).rejects.toMatchObject({ statusCode: 422 });
  });
});

describe("MOD-06 balance effects", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    await makeLeavePolicy({ employmentType: "staff", type: "ANNUAL", annualDays: 20 });
  });

  it("adds days to used_days on approval and releases them on cancel", async () => {
    const { user, employee } = await makeEmployeeUser({ employmentType: "staff" });
    const hr = await makeEmployeeUser({ role: "hr", employmentType: "staff" });

    const leave = await requestLeave(user.id, employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"), // Mon
      endDate: d("2026-03-04"), // Wed → 3 days
      reason: "Trip",
    });
    expect(Number(leave.days)).toBe(3);

    await decideLeave(hr.user.id, leave.id, "APPROVED");
    expect(Number((await balanceFor(employee.id)).used_days)).toBe(3);

    await cancelLeaveRequest(hr.user.id, leave.id);
    expect(Number((await balanceFor(employee.id)).used_days)).toBe(0);
  });

  it("requires a note when rejecting", async () => {
    const { user, employee } = await makeEmployeeUser({ employmentType: "staff" });
    const hr = await makeEmployeeUser({ role: "hr", employmentType: "staff" });

    const leave = await requestLeave(user.id, employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-03"),
      reason: "Trip",
    });

    await expect(decideLeave(hr.user.id, leave.id, "REJECTED")).rejects.toMatchObject({
      statusCode: 422,
    });

    const rejected = await decideLeave(hr.user.id, leave.id, "REJECTED", "Coverage gap");
    expect(rejected.status).toBe("REJECTED");
    expect(Number((await balanceFor(employee.id)).used_days)).toBe(0);
  });

  it("does not double-count a re-approved request", async () => {
    const { user, employee } = await makeEmployeeUser({ employmentType: "staff" });
    const hr = await makeEmployeeUser({ role: "hr", employmentType: "staff" });

    const leave = await requestLeave(user.id, employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-04"),
      reason: "Trip",
    });

    await decideLeave(hr.user.id, leave.id, "APPROVED");
    await expect(decideLeave(hr.user.id, leave.id, "APPROVED")).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(Number((await balanceFor(employee.id)).used_days)).toBe(3);
  });
});
