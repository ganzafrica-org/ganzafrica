/**
 * Leave-type grants: Maternity/Paternity are opt-in, not a default every employee gets. A toggle
 * (isGenderLeaveEnabled/setGenderLeaveEnabled) makes the two types configurable at all — turning
 * it on creates their policy rows, off removes them — and a per-employee grant (grantLeaveType/
 * revokeLeaveType) is the only thing that actually lets one specific employee request the type.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { and, eq } from "drizzle-orm";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import { hr_leave_balances, hr_leave_policies } from "../../src/db/schema";
import {
  ensureBalances,
  isGenderLeaveEnabled,
  setGenderLeaveEnabled,
  grantLeaveType,
  revokeLeaveType,
  listGrantedEmployees,
  requestLeave,
  decideLeave,
} from "../../src/services/hr/leave-core.service";
import { makeEmployeeUser, makeLeavePolicy, ensureRole } from "../factories";
import { AppError } from "../../src/middlewares";

const YEAR = new Date().getUTCFullYear();
const d = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

async function policyExists(type: "MATERNITY" | "PATERNITY", employmentType = "staff") {
  const [row] = await db
    .select()
    .from(hr_leave_policies)
    .where(
      and(eq(hr_leave_policies.employment_type, employmentType), eq(hr_leave_policies.type, type)),
    )
    .limit(1);
  return !!row;
}

describe("Leave-type grants", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    await makeLeavePolicy({ employmentType: "staff", type: "ANNUAL", annualDays: 18 });
    await makeLeavePolicy({ employmentType: "staff", type: "SICK", annualDays: 15 });
  });

  it("is disabled by default — no policy rows for Maternity/Paternity", async () => {
    expect(await isGenderLeaveEnabled()).toBe(false);
  });

  it("toggling on creates Maternity/Paternity policies for every employment type already configured", async () => {
    await makeLeavePolicy({ employmentType: "fellow", type: "ANNUAL", annualDays: 20 });

    await setGenderLeaveEnabled(true);

    expect(await isGenderLeaveEnabled()).toBe(true);
    expect(await policyExists("MATERNITY", "staff")).toBe(true);
    expect(await policyExists("PATERNITY", "staff")).toBe(true);
    expect(await policyExists("MATERNITY", "fellow")).toBe(true);
  });

  it("toggling off removes the policies but leaves existing grants (and any usage) untouched", async () => {
    await setGenderLeaveEnabled(true);
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await grantLeaveType(employee.id, "MATERNITY", YEAR);

    await setGenderLeaveEnabled(false);

    expect(await isGenderLeaveEnabled()).toBe(false);
    expect(await policyExists("MATERNITY")).toBe(false);
    const [balance] = await db
      .select()
      .from(hr_leave_balances)
      .where(
        and(
          eq(hr_leave_balances.employee_id, employee.id),
          eq(hr_leave_balances.type, "MATERNITY"),
        ),
      );
    expect(balance).toBeTruthy();
  });

  it("ensureBalances does NOT auto-create Maternity/Paternity balances even when enabled, but still creates ANNUAL/SICK", async () => {
    await setGenderLeaveEnabled(true);
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });

    await ensureBalances(employee.id, YEAR);

    const rows = await db
      .select()
      .from(hr_leave_balances)
      .where(eq(hr_leave_balances.employee_id, employee.id));
    const types = rows.map((r) => r.type).sort();
    expect(types).toEqual(["ANNUAL", "SICK"]);
  });

  it("grantLeaveType fails with a clear error when the type isn't enabled yet", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await expect(grantLeaveType(employee.id, "MATERNITY", YEAR)).rejects.toMatchObject({
      statusCode: 422,
      code: "LEAVE_TYPE_NOT_ENABLED",
    });
  });

  it("grantLeaveType refuses to grant if the policy's own days exceed the statutory max (defensive)", async () => {
    await setGenderLeaveEnabled(true);
    // Simulate a hand-edited policy row above the statutory ceiling.
    await db
      .update(hr_leave_policies)
      .set({ annual_days: "200" })
      .where(
        and(
          eq(hr_leave_policies.employment_type, "staff"),
          eq(hr_leave_policies.type, "MATERNITY"),
        ),
      );
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });

    await expect(grantLeaveType(employee.id, "MATERNITY", YEAR)).rejects.toMatchObject({
      statusCode: 422,
      code: "LEAVE_TYPE_EXCEEDS_STATUTORY_MAX",
    });
  });

  it("grantLeaveType creates a balance row using the policy's statutory day count", async () => {
    await setGenderLeaveEnabled(true);
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });

    await grantLeaveType(employee.id, "MATERNITY", YEAR);

    const granted = await listGrantedEmployees("MATERNITY", YEAR);
    expect(granted).toHaveLength(1);
    expect(granted[0].employeeId).toBe(employee.id);
    expect(Number(granted[0].entitledDays)).toBe(84);
  });

  it("requestLeave rejects an ungranted employee with a distinguishing message, not the generic insufficient-balance one", async () => {
    await setGenderLeaveEnabled(true);
    const { user, employee } = await makeEmployeeUser({ employmentType: "staff" });

    await expect(
      requestLeave(user.id, employee.id, {
        type: "MATERNITY",
        startDate: d("2026-03-02"),
        endDate: d("2026-03-03"),
      }),
    ).rejects.toMatchObject({ statusCode: 422, code: "LEAVE_TYPE_NOT_GRANTED" });
  });

  it("a granted employee can submit a request for the type", async () => {
    await setGenderLeaveEnabled(true);
    const { user, employee } = await makeEmployeeUser({ employmentType: "staff" });
    await grantLeaveType(employee.id, "PATERNITY", YEAR);

    const leave = await requestLeave(user.id, employee.id, {
      type: "PATERNITY",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-03"),
    });
    expect(leave.status).toBe("PENDING");
  });

  it("revoke with zero used_days deletes the row entirely", async () => {
    await setGenderLeaveEnabled(true);
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await grantLeaveType(employee.id, "MATERNITY", YEAR);

    await revokeLeaveType(employee.id, "MATERNITY", YEAR);

    const granted = await listGrantedEmployees("MATERNITY", YEAR);
    expect(granted).toHaveLength(0);
  });

  it("revoke after some days are used zeroes entitlement but keeps the row (audit trail)", async () => {
    await setGenderLeaveEnabled(true);
    const { user, employee } = await makeEmployeeUser({ employmentType: "staff" });
    await grantLeaveType(employee.id, "PATERNITY", YEAR);

    const hr = await makeEmployeeUser({ role: "hr", employmentType: "staff" });
    const leave = await requestLeave(user.id, employee.id, {
      type: "PATERNITY",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-03"),
    });
    await decideLeave(hr.user.id, leave.id, "APPROVED");

    await revokeLeaveType(employee.id, "PATERNITY", YEAR);

    const [balance] = await db
      .select()
      .from(hr_leave_balances)
      .where(
        and(
          eq(hr_leave_balances.employee_id, employee.id),
          eq(hr_leave_balances.type, "PATERNITY"),
        ),
      );
    expect(balance).toBeTruthy();
    expect(Number(balance.entitled_days)).toBe(0);
    expect(Number(balance.used_days)).toBeGreaterThan(0);

    // Blocked from requesting more, but the historical usage is intact — not an AppError throw,
    // just a normal insufficient-balance rejection now that entitlement is zero.
    await expect(
      requestLeave(user.id, employee.id, {
        type: "PATERNITY",
        startDate: d("2026-04-02"),
        endDate: d("2026-04-03"),
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
