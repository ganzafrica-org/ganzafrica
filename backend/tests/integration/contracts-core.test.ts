/**
 * MOD-01 contracts on the employees model. Contracts link via `employee_ref_id`, and the
 * DRAFT → ACTIVE transition requires the signed agreement URL.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import { hr_contracts } from "../../src/db/schema";
import {
  listContractsByEmployee,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
} from "../../src/services/hr/contract.service";
import { makeEmployeeUser, ensureRole } from "../factories";

const baseInput = {
  jobTitle: "Analyst",
  department: "Data",
  startDate: new Date("2026-03-02"),
  employmentTerm: "indefinite" as const,
  employmentType: "full-time" as const,
  compensationType: "salaried" as const,
  currency: "RWF",
  employmentAgreementUrl: "https://files.example.com/agreement.pdf",
};

describe("MOD-01 contracts", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
  });

  it("creates a contract linked by employee_ref_id and lists it", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });

    const created = await createContract(employee.id, baseInput);
    expect(created.employeeId).toBe(employee.id);

    const [row] = await db.select().from(hr_contracts).where(eq(hr_contracts.id, created.id));
    expect(row.employee_ref_id).toBe(employee.id);

    const list = await listContractsByEmployee(employee.id);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(created.id);
  });

  it("blocks creating an ACTIVE contract without the agreement URL", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await expect(
      createContract(employee.id, { ...baseInput, employmentAgreementUrl: undefined }),
    ).rejects.toMatchObject({ statusCode: 422, code: "AGREEMENT_URL_REQUIRED" });
  });

  it("allows a DRAFT contract without an agreement, then blocks activating it until one is set", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });

    const draft = await createContract(employee.id, {
      ...baseInput,
      status: "DRAFT",
      employmentAgreementUrl: undefined,
    });
    expect(draft.status).toBe("DRAFT");

    await expect(updateContract(employee.id, draft.id, { status: "ACTIVE" })).rejects.toMatchObject(
      { statusCode: 422, code: "AGREEMENT_URL_REQUIRED" },
    );

    const activated = await updateContract(employee.id, draft.id, {
      status: "ACTIVE",
      employmentAgreementUrl: "https://files.example.com/signed.pdf",
    });
    expect(activated.status).toBe("ACTIVE");
  });

  it("gets, updates, and deletes a contract scoped to its employee", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    const other = await makeEmployeeUser({ employmentType: "staff" });

    const created = await createContract(employee.id, baseInput);

    const fetched = await getContractById(employee.id, created.id);
    expect(fetched.jobTitle).toBe("Analyst");

    // Wrong employee scope → 404, even with a valid contract id.
    await expect(getContractById(other.employee.id, created.id)).rejects.toMatchObject({
      statusCode: 404,
    });

    const updated = await updateContract(employee.id, created.id, { jobTitle: "Senior Analyst" });
    expect(updated.jobTitle).toBe("Senior Analyst");

    await deleteContract(employee.id, created.id);
    await expect(getContractById(employee.id, created.id)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("404s listing contracts for an unknown employee", async () => {
    await expect(
      listContractsByEmployee("00000000-0000-0000-0000-000000000000"),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
