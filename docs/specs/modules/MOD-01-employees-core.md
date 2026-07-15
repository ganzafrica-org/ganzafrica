# MOD-01: Employees Core (directory, detail, profiles, contracts tab)

> **Status:** Ready
> **Track:** B (ticket COLLEAGUE-03)
> **Depends on:** FND-05 schema slice (`employees` table live). NOT blocked by the full auth cutover — build against `authenticateHr` now; FND-07 swaps middleware imports only.
> **Blocks:** MOD-02, MOD-03, MOD-06, LCM-01/02 UI hooks
> **Branch:** `feat/mod-01-employees`

## 1. Goal

The employees module becomes real: a filterable directory, a full employee detail page
(profile, contract tab, assets/documents/leave summaries), HR-editable vs self-editable
fields clearly split, and creation flows (manual add for legacy staff; REC-05 handles
future hires automatically).

## 2. Context & current state

- Frontend: `apps/hr/src/app/employees/page.tsx` + subpages (department/, documents/,
  performance/, attendance/, org-chart/, recruitment/ — the latter two owned by MOD-02/REC-03);
  `components/sections/sheets/add-employee-sheet.tsx` (3-step create targeting hr_users);
  hooks `src/hooks/useEmployees.ts`, service `src/services/employees.service.ts`
  (path-mismatch: calls `/employees`, backend is `/hr/employees`).
- Backend: `routes/hr/employee(s).routes.ts` (verify filename), `controllers/hr/`,
  `services/hr/` employee + contract modules (contracts nested `/hr/employees/:id/contracts`)
  — CRUD against `hr_users`/`hr_contracts` exists from commit 1dbeb81.
- New truth: `employees` table (FND-05 §3a — uuid PK, user_id, manager_id, employment_type,
  status, profile fields) + hr_contracts' new `employee_id`.
- **Transition rule for Track B:** write all NEW code against `employees` (join `users` for
  email/name/account state). Where existing hr services read hr_users, refactor them to
  employees as you touch them. The auth principal is still hr_users' JWT until FND-07 —
  resolve "current employee" via `employees.legacy_hr_user_id` (helper
  `getEmployeeForHrPrincipal`, replaced by `getEmployeeForUser` at FND-07; keep both behind
  one exported function so the cutover touches one file).

## 3. Schema changes

None beyond FND-05's (this spec CONSUMES employees). Small additive migration allowed if
gaps emerge (e.g. `employees.bio`, `emergency_contact jsonb`) — keep additive, note in PR.

## 4. API (all under `/hr`, permission names per auth-and-rbac.md; today via authenticateHr + role checks, mechanical swap at FND-07)

| Endpoint | Permission | Behavior |
|---|---|---|
| `GET /hr/employees?search&department&status&employment_type&page&sort` | employees:read | Paged directory; row: id, names, work_email, job_title, department, employment_type, status, manager name, avatar. Sort: name/department/hired_at |
| `POST /hr/employees` | employees:manage | Manual create (legacy staff): profile fields + employment_type + hired_at; creates/link `users` row (same 3-case logic as FND-05 merge — REUSE `backend/scripts/migrate-hr-users.ts`'s core as a service function `linkOrCreateUserForEmployee`) |
| `GET /hr/employees/:id` | employees:read OR self | Full detail + contract summary + counts (assets assigned, open leave, docs) |
| `PATCH /hr/employees/:id` | employees:manage | HR-editable set: job_title, department, employment_type, status (active/on_leave only — exited via LCM-02), work_email, employee_number, hired_at, manager_id (MOD-02 adds validation) |
| `PATCH /hr/me/profile` | authenticate (self) | Self-editable set ONLY: phone, picture, home_city, home_country, personal_email, emergency_contact, bio. Server rejects any other key (422 listing offenders) |
| `GET /hr/me` | authenticate | Own employee record + user info + roles (drives self-service shell, MOD-03) |
| Contracts nested: `GET/POST/PATCH /hr/employees/:id/contracts` | contracts:read/manage | Existing endpoints repointed to employee_id; add status transitions (DRAFT→ACTIVE requires employment_agreement_url; ACTIVE→TERMINATED via LCM-02 only) |

## 5. Frontend

- **Directory `app/employees/page.tsx`:** real data table (tanstack-query + existing table
  components): search debounce, filter chips (department, status, type), pagination, row →
  detail. Status badges (onboarding=blue, active=green, on_leave=amber, offboarding=orange,
  exited=gray). Empty/loading/error states.
- **Detail `app/employees/[id]/page.tsx`:** header (avatar, name, title, department, status,
  manager link) + tabs: **Profile** (field grid; edit per §4 PATCH sets — HR sees edit on
  hr-set, everyone sees read), **Contract** (list + detail from contracts API; add/edit sheet
  reusing `add-contract-sheet.tsx` restyled; agreement URL upload via MOD-05 storage),
  **Assets** (read summary linking MOD-04), **Documents** (MOD-05 filtered to employee),
  **Leave** (balance + recent, links MOD-06), **Onboarding/Offboarding** (instance card when
  one exists — LCM-01/02 GET; renders after those merge, feature-flag by API 404 tolerance).
- **Add employee:** rework `add-employee-sheet.tsx` → 2 steps (profile+type, then optional
  contract) posting to the new endpoints. Delete OTP-credentials step (FND-07 kills OTP;
  account creation is automatic via `linkOrCreateUserForEmployee`).
- **Self profile `app/profile/page.tsx`:** exists — wire to `GET /hr/me` + `PATCH /hr/me/profile`,
  self-editable fields only, others visible read-only with a "contact HR to change" hint.

## 6. Tests to write FIRST

Backend:
1. Directory filters/pagination/sort (fixtures: 25 employees across departments/statuses).
2. Field-set enforcement: self PATCH with `job_title` → 422; HR PATCH with `phone` → 422
   (each set exclusive); HR PATCH status→exited → 422 (LCM-02 only).
3. `POST /hr/employees` reuses user-linking: existing users.email → linked not duplicated;
   fresh → user created with employee role (assert via user_roles).
4. Detail includes contract summary + accurate counts; self can read own, staff cannot read
   others (403), hr can.
5. Contract transitions: ACTIVE without agreement URL → 422.
Frontend:
6. Directory renders/filters (MSW); status badges map correctly.
7. Detail tabs render per role fixture (hr sees edit affordances, employee self doesn't on hr-set).
8. Profile self-edit: disallowed field absent from form payload.
E2E: HR adds a legacy employee → appears in directory → edits department → employee logs in
(post-FND-07: SSO; pre: existing hr auth) → sees own profile, edits phone, cannot edit title.

## 7. Acceptance criteria

- [ ] Directory + detail run on real `employees` data; path mismatches for employees endpoints gone.
- [ ] HR-editable vs self-editable enforced server-side (tests 2 green) and reflected in both UIs.
- [ ] Manual add creates a linked `users` account without touching passwords of existing accounts.
- [ ] Contract tab full CRUD with the status guard.
- [ ] The single `getEmployeeFor*` seam is the only place FND-07 must touch in this module.

## 8. Edge cases

- Employee without user account (data gap): directory renders, detail shows "no account" badge, hr can trigger link/create.
- Duplicate personal/work emails on manual create → 409 with the conflicting employee.
- Unicode names, missing avatar → initials fallback (existing avatar_initials logic moves to a util).
- Big directories: server-side pagination only (no fetch-all).

## 9. Out of scope

Org chart + manager validation (MOD-02), self-service dashboard composition (MOD-03),
role-based nav shell (MOD-03), performance/attendance tabs (MOD-09/12).

## 10. Rollout

Merge behind existing hr auth; verify with HR on staging data; FND-07 swap follows.
