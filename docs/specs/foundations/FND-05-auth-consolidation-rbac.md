# FND-05: Auth Consolidation + RBAC (employees table, role/permission activation)

> **Status:** Ready
> **Track:** A
> **Depends on:** FND-02, FND-04
> **Blocks:** FND-06, FND-07, MOD-01/02/03/06, LCM-01/02, REC-02/05
> **Branch:** `feat/fnd-05-auth-rbac` (schema slice ships earlier as `feat/fnd-05a-employees-schema`)
> **Target state:** docs/architecture/auth-and-rbac.md

## 1. Goal

One identity (`users`), real RBAC (permissions enforced, not just role names), and a proper
`employees` profile table replacing `hr_users`-as-identity. HR auth itself is retired in
FND-07; this spec builds everything FND-07 cuts over to.

## 2. Context & current state

- Main auth: `backend/src/services/auth.service.ts`, middleware
  `backend/src/middlewares/auth.middleware.ts` — `authenticate` (line 74), `authorize(roles)`
  (line 200, role-NAME check only), `isAdmin` (278), `requireRole` (286). Tables:
  `users` (has legacy `role_id` NOT NULL FK), `roles`, `user_roles`, `permissions`,
  `role_permissions` (both permission tables exist, UNUSED), `sessions`.
- HR auth (to be retired): `hr_users` (uuid PK, own bcrypt hash, role enum EMPLOYee/IT/HR,
  `platform_user_id` nullable unique FK → users.id) + `hr_otps` —
  `backend/src/db/schema/hr/employee.ts`; service `services/hr/hr.auth.service.ts`;
  middleware `middlewares/hr/hr.auth.middleware.ts` (`authenticateHr`).
- `hr_contracts.employee_id` → `hr_users.id` (uuid). Other hr_* tables (leaves, assets
  `assigned_to_id`, documents, helpdesk, notifications) also reference `hr_users.id`.
- Roles seeded today: admin/team/public (`src/db/migrations/01_create_roles.ts` — archived by
  FND-02; re-seed below). Constants: `backend/src/config/constants.ts` ROLES/BASE_ROLES.
- `payrolls.user_id` → users.id (KEEP — never rekey).

## 3. Schema changes (one drizzle migration + one seed script)

### 3a. `employees` — new file `backend/src/db/schema/hr/employees.ts`

```ts
export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: integer("user_id").notNull().unique().references(() => users.id),
  legacy_hr_user_id: uuid("legacy_hr_user_id").unique(), // audit trail of the migration; drop later
  employee_number: text("employee_number").unique(),
  work_email: text("work_email").unique(),
  personal_email: text("personal_email"),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  phone: text("phone"),
  picture: text("picture"),
  citizenship: text("citizenship"),
  home_country: text("home_country"),
  home_city: text("home_city"),
  department: text("department"),
  job_title: text("job_title"),
  manager_id: uuid("manager_id").references((): AnyPgColumn => employees.id, { onDelete: "set null" }),
  employment_type: text("employment_type").notNull().default("staff"),
    // 'fellow' | 'analyst' | 'staff' | 'contractor' | 'intern' — CHECK constraint
  status: text("status").notNull().default("active"),
    // 'onboarding' | 'active' | 'on_leave' | 'offboarding' | 'exited' — CHECK constraint
  hired_at: date("hired_at"),
  exited_at: date("exited_at"),
  ...timestampFields,
});
```

### 3b. Repoint HR tables (expand/contract — this migration is EXPAND only)

Add nullable `employee_id uuid REFERENCES employees(id)` columns alongside the existing
hr_users FKs on: `hr_contracts`, `hr_leaves` (`user_id`), `hr_assets` (`assigned_to_id`),
`hr_documents` (`created_by_id`), `hr_policies` (`created_by_id`), `hr_helpdesk_tickets`,
`hr_notifications`/`hr_notification_preferences`. Old columns stay until FND-07 (contract phase).

### 3c. Roles & permissions seed — `backend/scripts/seed-rbac.ts` (idempotent upserts)

- Roles: `admin, director, hr, finance, program_manager, staff, fellow, analyst, mentor,
  alumni, employee, public` (upsert by name; keep existing ids).
- Permissions + role_permissions: the full catalog from `auth-and-rbac.md` §3 — the script
  contains the matrix as data (`{resource, action, roles: [...]}[]`). Fix the permissions
  tables first if needed: `permissions.id` / `role_permissions.id` are plain integer PKs
  (schema/roles.ts lines 43–60) — convert to `serial` in the same migration.
- `role_permissions` unique index on (role_id, permission_id).

## 4. Backend code

### 4a. `requirePermission` — add to `backend/src/middlewares/auth.middleware.ts`

```ts
requirePermission(perm: `${string}:${string}`)
```
- Runs after `authenticate`. Loads the user's permission set:
  `user_roles → role_permissions → permissions` as `Set<"resource:action">`,
  cached in-memory `Map<userId, {perms, expires}>` for 60s (export `clearPermissionCache(userId)`
  — called on role changes and by tests).
- `admin` role short-circuits to allow.
- Deny → `403 {"message": ERROR_MESSAGES.FORBIDDEN}`.
- `authorize()` / `isAdmin` / `requireRole` remain untouched (removed in FND-07).

### 4b. hr_users merge script — `backend/scripts/migrate-hr-users.ts` (idempotent, run once per env)

For each `hr_users` row, in a transaction:
1. **Linked** (`platform_user_id` set) → upsert `employees` with `user_id = platform_user_id`.
   HR password hash discarded.
2. **Unlinked, email matches** (`work_email` or `personal_email` = some `users.email`,
   case-insensitive) → link to that user. `users.password_hash` WINS — never overwritten.
   Record in the report.
3. **No user** → create `users` row: email = work_email ?? personal_email,
   name = "first last", `password_hash` COPIED from hr_users (both bcrypt — portable),
   `email_verified = true`, legacy `role_id` = the `employee` role id.
- Always: map hr role → user_roles (`HR`→hr, `IT`→admin, `EMPLOYEE`→employee) + everyone
  gets `employee`; copy profile fields into `employees`; set `legacy_hr_user_id`;
  backfill the new `employee_id` columns from §3b by joining through `legacy_hr_user_id`;
  map hr status (`ACTIVE`→active, `ON_LEAVE`→on_leave, `INACTIVE`/`TERMINATED`→exited).
- Output: `migration-report.json` — counts per case, list of case-2 email conflicts, any
  rows with neither email (fail loudly, fix data by hand, rerun).
- Send each migrated case-2/case-3 person the "logins unified" email (template in §4c) —
  behind `--send-emails` flag so dry runs stay silent.

### 4c. Notification email

Via existing `services/email.service.ts` (Resend): subject "Your GanzAfrica login has moved";
body: portal URL, "use your existing portal password" (case 2) / "use your existing HR
password" (case 3), password-reset link for the stuck. Plain inline HTML like existing templates.

### 4d. Route mapping

Produce `docs/architecture/route-permissions.md`: a table of EVERY route in
`backend/src/routes/**` → its target middleware chain (`authenticate` + `requirePermission(x)`
or public), generated by walking the route files. Apply `requirePermission` to the NON-HR
routes in this spec (payroll → `payroll:manage`, users admin → etc.); HR routes keep
`authenticateHr` until FND-07 (the table marks them "FND-07").

## 5. Frontend

None in this spec (portal/hr UI changes come with FND-06/07). Exception: nothing breaks —
`authorize` behavior for existing routes is preserved.

## 6. Tests to write FIRST

Backend integration:
1. seed-rbac idempotency: run twice → same row counts.
2. `requirePermission("payroll:manage")`: finance user → 200; staff-only user → 403;
   admin → 200; anonymous → 401.
3. Permission cache: role change + `clearPermissionCache` → next request reflects it.
4. Merge script case 1/2/3 fixtures (3 hr_users variants + 1 conflicting users row):
   correct linking, password precedence (case-2 user keeps ORIGINAL users hash — assert hash
   unchanged), roles granted, employees rows complete, report content.
5. Merge idempotency: run twice → no duplicates (unique constraints hold).
6. hr_leaves/hr_contracts `employee_id` backfilled correctly through legacy_hr_user_id.
7. Characterization: existing `/auth/login` + one `authorize`-guarded route behave identically
   before/after (regression net).

## 7. Acceptance criteria

- [ ] `employees` exists, populated from hr_users on dev + prod (report reviewed, zero unexplained conflicts).
- [ ] All 12 roles + full permission catalog seeded; `role_permissions` matches auth-and-rbac.md §3 exactly.
- [ ] `requirePermission` live on payroll + admin routes; behavior of untouched routes unchanged.
- [ ] Case-2/3 users received the notification email (prod run with --send-emails).
- [ ] No authorization decision anywhere reads `users.role_id` (grep proves it; legacy column still present).
- [ ] Migration report archived in the PR.

## 8. Edge cases

- hr_user with BOTH emails matching DIFFERENT users → fail loudly in report; resolve by hand.
- Duplicate work_email across hr_users (unique in schema, but personal_email fallback may
  collide with another's work_email) → report + manual.
- Case-3 user later "registers" on portal with same email → existing unique constraint on
  users.email already prevents; they must password-reset.
- `users.role_id` NOT NULL: script sets it (display only) — the `employee` role id.
- Deactivated hr_users (`TERMINATED`): still migrated (history needs them), `users.is_active=false`
  unless they already had an active portal account.

## 9. Out of scope

Deleting hr_users/authenticateHr/OTP (FND-07); cookies/SSO (FND-06); manager_id backfill
from contract free text (MOD-02); org-chart endpoints (MOD-02).

## 10. Rollout

Ship 3a+3b+3c early as the "schema slice" PR (unblocks Track B's MOD-01). The merge script
runs on prod during a low-traffic window AFTER the schema slice deploys and BEFORE FND-06/07.
HR app keeps working on hr_users auth throughout — nothing user-facing changes yet.
