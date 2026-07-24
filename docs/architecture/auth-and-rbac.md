# Auth & RBAC — Target Architecture

> Source of truth for FND-05/06/07 and every spec that names a role or permission.
> Current-state analysis lives in the specs; this doc describes the END state.

## 1. One identity

- `users` (backend/src/db/schema/users.ts) is the only identity table. One row per person,
  one password (bcrypt), one email.
- `hr_users` stops being an auth table. Its profile data moves to the new `employees` table
  (keyed `user_id → users.id`, see FND-05 §3). `hr_users`, `hr_otps`, the HR JWT service
  (`backend/src/services/hr/hr.auth.service.ts`), and `authenticateHr` middleware are deleted
  at the end of FND-07.
- The portal (`apps/portal`) is the ONLY login UI. Every other app (hr, alumni, task, web-admin)
  receives sessions via the SSO handoff (see `sso-flow.md`). App-local login pages redirect to
  the portal with a `?next=` parameter.

## 2. Roles

Seeded into `roles` (backend/src/db/schema/roles.ts). A user can hold MANY roles via
`user_roles`; `users.role_id` remains as a legacy "primary role" display column only —
no authorization decision may read it.

| Role              | Who                                    | Notes                                                                            |
| ----------------- | -------------------------------------- | -------------------------------------------------------------------------------- |
| `admin`           | System administrators                  | Full access. Replaces hr_users `IT`                                              |
| `director`        | Directors                              | Org-wide read, approvals above managers                                          |
| `hr`              | HR staff                               | Full HR-suite management                                                         |
| `finance`         | Finance staff                          | Payroll management (replaces `NEXT_PUBLIC_INTERNAL_AUTHORIZED_EMAILS` allowlist) |
| `program_manager` | Program managers                       | Manages fellows/analysts in their programs                                       |
| `staff`           | Regular employees (non-fellow/analyst) |                                                                                  |
| `fellow`          | Fellows                                | Auto-qualifies for `alumni` at offboarding                                       |
| `analyst`         | Analysts                               | Auto-qualifies for `alumni` at offboarding                                       |
| `mentor`          | Mentors                                | Existing role, unchanged                                                         |
| `alumni`          | Alumni-network members                 | Grants access to apps/alumni                                                     |
| `employee`        | EVERY current employee                 | Base role: self-service HR views. Granted at hire, revoked at offboarding        |
| `public`          | Existing seeded role                   | Unchanged (public site)                                                          |

Mapping from legacy: hr_users.role `HR`→`hr`, `IT`→`admin`, `EMPLOYEE`→`employee`;
constants `ROLES.STAFF`→`staff` etc. (full mapping table in FND-05 §10).

## 3. Permissions

`permissions` rows are `resource:action` pairs; `role_permissions` links them.
Enforcement middleware: `requirePermission("payroll:manage")` (FND-05 §4) — resolves the
user's roles → permissions with a 60-second in-memory cache keyed by user id.
The legacy `authorize([roleNames])` stays as a shim during migration and is removed in FND-07.

Permission catalog (seed list — FND-05 §3 has the full seed script):

| Resource                               | Actions                        | Granted to (beyond admin)                                                                                            |
| -------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `employees`                            | `read`, `manage`               | read: hr, director, program_manager; manage: hr                                                                      |
| `employees_self`                       | `read`, `update`               | employee (own row only — enforced in service by `user_id = session.user_id`)                                         |
| `org_chart`                            | `read`                         | employee (everyone sees the chart)                                                                                   |
| `contracts`                            | `read`, `manage`               | hr                                                                                                                   |
| `payroll`                              | `manage`                       | finance, hr                                                                                                          |
| `payroll_self`                         | `read`                         | employee (own payslips)                                                                                              |
| `leave`                                | `manage`, `approve`            | manage: hr; approve: hr + the employee's manager (relationship check in service)                                     |
| `leave_self`                           | `read`, `request`              | employee                                                                                                             |
| `assets`                               | `read`, `manage`               | read: employee (own assigned); manage: hr, admin                                                                     |
| `documents`                            | `read`, `manage`               | read: per-document ACL; manage: hr                                                                                   |
| `policies`                             | `read`, `manage`               | read: employee; manage: hr                                                                                           |
| `recruitment`                          | `read`, `manage`               | hr, director (read)                                                                                                  |
| `processes` (onboarding + offboarding) | `read_own`, `manage`           | read_own: the subject employee; manage: hr; task-assignees can complete their own tasks (row-level check in service) |
| `helpdesk`                             | `create`, `manage`             | create: employee; manage: hr, admin                                                                                  |
| `performance`                          | `read_own`, `manage`, `review` | manage: hr; review: managers for their reports                                                                       |
| `events`                               | `read`, `manage`               | read: employee; manage: hr                                                                                           |
| `alumni`                               | `access`                       | alumni, admin                                                                                                        |
| `reports`                              | `read`                         | hr, finance, director                                                                                                |

Ownership rules ("own row", "their reports") are enforced in the service layer, not the
middleware — the middleware answers "may this role class do this action at all".

## 4. Alumni qualification rule

- Every employee may be granted `alumni`.
- At offboarding completion (LCM-02): if `employees.employment_type ∈ {fellow, analyst}`
  → `alumni` role inserted automatically; otherwise the offboarding instance's
  `grant_alumni` boolean (set by HR, default false) decides.
- `users.is_active` stays true for exited employees who hold `alumni`; set false otherwise.
- Alumni can also be granted manually any time by hr/admin (existing alumni routes).

## 5. App access matrix (drives portal platform-selection cards)

| App            | Requirement                                                                  |
| -------------- | ---------------------------------------------------------------------------- |
| portal         | `admin`, `hr`, `finance`, `director`, `program_manager` (managers-and-up UI) |
| hr (`apps/hr`) | `employee` OR `hr` OR `admin` — everyone employed sees at least self-service |
| alumni         | `alumni` OR `admin`                                                          |
| task           | any authenticated with `employee`/`fellow`/`analyst`/`staff`/`admin`         |
| internal       | RETIRED after MOD-07 (was: email allowlist)                                  |
| web            | public                                                                       |

## 6. Sessions

- Backend owns sessions (`sessions` table). Cookies per `sso-flow.md`: httpOnly,
  `domain=.ganzafrica.org` in prod, `sameSite=lax`, secure.
- Access JWT 24h, refresh 30d with rotation + 60s grace window (FND-06 §4).
- Single logout: revoking the session row + clearing domain cookies logs out all apps.
- Offboarding completion and account-lock revoke ALL of a user's sessions immediately.

## 7. Hard rules

1. No authorization decision reads `users.role_id` — always `user_roles`.
2. No tokens in URLs, no tokens/user JSON in localStorage — cookies only (FND-06).
3. Passwords: bcrypt only, never log, never silently overwrite an existing `users` hash
   during migration (FND-05 §7 conflict policy).
4. New endpoints MUST declare `requirePermission(...)` — no bare `authenticate`.
