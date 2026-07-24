# MOD-03: Employee Self-Service Views ("me" surface + role-based shell)

> **Status:** Ready
> **Track:** B default (reassignable)
> **Depends on:** MOD-01 (`/hr/me`), FND-05/FND-07 (roles in session — pre-cutover, derive from hr auth role)
> **Blocks:** MOD-11 (dashboard reuses widgets)
> **Branch:** `feat/mod-03-self-service`

## 1. Goal

Every employee (fellow, analyst, staff, manager, HR — all of them) opens the HR app and gets
a coherent personal surface: my profile, my leave balance + requests, my payslips, my
assets, my documents/policies to acknowledge, my tasks (onboarding/offboarding/process
assignments). The app shell (nav, guards) renders by role so an employee never sees admin
chrome, a manager additionally sees team items, HR sees management nav.

## 2. Context & current state

- apps/hr nav/sidebar renders one static menu for everyone (find in
  `apps/hr/src/components/` layout/sidebar components).
- Data sources all exist by now: `/hr/me` (MOD-01), leave self endpoints (MOD-06),
  payslips self (MOD-07 §4 `payroll_self`), assets by assignee (MOD-04), documents ACL
  (MOD-05), `/hr/me/tasks` (LCM-01). This spec is mostly frontend composition + the shell.
- Role source: post-FND-07 `GET /auth/me` roles array; pre-cutover map hr JWT role
  (EMPLOYEE→employee, HR→hr, IT→admin) behind one `useRoles()` hook so the cutover is invisible.

## 3. Schema changes

None.

## 4. API

None new — one aggregate exception:
`GET /hr/me/summary` (authenticate): `{leave_balance, open_leave_requests, assigned_assets_count,
pending_acknowledgements, open_tasks, latest_payslip_period}` — one round-trip for the
landing page; each field null-tolerant when its module isn't deployed yet (LEFT JOINs,
try/catch per section — the endpoint never 500s because one module lags).

## 5. Frontend (apps/hr)

- **`useRoles()` + `<RequireRole roles=[...]>` guard component** and a nav config
  (`src/config/nav.ts`): `{item, href, icon, roles: string[]}[]` — single place defining who
  sees what: self-service items (everyone with employee), Team section (managers — has
  direct reports per `/hr/me` flag `is_manager` added to MOD-01's response), Management
  section (hr/admin: employees, recruitment, onboarding, offboarding, payroll(+finance),
  assets-admin, documents-admin, settings). Route-level guards mirror nav (direct URL →
  403 page, friendly).
- **`app/me/page.tsx`** (default post-login landing for non-hr roles): summary cards from
  `/hr/me/summary` — Leave (balance ring + "request" CTA), Payslips (latest + link),
  My assets, My tasks (process assignments), Pending acknowledgements, Profile completeness
  nudge. Onboarding/offboarding banner when status ≠ active (links LCM views).
- **Sub-pages** (thin wrappers over module components, filtered to self): `app/me/leave`,
  `app/me/payslips`, `app/me/assets`, `app/me/documents`. Reuse module components with an
  `employeeId=me` prop — coordinate component extraction with MOD-04/05/06/07 owners.
- **Manager add-on `app/team/page.tsx`** (is_manager): direct reports list (MOD-02 reports
  endpoint) with per-report: pending leave approvals (MOD-06), open tasks, quick links.

## 6. Tests to write FIRST

Frontend:

1. Nav config: employee fixture sees exactly self-service; manager adds Team; hr adds
   Management (snapshot per role).
2. Route guard: employee visiting /employees admin URL → 403 page (not crash/redirect loop).
3. `/me` cards render from MSW summary incl. degraded fields (null payslip → "No payslips yet").
4. Onboarding banner shows iff status onboarding.
   Backend:
5. `/hr/me/summary` shape + null-tolerance (drop one module's tables in fixture → field null,
   200 still).
6. Summary leaks nothing cross-employee (fixture with two employees — counts are mine only).
   E2E: login as seeded fellow → lands on /me → requests leave from the card → sees it pending;
   login as their manager → Team shows the pending approval.

## 7. Acceptance criteria

- [ ] All roles land somewhere sensible: employee→/me, hr/admin→dashboard; no one sees chrome they can't use.
- [ ] /me fully live against real modules (each card links into a working flow).
- [ ] Direct-URL guard: 403 page, logged.
- [ ] Manager Team view works off real reports.

## 8. Edge cases

- User with roles but no employees row (external admin): /me shows an "admin — no employee profile" state, Management nav still works.
- Multiple roles (hr who is also an employee): union of nav; landing = dashboard with a "My stuff" shortcut.
- Newly hired mid-onboarding: /me is their world; Management/Team hidden regardless of future roles.

## 9. Out of scope

Dashboard for HR (MOD-11), notifications center UI (exists — light link only), dark-mode/theme work.

## 10. Rollout

After MOD-01+MOD-06 minimum; cards for not-yet-merged modules render their empty/degraded
state harmlessly (null-tolerant summary makes partial rollout safe).
