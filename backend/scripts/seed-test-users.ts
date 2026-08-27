/**
 * Seed a small set of ready-to-use dummy login accounts, across the roles that matter for
 * manual testing in the browser. Self-registration via the portal (POST /auth/register)
 * always defaults to the "public" role with no employees row — it CANNOT produce an
 * account that can log into apps/hr, because the app access matrix requires employee/hr/
 * admin (see docs/architecture/auth-and-rbac.md §5). This script bypasses that by writing
 * users + user_roles + employees rows directly, the same way the test factories do.
 *
 * Idempotent: re-running upserts by email rather than erroring on duplicates.
 *
 * Usage:  DATABASE_URL=... pnpm db:seed:test-users
 *
 * Login at http://localhost:3001 (the portal) with any of the emails below — password is
 * the same for all of them, printed at the end of the run.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";
import path from "path";
import * as schema from "../src/db/schema";
import { hashPassword } from "../src/services/auth.service";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const PASSWORD = "Test1234!";

const ACCOUNTS: {
  email: string;
  name: string;
  roleName: string;
  makeEmployee: boolean;
  employmentType?: string;
}[] = [
  { email: "admin@test.local", name: "Ada Admin", roleName: "admin", makeEmployee: true },
  { email: "hr@test.local", name: "Hana HR", roleName: "hr", makeEmployee: true },
  {
    email: "employee@test.local",
    name: "Eli Employee",
    roleName: "employee",
    makeEmployee: true,
    employmentType: "staff",
  },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  const passwordHash = await hashPassword(PASSWORD);

  try {
    for (const account of ACCOUNTS) {
      const role = await db
        .select()
        .from(schema.roles)
        .where(eq(schema.roles.name, account.roleName))
        .limit(1);

      if (!role.length) {
        console.warn(
          `Role "${account.roleName}" not found — run \`pnpm db:seed:rbac\` first. Skipping ${account.email}.`,
        );
        continue;
      }
      const roleId = role[0].id;

      const existing = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, account.email))
        .limit(1);

      let userId: number;
      if (existing.length) {
        userId = existing[0].id;
        await db
          .update(schema.users)
          .set({ password_hash: passwordHash, role_id: roleId, is_active: true })
          .where(eq(schema.users.id, userId));
        console.log(`Updated existing user ${account.email} (id ${userId})`);
      } else {
        const [inserted] = await db
          .insert(schema.users)
          .values({
            email: account.email,
            name: account.name,
            role_id: roleId,
            password_hash: passwordHash,
            email_verified: true,
            is_active: true,
          })
          .returning();
        userId = inserted.id;
        console.log(`Created user ${account.email} (id ${userId})`);
      }

      await db
        .insert(schema.user_roles)
        .values({ user_id: userId, role_id: roleId })
        .onConflictDoNothing();

      // A real hr/admin account is also a current employee (auth-and-rbac.md §2: "employee:
      // EVERY current employee ... Granted at hire") and so should hold "employee" too — it's
      // the sole grant behind org_chart:read and other everyone-sees-this permissions. Without
      // this, hr@test.local 403s on GET /hr/org-chart despite being able to manage it.
      if (account.makeEmployee && account.roleName !== "employee") {
        const [employeeRole] = await db
          .select()
          .from(schema.roles)
          .where(eq(schema.roles.name, "employee"))
          .limit(1);
        if (employeeRole) {
          await db
            .insert(schema.user_roles)
            .values({ user_id: userId, role_id: employeeRole.id })
            .onConflictDoNothing();
        }
      }

      if (account.makeEmployee) {
        const existingEmployee = await db
          .select()
          .from(schema.employees)
          .where(eq(schema.employees.user_id, userId))
          .limit(1);

        if (!existingEmployee.length) {
          const [nameFirst, ...nameRest] = account.name.split(" ");
          await db.insert(schema.employees).values({
            user_id: userId,
            first_name: nameFirst,
            last_name: nameRest.join(" ") || "Test",
            employment_type: account.employmentType ?? "staff",
            status: "active",
            department: "Programs",
          });
          console.log(`  + employees row for ${account.email}`);
        }
      }
    }

    console.log(`\nDone. Log in at http://localhost:3001 with any of:\n`);
    for (const a of ACCOUNTS) console.log(`  ${a.email}  (${a.roleName})`);
    console.log(`\nPassword for all of them: ${PASSWORD}`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
