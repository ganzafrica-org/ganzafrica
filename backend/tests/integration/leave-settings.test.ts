/**
 * MOD-06 §4/§6.6 — policy and holiday settings, manual balance adjustment, and the self-service
 * read. Covers the service paths the HTTP suite reaches only indirectly.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { resetDb } from "../setup";
import {
  listPolicies,
  upsertPolicy,
  updatePolicy,
  deletePolicy,
  listHolidays,
  listRelevantHolidays,
  createHoliday,
  deleteHoliday,
  adjustBalance,
  getMyLeave,
  ensureBalances,
  remainingDays,
  cancelLeaveRequest,
  requestLeave,
  decideLeave,
  getLeaveSummary,
} from "../../src/services/hr/leave-core.service";
import { makeEmployeeUser, makeLeavePolicy, ensureRole } from "../factories";

const YEAR = 2026;
const d = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

/** A Monday comfortably in the future — cancellation rules depend on "has it started yet". */
function futureMonday(): Date {
  const day = new Date();
  day.setUTCDate(day.getUTCDate() + 30);
  while (day.getUTCDay() !== 1) day.setUTCDate(day.getUTCDate() + 1);
  return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()));
}

describe("MOD-06 policy settings", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
  });

  it("upserts a policy — a second save updates rather than duplicating", async () => {
    await upsertPolicy({ employment_type: "staff", type: "ANNUAL", annual_days: 18 });
    await upsertPolicy({
      employment_type: "staff",
      type: "ANNUAL",
      annual_days: 22,
      max_carry_over: 6,
    });

    const policies = await listPolicies();
    expect(policies).toHaveLength(1);
    expect(Number(policies[0].annual_days)).toBe(22);
    expect(Number(policies[0].max_carry_over)).toBe(6);
  });

  it("updates and deletes a policy, 404ing on a missing id", async () => {
    const created = await upsertPolicy({
      employment_type: "intern",
      type: "SICK",
      annual_days: 10,
    });

    const updated = await updatePolicy(created.id, { annual_days: 12, max_carry_over: 2 });
    expect(Number(updated.annual_days)).toBe(12);
    expect(Number(updated.max_carry_over)).toBe(2);

    // A patch with no fields still touches updated_at without changing the numbers.
    const untouched = await updatePolicy(created.id, {});
    expect(Number(untouched.annual_days)).toBe(12);

    await deletePolicy(created.id);
    expect(await listPolicies()).toHaveLength(0);

    await expect(updatePolicy(created.id, { annual_days: 5 })).rejects.toMatchObject({
      statusCode: 404,
    });
    await expect(deletePolicy(created.id)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("MOD-06 holidays", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
  });

  it("creates, lists by year, and deletes holidays", async () => {
    await createHoliday({ date: "2026-01-01", name: "New Year" });
    await createHoliday({ date: "2027-01-01", name: "New Year" });

    expect(await listHolidays()).toHaveLength(2);
    const only2026 = await listHolidays(2026);
    expect(only2026).toHaveLength(1);
    expect(only2026[0].name).toBe("New Year");

    await deleteHoliday(only2026[0].id);
    expect(await listHolidays(2026)).toHaveLength(0);
    await expect(deleteHoliday(only2026[0].id)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("renames rather than duplicating when the same date is added twice", async () => {
    await createHoliday({ date: "2026-07-04", name: "Liberation Day" });
    const renamed = await createHoliday({ date: "2026-07-04", name: "Liberation Day (obs.)" });

    expect(renamed.name).toBe("Liberation Day (obs.)");
    expect(await listHolidays(2026)).toHaveLength(1);
  });

  it("a single-country org (no holiday ever tagged) sees every holiday — identical to today's behavior (regression)", async () => {
    await makeEmployeeUser({ employmentType: "staff", homeCountry: "Rwanda" });
    await createHoliday({ date: "2026-01-01", name: "New Year" });
    await createHoliday({ date: "2026-07-01", name: "Independence Day" });

    const relevant = await listRelevantHolidays(2026);
    expect(relevant.map((h) => h.name).sort()).toEqual(["Independence Day", "New Year"]);
  });

  it("a two-country org sees the union: universal holidays plus each represented country's own", async () => {
    await makeEmployeeUser({ employmentType: "staff", homeCountry: "Rwanda" });
    await makeEmployeeUser({ employmentType: "staff", homeCountry: "Kenya" });
    await createHoliday({ date: "2026-01-01", name: "New Year" }); // universal
    await createHoliday({ date: "2026-07-01", name: "Rwanda Independence Day", country: "Rwanda" });
    await createHoliday({ date: "2026-12-12", name: "Kenya Jamhuri Day", country: "Kenya" });
    await createHoliday({ date: "2026-05-25", name: "Ghana Republic Day", country: "Ghana" }); // no employee there

    const relevant = await listRelevantHolidays(2026);
    expect(relevant.map((h) => h.name).sort()).toEqual([
      "Kenya Jamhuri Day",
      "New Year",
      "Rwanda Independence Day",
    ]);
  });
});

describe("MOD-06 balance adjustment and self-service read", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    await makeLeavePolicy({ employmentType: "staff", type: "ANNUAL", annualDays: 20 });
  });

  it("adjusts a balance only with a note", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await ensureBalances(employee.id, YEAR);
    const { balances } = await getMyLeave(employee.id, YEAR);

    await expect(adjustBalance(balances[0].id, { used_days: 4 }, "  ")).rejects.toMatchObject({
      statusCode: 422,
    });

    const adjusted = await adjustBalance(
      balances[0].id,
      { entitled_days: 25, carried_over_days: 3, used_days: 4 },
      "Migrated from Deel",
    );
    expect(Number(adjusted.entitled_days)).toBe(25);
    expect(Number(adjusted.carried_over_days)).toBe(3);
    expect(Number(adjusted.used_days)).toBe(4);
    expect(await remainingDays(employee.id, YEAR, "ANNUAL")).toBe(24);
  });

  it("404s adjusting a balance that does not exist", async () => {
    await expect(adjustBalance(999999, { used_days: 1 }, "note")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("returns zero remaining for a type with no balance row", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    expect(await remainingDays(employee.id, YEAR, "OTHER")).toBe(0);
  });

  it("returns history with empty balances when no policy covers the employee", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "contractor" });

    const { balances, requests } = await getMyLeave(employee.id, YEAR);
    expect(balances).toHaveLength(0);
    expect(requests).toHaveLength(0);
  });
});

describe("MOD-06 cancellation rules", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    await makeLeavePolicy({ employmentType: "staff", type: "ANNUAL", annualDays: 20 });
  });

  it("stops an employee cancelling someone else's leave", async () => {
    const owner = await makeEmployeeUser({ employmentType: "staff" });
    const stranger = await makeEmployeeUser({ employmentType: "staff" });

    const leave = await requestLeave(owner.user.id, owner.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-03"),
    });

    await expect(cancelLeaveRequest(stranger.user.id, leave.id)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("stops the owner cancelling leave that has already started, but HR may", async () => {
    const owner = await makeEmployeeUser({ employmentType: "staff" });
    const hr = await makeEmployeeUser({ role: "hr", employmentType: "staff" });

    const leave = await requestLeave(owner.user.id, owner.employee.id, {
      type: "ANNUAL",
      startDate: d("2020-03-02"), // in the past
      endDate: d("2020-03-03"),
    });

    await expect(cancelLeaveRequest(owner.user.id, leave.id)).rejects.toMatchObject({
      statusCode: 400,
    });

    const cancelled = await cancelLeaveRequest(hr.user.id, leave.id);
    expect(cancelled.status).toBe("CANCELLED");
  });

  it("is a no-op when cancelling an already-cancelled request", async () => {
    const owner = await makeEmployeeUser({ employmentType: "staff" });

    // Must start in the future — an owner cannot cancel leave that has already begun.
    const leave = await requestLeave(owner.user.id, owner.employee.id, {
      type: "ANNUAL",
      startDate: futureMonday(),
      endDate: futureMonday(),
    });

    await cancelLeaveRequest(owner.user.id, leave.id);
    const again = await cancelLeaveRequest(owner.user.id, leave.id);
    expect(again.status).toBe("CANCELLED");
  });

  it("rejects an inverted date range with 422", async () => {
    const owner = await makeEmployeeUser({ employmentType: "staff" });

    await expect(
      requestLeave(owner.user.id, owner.employee.id, {
        type: "ANNUAL",
        startDate: d("2026-03-10"),
        endDate: d("2026-03-02"),
      }),
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  it("404s on an unknown employee and an unknown leave", async () => {
    const owner = await makeEmployeeUser({ employmentType: "staff" });

    await expect(
      requestLeave(owner.user.id, "00000000-0000-0000-0000-000000000000", {
        type: "ANNUAL",
        startDate: d("2026-03-02"),
        endDate: d("2026-03-03"),
      }),
    ).rejects.toMatchObject({ statusCode: 404 });

    await expect(
      decideLeave(owner.user.id, "00000000-0000-0000-0000-000000000000", "APPROVED"),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("lets HR file leave on an employee's behalf", async () => {
    const employee = await makeEmployeeUser({ employmentType: "staff" });
    const hr = await makeEmployeeUser({ role: "hr", employmentType: "staff" });

    const leave = await requestLeave(hr.user.id, employee.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-03"),
      reason: "Filed by HR",
    });

    expect(leave.status).toBe("PENDING");
    expect(leave.employee_id).toBe(employee.employee.id);
  });
});

describe("MOD-06 leave summary (punch-list #8)", () => {
  const NOW = d("2026-03-18"); // Wednesday — week window is Mon 2026-03-16..Sun 2026-03-22

  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    await makeLeavePolicy({ employmentType: "staff", type: "ANNUAL", annualDays: 20 });
  });

  async function approvedLeave(startIso: string, endIso: string) {
    const employee = await makeEmployeeUser({ employmentType: "staff" });
    const hr = await makeEmployeeUser({ role: "hr", employmentType: "staff" });
    const leave = await requestLeave(hr.user.id, employee.employee.id, {
      type: "ANNUAL",
      startDate: d(startIso),
      endDate: d(endIso),
      reason: "summary coverage",
    });
    return decideLeave(hr.user.id, leave.id, "APPROVED");
  }

  it("counts an approved leave inside the current week/month/year window", async () => {
    await approvedLeave("2026-03-16", "2026-03-17"); // Mon-Tue, 2 working days

    const week = await getLeaveSummary("week", NOW);
    expect(week.requestCount).toBe(1);
    expect(week.totalDays).toBe(2);
    expect(week.from).toBe("2026-03-16");
    expect(week.to).toBe("2026-03-22");

    const month = await getLeaveSummary("month", NOW);
    expect(month.requestCount).toBe(1);
    expect(month.totalDays).toBe(2);

    const year = await getLeaveSummary("year", NOW);
    expect(year.requestCount).toBe(1);
    expect(year.totalDays).toBe(2);
  });

  it("boundary: a leave spanning a window edge is counted in the window its range overlaps, with its full days total", async () => {
    // Fri Feb 27 -> Mon Mar 2: crosses the Feb/Mar boundary. Working days: Feb 27, Mar 2 (weekend
    // between excluded) = 2 total, attributed to March in full since the leave overlaps it.
    await approvedLeave("2026-02-27", "2026-03-02");

    const march = await getLeaveSummary("month", NOW);
    expect(march.requestCount).toBe(1);
    expect(march.totalDays).toBe(2);

    // A window that shares no days with the leave at all sees nothing.
    const nextYear = await getLeaveSummary("year", d("2025-06-15"));
    expect(nextYear.requestCount).toBe(0);
    expect(nextYear.totalDays).toBe(0);
  });

  it("only counts APPROVED leave — pending and rejected are excluded", async () => {
    const employee = await makeEmployeeUser({ employmentType: "staff" });
    const hr = await makeEmployeeUser({ role: "hr", employmentType: "staff" });

    await requestLeave(hr.user.id, employee.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-16"),
      endDate: d("2026-03-16"),
      reason: "left pending",
    });

    const rejected = await requestLeave(hr.user.id, employee.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-17"),
      endDate: d("2026-03-17"),
      reason: "will be rejected",
    });
    await decideLeave(hr.user.id, rejected.id, "REJECTED", "no coverage");

    const week = await getLeaveSummary("week", NOW);
    expect(week.requestCount).toBe(0);
    expect(week.totalDays).toBe(0);
  });
});
