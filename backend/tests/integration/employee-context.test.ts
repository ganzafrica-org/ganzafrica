import { describe, it, expect, beforeEach } from "vitest";
import { resetDb } from "../setup";
import { makeUser } from "../factories";
import { getEmployeeForUser } from "../../src/services/hr/employee-context";
import { db } from "../../src/db/client";
import { employees } from "../../src/db/schema";

describe("employee-context (FND-07)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("getEmployeeForUser throws EMPLOYEE_PROFILE_MISSING when the user has no profile", async () => {
    const u = await makeUser({ role: "employee" });
    await expect(getEmployeeForUser(u.id)).rejects.toMatchObject({
      statusCode: 404,
      code: "EMPLOYEE_PROFILE_MISSING",
    });
  });

  it("getEmployeeForUser returns the employee + roles when a profile exists", async () => {
    const u = await makeUser({ role: "hr" });
    const [emp] = await db
      .insert(employees)
      .values({ user_id: u.id, first_name: "Jane", last_name: "Doe" })
      .returning();

    const ctx = await getEmployeeForUser(u.id);
    expect(ctx.employeeId).toBe(emp.id);
    expect(ctx.userId).toBe(u.id);
    expect(ctx.roleNames).toContain("hr");
  });
});
