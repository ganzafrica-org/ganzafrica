import { describe, it, expect, beforeEach } from "vitest";
import { Pool } from "pg";
import { resetDb } from "../setup";
import { makeUser, ensureRole } from "../factories";
import { mergeHrUsers } from "../../scripts/migrate-hr-users";
import { db } from "../../src/db/client";
import { hr_users, employees, user_roles, users, roles } from "../../src/db/schema";
import { eq } from "drizzle-orm";

async function insertHrUser(v: {
  first: string;
  last: string;
  personal: string;
  work?: string | null;
  role?: string;
  status?: string;
  platformUserId?: number | null;
  passwordHash?: string;
}) {
  const [row] = await db
    .insert(hr_users)
    .values({
      platform_user_id: v.platformUserId ?? null,
      first_name: v.first,
      last_name: v.last,
      personal_email: v.personal,
      work_email: v.work ?? null,
      password_hash: v.passwordHash ?? "$2a$10$hrhashhrhashhrhashhrhashhrhashhrhashhrhashhr",
      role: (v.role ?? "EMPLOYEE") as "EMPLOYEE" | "HR" | "IT",
      status: (v.status ?? "ACTIVE") as "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "TERMINATED",
      avatar_initials: `${v.first[0]}${v.last[0]}`,
    })
    .returning({ id: hr_users.id });
  return row.id;
}

async function runMerge() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    return await mergeHrUsers(client);
  } finally {
    client.release();
    await pool.end();
  }
}

describe("hr_users → employees merge", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    await ensureRole("hr");
    await ensureRole("admin");
  });

  it("case 1: linked by platform_user_id (hr hash discarded)", async () => {
    const u = await makeUser({ role: "employee", email: "linked@test.local" });
    await insertHrUser({
      first: "Linked",
      last: "User",
      personal: "linked-personal@test.local",
      platformUserId: u.id,
      passwordHash: "$2a$10$DIFFERENThrhashDIFFERENThrhashDIFFERENThr",
    });

    const report = await runMerge();
    expect(report.linked_by_platform_id).toBe(1);

    const emp = await db.select().from(employees).where(eq(employees.user_id, u.id));
    expect(emp).toHaveLength(1);

    const usr = await db.select().from(users).where(eq(users.id, u.id));
    expect(usr[0].password_hash).not.toContain("DIFFERENT"); // original users hash preserved
  });

  it("case 2: linked by matching email — existing users password wins", async () => {
    const u = await makeUser({
      role: "employee",
      email: "match@test.local",
      password: "OrigPass1!",
    });
    const origHash = (await db.select().from(users).where(eq(users.id, u.id)))[0].password_hash;
    await insertHrUser({
      first: "Match",
      last: "User",
      personal: "match-personal@test.local",
      work: "match@test.local",
      passwordHash: "$2a$10$HRWINSHRWINSHRWINSHRWINSHRWINSHRWINSHRWINS",
    });

    const report = await runMerge();
    expect(report.linked_by_email).toContain("match@test.local");

    const usr = await db.select().from(users).where(eq(users.id, u.id));
    expect(usr[0].password_hash).toBe(origHash);
  });

  it("case 3: no user — creates users row copying the hr bcrypt hash", async () => {
    const hrHash = "$2a$10$CREATEDCREATEDCREATEDCREATEDCREATEDCREATED";
    await insertHrUser({
      first: "New",
      last: "Hire",
      personal: "newhire@test.local",
      work: "newhire@test.local",
      passwordHash: hrHash,
    });

    const report = await runMerge();
    expect(report.created).toContain("newhire@test.local");

    const usr = await db.select().from(users).where(eq(users.email, "newhire@test.local"));
    expect(usr).toHaveLength(1);
    expect(usr[0].password_hash).toBe(hrHash);

    const empRoles = await db
      .select({ name: roles.name })
      .from(user_roles)
      .innerJoin(roles, eq(user_roles.role_id, roles.id))
      .where(eq(user_roles.user_id, usr[0].id));
    expect(empRoles.map((r) => r.name)).toContain("employee");
  });

  it("is idempotent — running twice makes no duplicate employees/users", async () => {
    await insertHrUser({
      first: "Idem",
      last: "Potent",
      personal: "idem@test.local",
      work: "idem@test.local",
    });
    await runMerge();
    await runMerge();

    const usr = await db.select().from(users).where(eq(users.email, "idem@test.local"));
    expect(usr).toHaveLength(1);
    const emp = await db.select().from(employees).where(eq(employees.user_id, usr[0].id));
    expect(emp).toHaveLength(1);
  });
});
