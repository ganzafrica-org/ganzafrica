/**
 * MOD-01 contracts HTTP surface. Regression coverage for a validation bug found during the
 * MOD-01 audit: contract.validation.ts's status enum was missing "DRAFT", so a DRAFT contract
 * could be created at the service layer (tested in contracts-core.test.ts) but never through the
 * real POST/PATCH routes — the request would 400 before reaching the service.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares/auth.middleware";
import { makeEmployee, ensureRole } from "../factories";

async function contractsApiFor(employeeId: string) {
  return `/api/hr/employees/${employeeId}/contracts`;
}

const baseBody = {
  jobTitle: "Analyst",
  department: "Data",
  startDate: new Date("2026-03-02").toISOString(),
  employmentTerm: "indefinite" as const,
  employmentType: "full-time" as const,
  compensationType: "salaried" as const,
  currency: "RWF",
};

describe("MOD-01 contracts API", () => {
  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    await ensureRole("employee");
    await ensureRole("hr");
    await grant("hr", "contracts", "read");
    await grant("hr", "contracts", "manage");
  });

  it("accepts a DRAFT contract over HTTP without an agreement URL", async () => {
    const hr = await loginAs("hr");
    const employee = await makeEmployee({ userId: hr.user.id, employmentType: "staff" });
    const api = await contractsApiFor(employee.id);

    const created = await hr.agent.post(api).send({ ...baseBody, status: "DRAFT" });
    expect(created.status).toBe(201);
    expect(created.body.status).toBe("DRAFT");
  });

  it("rejects HR setting TERMINATED directly over HTTP (LCM-02 only)", async () => {
    const hr = await loginAs("hr");
    const employee = await makeEmployee({ userId: hr.user.id, employmentType: "staff" });
    const api = await contractsApiFor(employee.id);

    const created = await hr.agent
      .post(api)
      .send({ ...baseBody, employmentAgreementUrl: "https://files.example.com/a.pdf" });
    expect(created.status).toBe(201);

    const terminated = await hr.agent
      .patch(`${api}/${created.body.id}`)
      .send({ status: "TERMINATED" });
    expect(terminated.status).toBe(422);
    expect(terminated.body.message ?? terminated.body.code).toBeTruthy();
  });
});
