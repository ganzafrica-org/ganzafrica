# COLLEAGUE-03: Employees Core (directory, detail, profiles, contracts)

> **Spec:** [MOD-01-employees-core](../specs/modules/MOD-01-employees-core.md) — read fully first,
> plus the target-state doc [auth-and-rbac.md](../architecture/auth-and-rbac.md).
> **Depends on:** FND-05 **schema slice** merged (the `employees` table + `employee_id`
> columns). Track A ships it early in wave 1 — you'll be pinged. Until then: COLLEAGUE-01/02.
> **Branch:** `feat/mod-01-employees` off `dev`
> **Estimated size:** XL (this is the big one)

## What you are building

The employees module on the NEW `employees` table (not hr_users): a real directory with
filters, a full detail page with tabs (profile, contracts, assets, documents, leave),
manual employee creation that auto-creates/links the platform `users` account, and the
strict split between HR-editable fields (job_title, department, status, …) and
self-editable fields (phone, picture, personal_email, …) — enforced server-side, reflected
in both the HR UI and the self profile page.

## Where things are

- New truth: `employees` table (FND-05 §3a — uuid PK, `user_id`→users, `manager_id` self-FK,
  `employment_type`, `status`, profile fields, `legacy_hr_user_id` mapping to old hr_users rows).
- Your existing employee/contract v0.1: routes/controllers/services under `backend/src/*/hr/`,
  `apps/hr/src/app/employees/`, `components/sections/sheets/add-employee-sheet.tsx`,
  `add-contract-sheet.tsx`, `src/services/employees.service.ts` (path mismatch `/employees`
  → `/hr/employees`), `src/hooks/useEmployees.ts`.
- **The one seam that matters**: resolve "current employee" ONLY through the helper
  described in MOD-01 §2 (`getEmployeeForHrPrincipal` via `legacy_hr_user_id` now;
  Track A swaps its internals at FND-07). Never scatter hr_users lookups.
- User-account creation on manual add: call `linkOrCreateUserForEmployee` — Track A
  extracts it from the FND-05 merge script; if it isn't exported yet when you need it,
  ping Track A rather than reimplementing.

## Steps

1. Read MOD-01 §4 — implement the endpoint table exactly: directory
   (search/filters/pagination/sort), POST create, GET detail (+contract summary + counts),
   PATCH with the two exclusive field sets, `GET /hr/me`, `PATCH /hr/me/profile`,
   contracts nested endpoints with the DRAFT→ACTIVE guard (agreement URL required).
2. Tests FIRST: MOD-01 §6 items 1–5. The field-set test (item 2) is table-driven:
   every field × (self|hr) × expected (200|422).
3. Directory page: real data table, filter chips, status badges (colors in spec §5),
   pagination, empty/loading/error.
4. Detail page with tabs. Assets/Documents/Leave tabs are thin embeds of the other
   modules' components (yours from COLLEAGUE-01/02; leave read-only summary until MOD-06) —
   if a component isn't extractable yet, render the summary counts + a link.
5. Rework `add-employee-sheet.tsx` → 2 steps (profile+type, optional contract); DELETE the
   OTP/credentials step entirely (accounts are automatic now).
6. Wire `app/profile/page.tsx` to `/hr/me` + `PATCH /hr/me/profile` (self-set only;
   HR-owned fields shown read-only with "contact HR" hint).
7. Frontend tests (§6 items 6–8) + manual e2e walkthrough in the PR.

## Tests to write first

MOD-01 §6 items 1–8 verbatim.

## Acceptance criteria

MOD-01 §7 — all five boxes. Watch the last one: FND-07 must only need to touch the single
`getEmployeeFor*` seam in your module — that's the definition of done for the transition
design.

## Coordination warnings

- Do NOT edit `users`/`roles` tables or auth middleware — Track A territory.
- Status `exited` is set only by offboarding (LCM-02): your PATCH rejects it (422) — test covers it.
- MOD-02 (your next ticket) adds manager validation — leave `manager_id` editing OUT of this
  ticket's PATCH (a read-only manager display is fine).
- Onboarding/Offboarding tabs: render only when the LCM APIs respond (404-tolerant embed).
