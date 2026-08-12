/**
 * MOD-01 contracts HTTP surface. Regression coverage for a validation bug found during the
 * MOD-01 audit: contract.validation.ts's status enum was missing "DRAFT", so a DRAFT contract
 * could be created at the service layer (tested in contracts-core.test.ts) but never through the
 * real POST/PATCH routes — the request would 400 before reaching the service.
 */
import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import app from "../../src/app";
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

  it("accepts an hr_documents id (not just a URL) as the agreement reference", async () => {
    const hr = await loginAs("hr");
    const employee = await makeEmployee({ userId: hr.user.id, employmentType: "staff" });
    const api = await contractsApiFor(employee.id);

    const created = await hr.agent.post(api).send({
      ...baseBody,
      employmentAgreementUrl: "11111111-1111-1111-1111-111111111111",
    });
    expect(created.status).toBe(201);
    expect(created.body.employmentAgreementUrl).toBe("11111111-1111-1111-1111-111111111111");
  });
});

describe("MOD-01 self-service contracts (/hr/me/contracts)", () => {
  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    await ensureRole("employee");
    await ensureRole("hr");
    await grant("hr", "contracts", "read");
    await grant("hr", "contracts", "manage");
  });

  it("lets an employee list and read their own contract with no contracts:* grant", async () => {
    const employeeUser = await loginAs("employee");
    const employee = await makeEmployee({ userId: employeeUser.user.id, employmentType: "staff" });
    const hr = await loginAs("hr");
    await hr.agent
      .post(`/api/hr/employees/${employee.id}/contracts`)
      .send({ ...baseBody, status: "DRAFT" });

    const list = await employeeUser.agent.get("/api/hr/me/contracts");
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);

    const single = await employeeUser.agent.get(`/api/hr/me/contracts/${list.body[0].id}`);
    expect(single.status).toBe(200);
    expect(single.body.jobTitle).toBe(baseBody.jobTitle);
  });

  it("does not leak another employee's contract through /hr/me/contracts/:contractId", async () => {
    const a = await loginAs("employee");
    await makeEmployee({ userId: a.user.id, employmentType: "staff" });
    const bUser = await loginAs("employee");
    const employeeB = await makeEmployee({ userId: bUser.user.id, employmentType: "staff" });
    const hr = await loginAs("hr");
    const contractB = await hr.agent
      .post(`/api/hr/employees/${employeeB.id}/contracts`)
      .send({ ...baseBody, status: "DRAFT" });

    const leaked = await a.agent.get(`/api/hr/me/contracts/${contractB.body.id}`);
    expect(leaked.status).toBe(404);
  });

  it("requires authentication for /hr/me/contracts", async () => {
    expect((await supertest(app).get("/api/hr/me/contracts")).status).toBe(401);
  });
});
