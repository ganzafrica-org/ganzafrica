# LCM-02: Offboarding + Alumni Rule

> **Status:** Ready
> **Track:** A
> **Depends on:** LCM-01 (process engine)
> **Blocks:** —
> **Branch:** `feat/lcm-02-offboarding`

## 1. Goal

HR initiates offboarding for an employee: reason + last working day + an instantiated
checklist (asset return, access revocation, knowledge handover, exit interview…), each step
assignable, with the offboardee seeing their own filtered view. Completion: employee
`exited`, all sessions revoked, and the alumni rule applied — fellows/analysts get the
`alumni` role automatically; anyone else if HR ticked `grant_alumni` (the "intern added to
alumni at completion" case the user described).

## 2. Context & current state

- Engine, tables (incl. the offboarding-only columns `offboarding_reason`,
  `last_working_day`, `grant_alumni` on `process_instances`), routes, template builder,
  visibility model: ALL from LCM-01 — this spec extends, it does not duplicate.
- Today: only `userStatusEnum TERMINATED` / `contractStatusEnum TERMINATED` strings and a
  UI-only `apps/hr/src/components/sections/employee/off-boarding.tsx` (local state, no API) +
  archived demo `apps/_archived/main/hr/offboarding/`.
- Session revocation: FND-06's sessions service (`revokeAllSessionsForUser(userId)` — add if
  FND-06 didn't; it's one DELETE + cache clear).
- Alumni role + app access: auth-and-rbac.md §4/§5. Assets: MOD-04 (asset return task kind).

## 3. Schema changes

None new. Add task `kind` values used by offboarding templates: `asset_return`
(side-effect: verify no `hr_assets` rows remain assigned to the employee, else 422 listing
them), `access_revocation` (side-effect on completion: revoke sessions immediately — don't
wait for instance completion), `exit_interview` (plain checklist with notes required).
CHECK constraint/kind list update = one migration line in LCM-01's file if unmerged, else a
tiny migration here.

## 4. API & services

Extends `process.service.ts`:

- `POST /hr/employees/:id/offboard` `{reason, last_working_day, template_id?, grant_alumni?}`
  (`requirePermission("processes:manage")`): 409 if employee already `offboarding`/`exited`
  or has an active offboarding instance; sets `employees.status='offboarding'`; instantiates
  with due dates anchored to `last_working_day` (offsets may be negative = "X days before
  last day" — extend LCM-01 offset semantics: onboarding anchors at start, offboarding at
  last_working_day; template task column meaning documented in the builder UI).
- `PATCH /hr/processes/:id` — HR may toggle `grant_alumni` and adjust `last_working_day`
  any time before completion (event-logged in notes).
- `completeInstance` offboarding hook (overrides LCM-01's):
  1. `employees.status='exited'`, `exited_at=last_working_day`.
  2. **Re-parent direct reports (MOD-02):** for each employee whose `manager_id` is this
     employee, call `org.service.ts`'s `setManager(reportId, thisEmployee.manager_id, {userId:
null})` — a system-triggered call (no HTTP actor), still going through the same cycle
     check (flattening a chain by one level cannot itself introduce a cycle, but the call stays
     uniform with every other write path rather than bypassing it). Run this before step 1 sets
     `status='exited'`, since `setManager`'s own guard rejects assigning an exited employee as a
     manager — reading `thisEmployee.manager_id` first and reassigning reports to it is what
     lets the chain close over the exiting employee instead of leaving them dangling. Until this
     hook runs (or if it's skipped in an older build), MOD-02's `getOrgTree` defensively floats
     an orphaned subtree to the chart root rather than dropping it.
  3. `revokeAllSessionsForUser(user_id)`.
  4. Alumni rule: `employment_type ∈ {fellow, analyst}` OR `grant_alumni` → upsert `alumni`
     into user_roles + welcome-to-alumni email (template incl. alumni app link); else no grant.
  5. Remove `employee` role (self-service access ends).
  6. `users.is_active`: stays true iff user now holds `alumni` (or admin/mentor); else false.
  7. Contract status → TERMINATED (active contract rows for the employee).
  8. Notification to HR + manager.
     All in one transaction except emails (post-commit).
- Offboardee view: same filtered GET as LCM-01 (`/hr/processes/:id` as subject). Employees
  NOT being offboarded see nothing new anywhere (the "hasn't even gotten to offboarding"
  view = absence; no leaks in dashboards/nav).

## 5. Frontend (apps/hr)

- `app/offboarding/page.tsx` + `[id]` detail — mirror onboarding pages (shared components:
  extract `components/processes/instance-table.tsx`, `instance-detail.tsx`,
  `task-row.tsx` from LCM-01's implementation, parameterized by type — refactor LCM-01 pages
  onto them in this PR).
- Initiate flow: on the employee detail (MOD-01) an "Offboard" action
  (processes:manage only) → dialog: reason select
  (resignation|end_of_contract|termination|mutual|other+note), last working day picker,
  template select (auto-suggested), **grant-alumni checkbox** with helper text
  ("Fellows and analysts receive alumni access automatically") — checkbox hidden/locked-on
  when employment_type is fellow/analyst.
- Offboardee `app/offboarding/me`: dignified tone — their tasks (return laptop, handover
  doc), timeline to last day, "what happens to your access" explainer, alumni note when
  applicable. Delete the dead `off-boarding.tsx` component.
- Dashboard (MOD-11 consumes): offboarding-in-progress count for HR.

## 6. Tests to write FIRST

1. Initiate: guards (already exited → 409); status flips to offboarding; negative offsets
   anchor to last_working_day correctly.
2. Completion hook matrix — the core test, table-driven over employment_type × grant_alumni:
   fellow/false → alumni granted; staff/false → NOT granted, is_active=false; intern/true →
   granted, is_active=true; assert employee role removed, sessions revoked (old cookie → 401),
   contract TERMINATED, exited_at set.
3. asset_return kind: assigned asset present → 422 with asset list; after MOD-04 return → completes.
4. access_revocation task completes → sessions dead immediately (before instance completion).
5. Offboardee filtered view: staff_only hidden; other employees 403; post-exit the user
   (if alumni) can still NOT read the instance (subject access ends at exited — HR only).
6. grant_alumni toggle after instantiation is honored at completion.
7. E2E: offboard a seeded fellow → complete blocking tasks → login as them → portal shows
   alumni card only, HR app denies; a staff offboard → login fails (inactive).

## 7. Acceptance criteria

- [ ] Full offboard runs end-to-end with role/session/contract/status side-effects exactly per §4.
- [ ] Alumni matrix behaves per auth-and-rbac.md §4 (test 2 green).
- [ ] Offboardee view is filtered and dignified; unaffected employees see zero offboarding surface.
- [ ] Asset-return gate prevents completion while assets are assigned.
- [ ] Shared process components extracted (no copy-paste between on/offboarding pages).

## 8. Edge cases

- Offboarding the last hr-role user: warn (409 with `force=true` override, admin only).
- Employee with pending leave requests / open helpdesk tickets: completion note lists them
  (informational, non-blocking) — one aggregate query.
- Rehire later: employees row exists (exited) → REC-05's "already an employee" 409 governs;
  manual path: HR sets status back via MOD-01 with a new contract (documented limitation).
- Cancel offboarding (person stays): instance cancelled → status back to `active`, nothing
  else touched (roles were never removed pre-completion).

## 9. Out of scope

Severance/final-pay calculations (payroll stays manual in MOD-07), exit-survey forms
(kind exists as checklist+notes), automatic external-system deprovisioning.

## 10. Rollout

Seed a "Default offboarding" template. First real use supervised by HR + user watching logs.
