/**
 * MOD-01 HTTP surface — the field-set split and self-vs-HR access as seen through the real routes
 * and permission middleware.
 */
import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import { eq } from "drizzle-orm";
import app from "../../src/app";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import { roles, user_roles, password_reset_tokens } from "../../src/db/schema";
import { loginAs } from "../helpers/auth";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares/auth.middleware";
import { makeEmployee, makeUser, makeProcessTemplate, ensureRole } from "../factories";

const API = "/api/hr/employees";

async function grantRole(userId: number, roleName: string) {
  const [role] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
  await db.insert(user_roles).values({ user_id: userId, role_id: role.id }).onConflictDoNothing();
}

async function loginAsEmployee(role = "employee") {
  const { agent, user } = await loginAs(role);
  if (role !== "employee") await grantRole(user.id, "employee");
  clearPermissionCache(user.id);
  const employee = await makeEmployee({ userId: user.id, employmentType: "staff" });
  return { agent, user, employee };
}

describe("MOD-01 employees API", () => {
  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    await ensureRole("employee");
    await ensureRole("hr");
    await grant("hr", "employees", "read");
    await grant("hr", "employees", "manage");
    await grant("employee", "employees_self", "read");
  });

  it("requires authentication", async () => {
    expect((await supertest(app).get(API)).status).toBe(401);
  });

  it("restricts the directory to employees:read", async () => {
    const employee = await loginAsEmployee();
    const hr = await loginAsEmployee("hr");

    expect((await employee.agent.get(API)).status).toBe(403);
    expect((await hr.agent.get(API)).status).toBe(200);
  });

  it("creates an employee via HR and lists it", async () => {
    const hr = await loginAsEmployee("hr");
    // createEmployee now instantiates onboarding in the same transaction — needs a template.
    await makeProcessTemplate({ createdBy: hr.user.id, employmentTypes: null });

    const created = await hr.agent.post(API).send({
      first_name: "Grace",
      last_name: "Hopper",
      personal_email: "grace@example.com",
      job_title: "Engineer",
      department: "Engineering",
      employment_type: "staff",
    });
    expect(created.status).toBe(201);
    expect(created.body.employee.status).toBe("onboarding");

    const list = await hr.agent.get(`${API}?search=Grace`);
    expect(list.body.total).toBe(1);
    expect(list.body.data[0].first_name).toBe("Grace");
  });

  it("sends a set-password invite for a newly created account, but not when linking an existing one", async () => {
    const hr = await loginAsEmployee("hr");
    await makeProcessTemplate({ createdBy: hr.user.id, employmentTypes: null });

    const created = await hr.agent.post(API).send({
      first_name: "Ada",
      last_name: "Lovelace",
      personal_email: "ada.invite@example.com",
      employment_type: "staff",
    });
    expect(created.status).toBe(201);

    // sendPasswordReset mints and persists the token before attempting to email it, so the
    // token row is a reliable, email-provider-independent signal that the invite fired.
    const tokens = await db
      .select()
      .from(password_reset_tokens)
      .where(eq(password_reset_tokens.user_id, created.body.employee.user_id));
    expect(tokens).toHaveLength(1);

    // Linking to an existing account (a `users` row with no `employees` row yet — e.g. a former
    // applicant) must NOT touch its password or send an invite.
    const existingUser = await makeUser({ email: "reuse.invite@example.com", role: "staff" });

    const linked = await hr.agent.post(API).send({
      first_name: "Re",
      last_name: "Used",
      personal_email: "reuse.invite@example.com",
      employment_type: "staff",
    });
    expect(linked.status).toBe(201);
    expect(linked.body.employee.user_id).toBe(existingUser.id);

    const tokensForReused = await db
      .select()
      .from(password_reset_tokens)
      .where(eq(password_reset_tokens.user_id, existingUser.id));
    expect(tokensForReused).toHaveLength(0);
  });

  it("enforces the HR field set over HTTP (phone -> 422)", async () => {
    const hr = await loginAsEmployee("hr");
    const subject = await loginAsEmployee();

    const ok = await hr.agent.patch(`${API}/${subject.employee.id}`).send({ job_title: "Lead" });
    expect(ok.status).toBe(200);

    const bad = await hr.agent.patch(`${API}/${subject.employee.id}`).send({ phone: "0700" });
    expect(bad.status).toBe(422);
    expect(bad.body.code).toBe("FIELD_NOT_EDITABLE");
  });

  it("serves /me and enforces the self field set on /me/profile", async () => {
    const subject = await loginAsEmployee();

    const me = await subject.agent.get(`${API}/me`);
    expect(me.status).toBe(200);
    expect(me.body.me.roles).toContain("employee");

    const ok = await subject.agent.patch(`${API}/me/profile`).send({ phone: "0788000111" });
    expect(ok.status).toBe(200);

    const bad = await subject.agent.patch(`${API}/me/profile`).send({ job_title: "CTO" });
    expect(bad.status).toBe(422);
  });

  it("lets an employee read their own detail but 403s on another's", async () => {
    const a = await loginAsEmployee();
    const b = await loginAsEmployee();

    expect((await a.agent.get(`${API}/${a.employee.id}`)).status).toBe(200);
    expect((await a.agent.get(`${API}/${b.employee.id}`)).status).toBe(403);
  });

  it("does not parse /me as a uuid id", async () => {
    const subject = await loginAsEmployee();
    // Would 400 (invalid uuid) if the /:id route shadowed /me.
    expect((await subject.agent.get(`${API}/me`)).status).toBe(200);
  });

  it("lets HR deactivate/reactivate an employee, but 403s a plain employee attempting the same", async () => {
    const hr = await loginAsEmployee("hr");
    const subject = await loginAsEmployee();

    expect((await subject.agent.patch(`${API}/${subject.employee.id}/deactivate`)).status).toBe(
      403,
    );

    // loginAsEmployee also creates HR's own employee row, so the default (active-only) list
    // still has that one row after `subject` is deactivated — not zero.
    const deactivated = await hr.agent.patch(`${API}/${subject.employee.id}/deactivate`);
    expect(deactivated.status).toBe(204);
    // Still viewable directly by id — deactivation hides from the default list, not the record.
    expect((await hr.agent.get(`${API}/${subject.employee.id}`)).status).toBe(200);
    expect((await hr.agent.get(`${API}?active=inactive`)).body.data).toHaveLength(1);
    expect((await hr.agent.get(API)).body.data).toHaveLength(1);

    // Deactivation blocks login (users.is_active = false 401s at POST /api/auth/login).
    const loginAttempt = await subject.agent
      .post("/api/auth/login")
      .send({ email: subject.user.email, password: subject.user.password });
    expect(loginAttempt.status).toBe(401);

    const reactivated = await hr.agent.patch(`${API}/${subject.employee.id}/reactivate`);
    expect(reactivated.status).toBe(204);
    expect((await hr.agent.get(API)).body.data).toHaveLength(2);
  });
});

describe("MOD-01 field-set matrix — every field x {self, hr} x {200, 422}", () => {
  let hrOwnedFields: [string, unknown][];

  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    await ensureRole("employee");
    await ensureRole("hr");
    await grant("hr", "employees", "read");
    await grant("hr", "employees", "manage");
    await grant("employee", "employees_self", "read");

    // manager_id needs a real, distinct employee row to point at (self-management is its own guard).
    const manager = await loginAsEmployee();

    hrOwnedFields = [
      ["first_name", "Zoe"],
      ["last_name", "Zephyr"],
      ["employee_number", `EMP-${Date.now()}`],
      ["work_email", `hr-owned-${Date.now()}@example.com`],
      ["job_title", "Engineer II"],
      ["department", "Ops"],
      ["employment_type", "contractor"],
      ["status", "on_leave"],
      ["manager_id", manager.employee.id],
      ["hired_at", "2020-01-01"],
    ];
  });

  const selfOwnedFields: [string, unknown][] = [
    ["phone", "0788111222"],
    ["picture", "https://cdn.example.com/avatar.png"],
    ["personal_email", `self-owned-${Date.now()}@example.com`],
    ["home_city", "Kigali"],
    ["home_country", "Rwanda"],
    ["citizenship", "Rwandan"],
  ];

  it.each([
    ["first_name"],
    ["last_name"],
    ["employee_number"],
    ["work_email"],
    ["job_title"],
    ["department"],
    ["employment_type"],
    ["status"],
    ["manager_id"],
    ["hired_at"],
  ])("HR-owned field '%s': 200 via HR PATCH, 422 via self PATCH", async (fieldName) => {
    const subject = await loginAsEmployee();
    const hr = await loginAsEmployee("hr");
    const [, value] = hrOwnedFields.find(([f]) => f === fieldName)!;

    const asHr = await hr.agent.patch(`${API}/${subject.employee.id}`).send({ [fieldName]: value });
    expect(asHr.status).toBe(200);

    const asSelf = await subject.agent.patch(`${API}/me/profile`).send({ [fieldName]: value });
    expect(asSelf.status).toBe(422);
    expect(asSelf.body.code).toBe("FIELD_NOT_EDITABLE");
  });

  it.each(selfOwnedFields.map(([f]) => [f]))(
    "self-owned field '%s': 200 via self PATCH, 422 via HR PATCH",
    async (fieldName) => {
      const subject = await loginAsEmployee();
      const hr = await loginAsEmployee("hr");
      const [, value] = selfOwnedFields.find(([f]) => f === fieldName)!;

      const asSelf = await subject.agent.patch(`${API}/me/profile`).send({ [fieldName]: value });
      expect(asSelf.status).toBe(200);

      const asHr = await hr.agent
        .patch(`${API}/${subject.employee.id}`)
        .send({ [fieldName]: value });
      expect(asHr.status).toBe(422);
      expect(asHr.body.code).toBe("FIELD_NOT_EDITABLE");
    },
  );
});
