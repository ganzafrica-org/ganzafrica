/**
 * Idempotent RBAC seed: roles, permissions, and role→permission grants, driven by the catalog
 * in docs/architecture/auth-and-rbac.md §2–§3. Safe to run repeatedly (upserts by natural key,
 * never duplicates). Run on every environment after the FND-05 schema slice.
 *
 * Usage:  DATABASE_URL=... pnpm db:seed:rbac
 *
 * Ownership rules ("own row", "their reports") are enforced in the service layer, not here —
 * this only establishes which role class may perform which resource:action at all.
 */
import { Pool } from "pg";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

// All roles (auth-and-rbac.md §2). `public` pre-exists; upsert keeps its id.
const ROLES: { name: string; description: string }[] = [
  { name: "admin", description: "Full system access" },
  { name: "director", description: "Org-wide read and high-level approvals" },
  { name: "hr", description: "HR suite management" },
  { name: "finance", description: "Payroll and finance" },
  { name: "program_manager", description: "Manages fellows/analysts in their programs" },
  { name: "staff", description: "Regular employee (non-fellow/analyst)" },
  { name: "fellow", description: "Fellow (auto-alumni at offboarding)" },
  { name: "analyst", description: "Analyst (auto-alumni at offboarding)" },
  { name: "mentor", description: "Mentor" },
  { name: "alumni", description: "Alumni-network member" },
  { name: "employee", description: "Base role for every employee: self-service HR" },
  { name: "public", description: "Public website access" },
];

// Permission catalog: resource → action → roles granted (auth-and-rbac.md §3).
// `admin` is granted everything implicitly by requirePermission, but we still seed it so the
// role_permissions table is complete and queryable.
const CATALOG: { resource: string; action: string; roles: string[] }[] = [
  { resource: "employees", action: "read", roles: ["hr", "director", "program_manager"] },
  { resource: "employees", action: "manage", roles: ["hr"] },
  { resource: "employees_self", action: "read", roles: ["employee"] },
  { resource: "employees_self", action: "update", roles: ["employee"] },
  { resource: "org_chart", action: "read", roles: ["employee"] },
  { resource: "contracts", action: "read", roles: ["hr"] },
  { resource: "contracts", action: "manage", roles: ["hr"] },
  { resource: "payroll", action: "manage", roles: ["finance", "hr"] },
  { resource: "payroll_self", action: "read", roles: ["employee"] },
  { resource: "leave", action: "manage", roles: ["hr"] },
  { resource: "leave", action: "approve", roles: ["hr"] }, // manager approval = relationship check in service
  { resource: "leave_self", action: "read", roles: ["employee"] },
  { resource: "leave_self", action: "request", roles: ["employee"] },
  { resource: "assets", action: "read", roles: ["employee"] },
  { resource: "assets", action: "manage", roles: ["hr", "admin"] },
  { resource: "documents", action: "read", roles: ["employee"] }, // per-doc ACL in service
  { resource: "documents", action: "manage", roles: ["hr"] },
  { resource: "signing", action: "manage", roles: ["hr", "admin"] },
  { resource: "policies", action: "read", roles: ["employee"] },
  { resource: "policies", action: "manage", roles: ["hr"] },
  { resource: "recruitment", action: "read", roles: ["hr", "director"] },
  { resource: "recruitment", action: "manage", roles: ["hr"] },
  { resource: "processes", action: "read_own", roles: ["employee"] },
  { resource: "processes", action: "manage", roles: ["hr"] },
  { resource: "helpdesk", action: "create", roles: ["employee"] },
  { resource: "helpdesk", action: "manage", roles: ["hr", "admin"] },
  { resource: "performance", action: "read_own", roles: ["employee"] },
  { resource: "performance", action: "manage", roles: ["hr"] },
  { resource: "performance", action: "review", roles: [] }, // managers via relationship check
  { resource: "events", action: "read", roles: ["employee"] },
  { resource: "events", action: "manage", roles: ["hr"] },
  { resource: "alumni", action: "access", roles: ["alumni", "admin"] },
  { resource: "reports", action: "read", roles: ["hr", "finance", "director"] },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Roles — upsert by name.
    const roleId: Record<string, number> = {};
    for (const r of ROLES) {
      const res = await client.query<{ id: number }>(
        `INSERT INTO roles (name, description) VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
         RETURNING id`,
        [r.name, r.description],
      );
      roleId[r.name] = res.rows[0].id;
    }

    // Permissions — upsert by (resource, action). permissions.id is a plain integer PK with no
    // sequence, so ids are assigned deterministically from the catalog order (stable across runs).
    const permId: Record<string, number> = {};
    CATALOG.forEach((c, i) => (permId[`${c.resource}:${c.action}`] = i + 1));
    for (const c of CATALOG) {
      const key = `${c.resource}:${c.action}`;
      await client.query(
        `INSERT INTO permissions (id, name, resource, action, description)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (resource, action) DO UPDATE SET name = EXCLUDED.name`,
        [permId[key], key, c.resource, c.action, key],
      );
    }

    // Grants — every role in the catalog PLUS admin gets everything. role_permissions.id is also
    // a plain integer PK, so assign ids from a running counter offset past any existing rows.
    const maxRp = await client.query<{ m: number }>(
      `SELECT COALESCE(MAX(id), 0)::int m FROM role_permissions`,
    );
    let nextRpId = maxRp.rows[0].m + 1;
    let grants = 0;
    for (const c of CATALOG) {
      const key = `${c.resource}:${c.action}`;
      const roles = new Set([...c.roles, "admin"]);
      for (const roleName of roles) {
        const rid = roleId[roleName];
        if (!rid) continue;
        const res = await client.query(
          `INSERT INTO role_permissions (id, role_id, permission_id) VALUES ($1, $2, $3)
           ON CONFLICT (role_id, permission_id) DO NOTHING`,
          [nextRpId, rid, permId[key]],
        );
        if (res.rowCount) {
          grants += res.rowCount;
          nextRpId += 1;
        }
      }
    }

    await client.query("COMMIT");
    console.log(
      `RBAC seeded: ${ROLES.length} roles, ${CATALOG.length} permissions, ${grants} new grants.`,
    );
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("seed-rbac failed:", err.message ?? err);
  process.exit(1);
});
