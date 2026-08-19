/**
 * MOD-01 §6 — the employees directory, detail, and the field-set split that stops an employee
 * promoting themselves or HR clobbering personal fields.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { and, eq } from "drizzle-orm";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import {
  employees,
  process_instances,
  process_tasks,
  hr_contracts,
  users,
  user_roles,
  roles,
} from "../../src/db/schema";
import {
  listEmployees,
  getEmployeeDetail,
  createEmployee,
  updateEmployeeAsHr,
  updateMyProfile,
  getMyEmployeeRecord,
  listDepartments,
  deactivateEmployee,
  reactivateEmployee,
} from "../../src/services/hr/employees-core.service";
import {
  makeUser,
  makeEmployee,
  makeEmployeeUser,
  makeContract,
  makeProcessTemplate,
  ensureRole,
} from "../factories";
import { AppError } from "../../src/middlewares";

describe("MOD-01 directory", () => {
  let hrUserId: number;

  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    hrUserId = (await makeUser({ role: "hr" })).id;
  });

  async function seedDirectory() {
    const specs = [
      { firstName: "Ada", department: "Engineering", status: "active", employmentType: "staff" },
      { firstName: "Bea", department: "Engineering", status: "on_leave", employmentType: "fellow" },
      { firstName: "Cid", department: "Programs", status: "active", employmentType: "analyst" },
      { firstName: "Dot", department: "Programs", status: "onboarding", employmentType: "staff" },
    ];
    for (const s of specs) {
      const u = await makeUser({ role: "employee" });
      await makeEmployee({ userId: u.id, ...s });
    }
  }

  it("paginates and reports totals", async () => {
    await seedDirectory();
    const page1 = await listEmployees({ limit: 2, page: 1 });
    expect(page1.data).toHaveLength(2);
    expect(page1.total).toBe(4);
    expect(page1.pages).toBe(2);

    const page2 = await listEmployees({ limit: 2, page: 2 });
    expect(page2.data).toHaveLength(2);
  });

  it("filters by department, status, and employment type", async () => {
    await seedDirectory();
    expect((await listEmployees({ department: "Engineering" })).total).toBe(2);
    expect((await listEmployees({ status: "active" })).total).toBe(2);
    expect((await listEmployees({ employment_type: "fellow" })).total).toBe(1);
  });

  it("searches across name and email", async () => {
    await seedDirectory();
    const byName = await listEmployees({ search: "Ada" });
    expect(byName.total).toBe(1);
    expect(byName.data[0].first_name).toBe("Ada");
  });

  it("sorts by name ascending and descending", async () => {
    await seedDirectory();
    const asc = await listEmployees({ sortBy: "name", sortOrder: "asc" });
    const desc = await listEmployees({ sortBy: "name", sortOrder: "desc" });
    expect(asc.data[0].first_name).toBe("Ada");
    expect(desc.data[0].first_name).toBe("Dot");
  });

  it("attaches manager and account info", async () => {
    const manager = await makeEmployeeUser({ firstName: "Manny", employmentType: "staff" });
    const report = await makeEmployeeUser({
      firstName: "Reba",
      employmentType: "staff",
      managerId: manager.employee.id,
    });

    const list = await listEmployees({ search: "Reba" });
    const row = list.data[0];
    expect(row.manager?.first_name).toBe("Manny");
    expect(row.account?.email).toBe(report.user.email);
  });

  it("surfaces the ACTIVE contract's currency as contract_currency, batched (no N+1)", async () => {
    const withActive = await makeEmployeeUser({ firstName: "Kesi", employmentType: "staff" });
    await makeContract({ employeeId: withActive.employee.id, currency: "KES", status: "ACTIVE" });
    const withDraftOnly = await makeEmployeeUser({
      firstName: "Draftonly",
      employmentType: "staff",
    });
    await makeContract({ employeeId: withDraftOnly.employee.id, currency: "UGX", status: "DRAFT" });
    await makeEmployeeUser({ firstName: "Nocontract", employmentType: "staff" });

    const list = await listEmployees({ search: "" });
    const byName = (n: string) => list.data.find((r) => r.first_name === n);
    expect(byName("Kesi")?.contract_currency).toBe("KES");
    expect(byName("Draftonly")?.contract_currency).toBeNull();
    expect(byName("Nocontract")?.contract_currency).toBeNull();
  });

  it("lists distinct departments", async () => {
    await seedDirectory();
    expect((await listDepartments()).sort()).toEqual(["Engineering", "Programs"]);
  });
});

describe("MOD-01 field-set enforcement", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
  });

  it("lets HR edit HR-owned fields", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    const updated = await updateEmployeeAsHr(employee.id, {
      job_title: "Senior Analyst",
      department: "Data",
    });
    expect(updated.job_title).toBe("Senior Analyst");
    expect(updated.department).toBe("Data");
  });

  it("rejects HR editing a self-owned field (422 naming the offender)", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await expect(
      updateEmployeeAsHr(employee.id, { job_title: "X", phone: "0700" }),
    ).rejects.toMatchObject({ statusCode: 422, code: "FIELD_NOT_EDITABLE" });
  });

  it("rejects HR setting a lifecycle status it does not own", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await expect(updateEmployeeAsHr(employee.id, { status: "exited" })).rejects.toMatchObject({
      statusCode: 422,
      code: "STATUS_NOT_SETTABLE",
    });
    await expect(updateEmployeeAsHr(employee.id, { status: "offboarding" })).rejects.toMatchObject({
      statusCode: 422,
    });
    // active / on_leave are allowed.
    expect((await updateEmployeeAsHr(employee.id, { status: "on_leave" })).status).toBe("on_leave");
  });

  it("lets an employee edit their own personal fields, and reads them back on detail", async () => {
    const { user, employee } = await makeEmployeeUser({ employmentType: "staff" });
    const updated = await updateMyProfile(user.id, { phone: "0788123456", home_city: "Kigali" });
    expect(updated.phone).toBe("0788123456");
    expect(updated.home_city).toBe("Kigali");
    // Unchanged HR field.
    const [row] = await db.select().from(employees).where(eq(employees.id, employee.id));
    expect(row.status).toBe("active");

    // The self-editable fields must round-trip through the detail/me response, not just the DB row.
    const detail = await getEmployeeDetail(user.id, employee.id);
    expect(detail.phone).toBe("0788123456");
    expect(detail.home_city).toBe("Kigali");
  });

  it("rejects an employee editing an HR-owned field", async () => {
    const { user } = await makeEmployeeUser({ employmentType: "staff" });
    await expect(updateMyProfile(user.id, { job_title: "CEO" })).rejects.toMatchObject({
      statusCode: 422,
      code: "FIELD_NOT_EDITABLE",
    });
  });

  it("stops an employee being set as their own manager", async () => {
    const { employee } = await makeEmployeeUser({ employmentType: "staff" });
    await expect(
      updateEmployeeAsHr(employee.id, { manager_id: employee.id }),
    ).rejects.toMatchObject({ statusCode: 422, code: "SELF_MANAGED" });
  });
});

describe("MOD-01 detail and access", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
  });

  it("returns detail with contract summary shape and counts", async () => {
    const hr = await makeEmployeeUser({ role: "hr", employmentType: "staff" });
    const subject = await makeEmployeeUser({ employmentType: "staff" });

    const detail = await getEmployeeDetail(hr.user.id, subject.employee.id);
    expect(detail.id).toBe(subject.employee.id);
    expect(detail.counts).toEqual({ assets: 0, open_leave: 0, documents: 0 });
    expect(detail.contract).toBeNull();
  });

  it("lets an employee read their own detail but not another's", async () => {
    const a = await makeEmployeeUser({ employmentType: "staff" });
    const b = await makeEmployeeUser({ employmentType: "staff" });

    await expect(getEmployeeDetail(a.user.id, a.employee.id)).resolves.toBeTruthy();
    await expect(getEmployeeDetail(a.user.id, b.employee.id)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("lets HR read anyone's detail", async () => {
    const hr = await makeEmployeeUser({ role: "hr", employmentType: "staff" });
    const other = await makeEmployeeUser({ employmentType: "staff" });
    await expect(getEmployeeDetail(hr.user.id, other.employee.id)).resolves.toBeTruthy();
  });

  it("returns the caller's own record with roles from getMyEmployeeRecord", async () => {
    const { user } = await makeEmployeeUser({ employmentType: "staff" });
    const me = await getMyEmployeeRecord(user.id);
    expect(me.roles).toContain("employee");
  });

  it("404s detail for an unknown employee", async () => {
    const hr = await makeEmployeeUser({ role: "hr", employmentType: "staff" });
    await expect(
      getEmployeeDetail(hr.user.id, "00000000-0000-0000-0000-000000000000"),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("MOD-01 manual create with user linking", () => {
  let hrUserId: number;

  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    hrUserId = (await makeUser({ role: "hr" })).id;
    await makeProcessTemplate({
      createdBy: hrUserId,
      employmentTypes: null,
      tasks: [
        { title: "Sign employment contract", kind: "contract_signing", is_blocking: true },
        { title: "Welcome", kind: "checklist" },
      ],
    });
  });

  it("creates a fresh users account with the employee role", async () => {
    const created = await createEmployee(
      {
        first_name: "New",
        last_name: "Hire",
        personal_email: "new.hire@example.com",
        job_title: "Analyst",
        department: "Data",
        employment_type: "analyst",
      },
      hrUserId,
    );

    expect(created.status).toBe("pending");

    const [account] = await db.select().from(users).where(eq(users.email, "new.hire@example.com"));
    expect(account).toBeTruthy();

    const roleRows = await db
      .select({ name: roles.name })
      .from(user_roles)
      .innerJoin(roles, eq(user_roles.role_id, roles.id))
      .where(eq(user_roles.user_id, account.id));
    expect(roleRows.map((r) => r.name)).toContain("employee");
  });

  it("links to an existing account without touching its password", async () => {
    const existing = await makeUser({ email: "reuse@example.com", role: "staff" });
    const [before] = await db.select().from(users).where(eq(users.id, existing.id));

    const created = await createEmployee(
      {
        first_name: "Reuse",
        last_name: "Account",
        personal_email: "reuse@example.com",
      },
      hrUserId,
    );

    const [linked] = await db.select().from(employees).where(eq(employees.id, created.id));
    expect(linked.user_id).toBe(existing.id);

    const [after] = await db.select().from(users).where(eq(users.id, existing.id));
    expect(after.password_hash).toBe(before.password_hash);

    // No duplicate account was created.
    const accounts = await db.select().from(users).where(eq(users.email, "reuse@example.com"));
    expect(accounts).toHaveLength(1);
  });

  it("409s on a duplicate employee email", async () => {
    await createEmployee(
      {
        first_name: "First",
        last_name: "Person",
        personal_email: "dup@example.com",
      },
      hrUserId,
    );
    await expect(
      createEmployee(
        {
          first_name: "Second",
          last_name: "Person",
          personal_email: "dup@example.com",
        },
        hrUserId,
      ),
    ).rejects.toMatchObject({ statusCode: 409, code: "EMPLOYEE_EMAIL_TAKEN" });
  });

  it("instantiates the default onboarding process, snapshotting its tasks (incl. contract_signing)", async () => {
    const created = await createEmployee(
      {
        first_name: "Ona",
        last_name: "Boarding",
        personal_email: "ona.boarding@example.com",
        employment_type: "staff",
      },
      hrUserId,
    );

    const [instance] = await db
      .select()
      .from(process_instances)
      .where(
        and(
          eq(process_instances.employee_id, created.id),
          eq(process_instances.type, "onboarding"),
        ),
      );
    expect(instance).toBeTruthy();
    expect(instance.status).toBe("in_progress");

    const tasks = await db
      .select()
      .from(process_tasks)
      .where(eq(process_tasks.instance_id, instance.id));
    expect(tasks.map((t) => t.title)).toEqual(
      expect.arrayContaining(["Sign employment contract", "Welcome"]),
    );
    expect(tasks.find((t) => t.title === "Sign employment contract")?.kind).toBe(
      "contract_signing",
    );
  });

  it("rolls back the whole creation when no active onboarding template applies", async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    hrUserId = (await makeUser({ role: "hr" })).id;
    // No template seeded this time.

    await expect(
      createEmployee(
        {
          first_name: "No",
          last_name: "Template",
          personal_email: "no.template@example.com",
        },
        hrUserId,
      ),
    ).rejects.toMatchObject({ statusCode: 422, code: "TEMPLATE_UNAVAILABLE" });

    // Nothing survives: no employee, no linked user.
    expect(await db.select().from(employees)).toHaveLength(0);
    const accounts = await db
      .select()
      .from(users)
      .where(eq(users.email, "no.template@example.com"));
    expect(accounts).toHaveLength(0);
  });
});

describe("MOD-01 deactivate/reactivate employee (replaces the old hard delete)", () => {
  let hrUserId: number;

  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    hrUserId = (await makeUser({ role: "hr" })).id;
  });

  it("deactivates the employee and their account, without touching the row or their contract", async () => {
    const { user, employee } = await makeEmployeeUser({ employmentType: "staff" });
    await makeContract({ employeeId: employee.id });

    await deactivateEmployee(employee.id, hrUserId);

    const [row] = await db.select().from(employees).where(eq(employees.id, employee.id));
    expect(row).toBeTruthy(); // still exists — this is reversible, not a delete
    expect(row.is_active).toBe(false);
    expect(
      await db.select().from(hr_contracts).where(eq(hr_contracts.employee_ref_id, employee.id)),
    ).toHaveLength(1); // contract history untouched

    const [account] = await db.select().from(users).where(eq(users.id, user.id));
    expect(account.is_active).toBe(false); // login blocked
  });

  it("reactivate flips both employee and account back to active", async () => {
    const { user, employee } = await makeEmployeeUser({ employmentType: "staff" });
    await deactivateEmployee(employee.id, hrUserId);

    await reactivateEmployee(employee.id);

    const [row] = await db.select().from(employees).where(eq(employees.id, employee.id));
    expect(row.is_active).toBe(true);
    const [account] = await db.select().from(users).where(eq(users.id, user.id));
    expect(account.is_active).toBe(true);
  });

  it("404s deactivating/reactivating an unknown employee", async () => {
    const badId = "00000000-0000-0000-0000-000000000000";
    await expect(deactivateEmployee(badId, hrUserId)).rejects.toMatchObject({ statusCode: 404 });
    await expect(reactivateEmployee(badId)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("refuses to let HR deactivate their own employee record", async () => {
    const employee = await makeEmployee({ userId: hrUserId, employmentType: "staff" });
    await expect(deactivateEmployee(employee.id, hrUserId)).rejects.toMatchObject({
      statusCode: 422,
      code: "SELF_DEACTIVATE",
    });
  });

  it("directory: hides deactivated employees by default, surfaces them under ?active=inactive|all", async () => {
    const { employee: activeOne } = await makeEmployeeUser({
      firstName: "Ada",
      employmentType: "staff",
    });
    const { employee: inactiveOne } = await makeEmployeeUser({
      firstName: "Grace",
      employmentType: "staff",
    });
    await deactivateEmployee(inactiveOne.id, hrUserId);

    const defaultList = await listEmployees({});
    expect(defaultList.data.map((r) => r.id)).toEqual([activeOne.id]);

    const inactiveList = await listEmployees({ active: "inactive" });
    expect(inactiveList.data.map((r) => r.id)).toEqual([inactiveOne.id]);

    const allList = await listEmployees({ active: "all" });
    expect(allList.data.map((r) => r.id).sort()).toEqual([activeOne.id, inactiveOne.id].sort());
  });
});
