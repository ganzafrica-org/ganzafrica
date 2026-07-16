# FND-07: HR App Joins SSO + hr_users Auth Retirement (cutover day)

> **Status:** Ready
> **Track:** A — **coordinated cutover with Track B (merge freeze on backend/src/routes/hr/** that day)**
> **Depends on:** FND-06 (handoff live), FND-05 (merge script has run on prod)
> **Blocks:** MOD-07 (internal absorption starts after), MOD-03
> **Branch:** `feat/fnd-07-hr-sso`

## 1. Goal

The HR app authenticates exclusively through the portal SSO; the entire parallel HR auth
stack (hr_users credentials, OTP registration, hr JWTs, authenticateHr) is deleted; all
`/hr/*` routes run on `authenticate` + `requirePermission`.

## 2. Context & current state

- apps/hr auth today: login form stub (`apps/hr/src/components/auth/login-form.tsx:53` —
  handleSubmit is empty), `src/hooks/useAuth.tsx`, `src/services/auth.service.ts` (posts to
  `/auth/login`, stores tokens in localStorage), `src/services/http.service.ts` (Bearer +
  refresh interceptor), `apps/hr/src/app/api/set-session/route.ts` (+ `auth_session` cookie),
  `apps/hr/middleware.ts` (gates on `auth_session`), `components/auth/social-auth-buttons.tsx`,
  `protected-route.tsx`.
- Backend HR auth: `services/hr/hr.auth.service.ts`, `controllers/hr/hr.auth.controller.ts`,
  `routes/hr/auth.routes.ts` (mounted `/hr/auth` in `routes/hr/index.ts`),
  `middlewares/hr/hr.auth.middleware.ts` (`authenticateHr` + `requireRole`), `hr_otps`.
- Every route file under `backend/src/routes/hr/` imports `authenticateHr`.
- Portal platform-selection has NO HR card; the "HR & Finance" card points at apps/internal
  with the email allowlist.
- HR frontend services call paths like `/employees`, `/leaves` while backend mounts
  `/hr/employees`, `/hr/leave` — fixed here once, centrally.

## 3. Schema changes (contract phase of FND-05 §3b)

One migration: for each hr_* table that got `employee_id` in FND-05 — set NOT NULL where the
old column was NOT NULL, drop the old hr_users FK columns (`hr_leaves.user_id`,
`hr_assets.assigned_to_id` → keep column name `assigned_to_id` but repoint? NO — the new
column is already named `employee_id`/`assigned_employee_id`; drop old), then
`DROP TABLE hr_otps; DROP TABLE hr_users;` **Gate: run only after §7 checklist confirms zero
code references.** `employees.legacy_hr_user_id` stays one more release, then a later
micro-migration drops it.

## 4. Backend

- `routes/hr/index.ts` + every `routes/hr/*.routes.ts`: replace `authenticateHr` /
  hr `requireRole` with `authenticate` + `requirePermission(...)` per the route-permissions
  table (FND-05 §4d — rows marked "FND-07"). Path normalization: rename `/hr/leave` →
  `/hr/leaves` (plural everywhere; keep a 308 redirect alias for one release).
- Delete: hr.auth.service, hr.auth.controller, auth.routes, hr.auth.middleware, OTP logic,
  `HR_ROLES` set. hr services that loaded "current hr_user" now resolve the employee via
  `employees.user_id = req.user.id` — add `getEmployeeForUser(userId)` helper in a new
  `services/hr/employee-context.ts`; 404 → "no employee profile" error code
  `EMPLOYEE_PROFILE_MISSING` (tells admins the merge script missed someone).

## 5. Frontend (apps/hr + portal)

- portal platform-selection: add HR card (visible when roles ∩ {employee, hr, admin} ≠ ∅ —
  auth-and-rbac.md §5); "HR & Finance"/internal card stays until MOD-07 retires it.
- apps/hr: delete login form + social buttons + set-session route + auth.service; login page
  becomes a redirect to portal `?next=<hr url>`; add `/auth-callback` (standard FND-06 §5b
  sequence); `middleware.ts` gates on the SHARED session cookie name (`ganzafrica_auth`) —
  presence check only, API remains the authority; `useAuth` hook reworked to `GET /auth/me`
  via tanstack-query; `http.service.ts` → shared api-client from FND-06 §5c (withCredentials,
  CSRF, 401-refresh-retry).
- Fix ALL service base paths against the normalized backend (`/hr/employees`, `/hr/leaves`,
  `/hr/assets`, `/hr/documents`, `/hr/policies`, `/hr/helpdesk`, `/hr/notifications`) in
  `apps/hr/src/services/*.service.ts` — one env var `NEXT_PUBLIC_API_URL` WITHOUT the `/hr`
  suffix; services own their prefixes explicitly.

## 6. Tests to write FIRST

1. Every `/hr/*` route: anonymous → 401; wrong-permission user → 403; correct → 200 —
   table-driven from route-permissions.md (route, permission, pass-role, fail-role).
2. `getEmployeeForUser`: user without employees row → EMPLOYEE_PROFILE_MISSING error shape.
3. `/hr/leave` → 308 → `/hr/leaves`.
4. Grep-tests (yes, as tests): source contains zero references to `hr_users`, `authenticateHr`,
   `hr_otps` outside migrations (script test in backend/tests).
5. E2E: portal login as employee-role user → HR card visible → click → HR dashboard renders
   (no login form ever); hr-role user sees admin nav, employee-role user doesn't (spot check
   one admin route: direct visit → 403 page).
6. Frontend unit: useAuth against MSW /auth/me (roles drive nav visibility).

## 7. Acceptance criteria

- [ ] HR app has NO password form anywhere; entering via portal works for hr/admin/employee roles (e2e green).
- [ ] `hr_users` + `hr_otps` dropped on prod; migration report from FND-05 reconciled (every former hr_user can log in).
- [ ] Path mismatches gone: HR app pages (assets, leaves, policies, employees, documents, helpdesk) all load real data.
- [ ] Route-permissions table: every /hr route row flipped from "FND-07" to done.
- [ ] Cutover-day freeze honored: Track B merged nothing into routes/hr that day; their next rebase is conflict-free on middleware imports only.

## 8. Edge cases

- Employee whose merge missed them: EMPLOYEE_PROFILE_MISSING surfaces a friendly "contact HR"
  screen in apps/hr, not a crash.
- hr-role user who is not themselves an employee (e.g. external admin): HR-management pages
  work without an employees row — only self-service pages need the profile.
- In-flight OTP registrations at cutover: none expected (registration was HR-driven);
  announce cutover to HR staff a day ahead.
- apps/hr `auth_session` cookie lingering in browsers: middleware ignores unknown cookies; no cleanup needed.

## 9. Out of scope

apps/internal retirement + payroll move (MOD-07); employee CRUD UI (MOD-01); onboarding-driven
user creation (REC-05/LCM-01).

## 10. Rollout

Single cutover deploy (backend route swap + apps/hr new build together), low-traffic window,
Track B freeze agreed in advance. Revert = redeploy previous images (schema contract step §3
runs a few days AFTER the cutover proves stable, as its own migration).
