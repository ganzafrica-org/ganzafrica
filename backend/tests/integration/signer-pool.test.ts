/**
 * Designated co-signer pool: an org-wide allowlist HR maintains on settings/signing, independent
 * of any one document — the multi-signer picker on a contract offers only pool members.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { resetDb } from "../setup";
import * as signing from "../../src/services/signing.service";
import { makeUser, makeEmployeeUser, ensureRole } from "../factories";

describe("Designated co-signer pool", () => {
  let hrId: number;

  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    hrId = (await makeUser({ role: "hr" })).id;
  });

  it("is empty by default", async () => {
    expect(await signing.listSignerPool()).toEqual([]);
  });

  it("adding an employee makes them appear in the pool", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await signing.addToSignerPool(employee.id, hrId);

    const pool = await signing.listSignerPool();
    expect(pool).toHaveLength(1);
    expect(pool[0].employeeId).toBe(employee.id);
  });

  it("adding the same employee twice does not duplicate the row", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await signing.addToSignerPool(employee.id, hrId);
    await signing.addToSignerPool(employee.id, hrId);

    expect(await signing.listSignerPool()).toHaveLength(1);
  });

  it("removing an employee takes them out of the pool", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await signing.addToSignerPool(employee.id, hrId);

    await signing.removeFromSignerPool(employee.id);

    expect(await signing.listSignerPool()).toEqual([]);
  });

  it("adding an unknown employee id fails with 404", async () => {
    await expect(
      signing.addToSignerPool("00000000-0000-0000-0000-000000000000", hrId),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
