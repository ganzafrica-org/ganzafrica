/**
 * Migrates hr_users into the unified identity model: every hr_user becomes a `users` row (if it
 * isn't one already) plus an `employees` profile, and the new employee_id FK columns across the
 * HR tables are backfilled via legacy_hr_user_id. Idempotent; run once per environment.
 *
 * Password precedence: an existing users hash is NEVER overwritten. Cases:
 *   1. hr_user.platform_user_id set        → link to that user (hr hash discarded)
 *   2. email matches an existing users.email → link to that user (users hash wins)
 *   3. no matching user                     → create user, copying the hr bcrypt hash
 *
 * Flags: --send-emails sends the "login unified" notice to case-2/3 people (default: dry, silent).
 * Writes migration-report.json.
 */
import { Pool } from "pg";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SEND_EMAILS = process.argv.includes("--send-emails");

const HR_ROLE_TO_USER_ROLE: Record<string, string> = {
  HR: "hr",
  IT: "admin",
  EMPLOYEE: "employee",
};
const HR_STATUS_TO_EMPLOYEE_STATUS: Record<string, string> = {
  ACTIVE: "active",
  ON_LEAVE: "on_leave",
  INACTIVE: "exited",
  TERMINATED: "exited",
};

interface HrUser {
  id: string;
  platform_user_id: number | null;
  first_name: string;
  last_name: string;
  personal_email: string;
  work_email: string | null;
  phone: string | null;
  picture: string | null;
  citizenship: string | null;
  home_country: string | null;
  home_city: string | null;
  password_hash: string;
  role: string;
  status: string;
}

interface Report {
  total: number;
  linked_by_platform_id: number;
  linked_by_email: string[];
  created: string[];
  conflicts: string[];
  no_email: string[];
}

export async function mergeHrUsers(
  client: import("pg").PoolClient,
  opts: { sendEmails?: boolean } = {},
): Promise<Report> {
  const report: Report = {
    total: 0,
    linked_by_platform_id: 0,
    linked_by_email: [],
    created: [],
    conflicts: [],
    no_email: [],
  };
  {
    const { rows: employeeRole } = await client.query<{ id: number }>(
      `SELECT id FROM roles WHERE name = 'employee' LIMIT 1`,
    );
    if (!employeeRole.length) throw new Error("employee role missing — run db:seed:rbac first");
    const employeeRoleId = employeeRole[0].id;

    const { rows: hrUsers } = await client.query<HrUser>(`SELECT * FROM hr_users`);
    report.total = hrUsers.length;

    for (const hr of hrUsers) {
      const email = (hr.work_email ?? hr.personal_email)?.trim().toLowerCase();
      if (!email) {
        report.no_email.push(hr.id);
        continue;
      }

      await client.query("BEGIN");
      try {
        let userId: number;

        if (hr.platform_user_id) {
          userId = hr.platform_user_id;
          report.linked_by_platform_id++;
        } else {
          const { rows: existing } = await client.query<{ id: number }>(
            `SELECT id FROM users WHERE lower(email) = $1 LIMIT 1`,
            [email],
          );
          if (existing.length) {
            userId = existing[0].id;
            report.linked_by_email.push(email);
          } else {
            const { rows: created } = await client.query<{ id: number }>(
              `INSERT INTO users (email, name, role_id, password_hash, email_verified, is_active)
               VALUES ($1, $2, $3, $4, true, $5)
               RETURNING id`,
              [
                email,
                `${hr.first_name} ${hr.last_name}`.trim(),
                employeeRoleId,
                hr.password_hash,
                hr.status !== "TERMINATED" && hr.status !== "INACTIVE",
              ],
            );
            userId = created[0].id;
            report.created.push(email);
          }
        }

        await client.query(
          `INSERT INTO user_roles (user_id, role_id)
           SELECT $1, id FROM roles WHERE name IN ($2, 'employee')
           ON CONFLICT (user_id, role_id) DO NOTHING`,
          [userId, HR_ROLE_TO_USER_ROLE[hr.role] ?? "employee"],
        );

        await client.query(
          `INSERT INTO employees
             (user_id, legacy_hr_user_id, work_email, personal_email, first_name, last_name,
              phone, picture, citizenship, home_country, home_city, employment_type, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'staff',$12)
           ON CONFLICT (user_id) DO UPDATE SET legacy_hr_user_id = EXCLUDED.legacy_hr_user_id`,
          [
            userId,
            hr.id,
            hr.work_email,
            hr.personal_email,
            hr.first_name,
            hr.last_name,
            hr.phone,
            hr.picture,
            hr.citizenship,
            hr.home_country,
            hr.home_city,
            HR_STATUS_TO_EMPLOYEE_STATUS[hr.status] ?? "active",
          ],
        );

        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        report.conflicts.push(`${hr.id} (${email}): ${(err as Error).message}`);
      }
    }

    await backfillEmployeeFks(client);
    if (opts.sendEmails) await sendUnifiedLoginEmails(report);
  }
  return report;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const report = await mergeHrUsers(client, { sendEmails: SEND_EMAILS });
    fs.writeFileSync(
      path.resolve(__dirname, "../migration-report.json"),
      JSON.stringify(report, null, 2),
    );
    console.log(
      `hr_users merge: ${report.total} total | ${report.linked_by_platform_id} linked (platform id) | ` +
        `${report.linked_by_email.length} linked (email) | ${report.created.length} created | ` +
        `${report.conflicts.length} conflicts | ${report.no_email.length} no-email`,
    );
    if (report.conflicts.length || report.no_email.length) {
      console.log("Review migration-report.json — conflicts/no-email rows need manual attention.");
    }
  } finally {
    client.release();
    await pool.end();
  }
}

async function backfillEmployeeFks(client: import("pg").PoolClient) {
  const map: [string, string, string][] = [
    ["hr_leaves", "user_id", "employee_id"],
    ["hr_leaves", "reviewed_by_id", "reviewed_by_employee_id"],
    ["hr_contracts", "employee_id", "employee_ref_id"],
    ["hr_assets", "assigned_to_id", "assigned_to_employee_id"],
    ["hr_asset_maintenance", "requester_id", "requester_employee_id"],
    ["hr_documents", "created_by_id", "created_by_employee_id"],
    ["hr_policies", "created_by_id", "created_by_employee_id"],
    ["hr_helpdesk_tickets", "submitted_by_id", "submitted_by_employee_id"],
    ["hr_helpdesk_tickets", "assigned_to_id", "assigned_to_employee_id"],
  ];
  for (const [table, oldCol, newCol] of map) {
    await client.query(
      `UPDATE ${table} t SET ${newCol} = e.id
       FROM employees e WHERE e.legacy_hr_user_id = t.${oldCol} AND t.${newCol} IS NULL`,
    );
  }
}

async function sendUnifiedLoginEmails(report: Report) {
  const { sendEmail } = await import("../src/services/email.service");
  const env = (await import("../src/config/env")).default;
  const recipients = [...report.linked_by_email, ...report.created];
  const portalUrl = env.PORTAL_URL;
  for (const email of recipients) {
    const isCreated = report.created.includes(email);
    const html = `
      <p>Your GanzAfrica login has moved to the central portal.</p>
      <p>Sign in at <a href="${portalUrl}/login">${portalUrl}/login</a> using your
      ${isCreated ? "existing HR" : "existing portal"} password.
      If you can't sign in, use "Forgot password" to reset.</p>`;
    await sendEmail(email, "Your GanzAfrica login has moved", html).catch(() => {});
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error("migrate-hr-users failed:", err.message ?? err);
    process.exit(1);
  });
}
