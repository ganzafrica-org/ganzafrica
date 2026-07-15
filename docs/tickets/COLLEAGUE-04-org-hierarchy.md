# COLLEAGUE-04: Org Hierarchy + Org Chart

> **Spec:** [MOD-02-org-hierarchy-and-chart](../specs/modules/MOD-02-org-hierarchy-and-chart.md) — read fully first.
> **Depends on:** COLLEAGUE-03 merged (employees module live).
> **Branch:** `feat/mod-02-org-chart` off `dev`
> **Estimated size:** M

## What you are building

Real reporting lines on `employees.manager_id`: a cycle-safe manager-assignment API + UI,
a backfill script that converts the free-text `hr_contracts.manager`/`report_to` columns
into FK links (with an "unresolved" worklist for the ones it can't match), the org chart
page rendering the real tree, and the `isManagerOf` helper that leave approvals (MOD-06)
and performance reviews (MOD-09) will build on.

## Where things are

- `employees.manager_id` exists (FND-05 schema), unused so far.
- Legacy text: `backend/src/db/schema/hr/contract.ts` lines 18–19 (`manager`, `report_to`).
- Chart UI: `apps/hr/src/app/employees/org-chart/page.tsx` renders primereact
  `OrganizationChart` from `src/data/org-chat-data.ts` (hardcoded — you delete this file).
- New backend service: `backend/src/services/hr/org.service.ts` (MOD-02 §4 — setManager
  with the ancestor-walk cycle check, getOrgTree recursive CTE, getReports, isManagerOf).
- Backfill: `backend/scripts/backfill-managers.ts` + the tiny `org_backfill_unresolved`
  table (MOD-02 §4) — one migration.

## Steps

1. Migration: `org_backfill_unresolved` table.
2. Tests FIRST: MOD-02 §6 items 1–5 (cycle prevention is item 1 — write it before
   `setManager` exists; the fixture forest in item 2 gets reused everywhere).
3. `org.service.ts` + the four endpoints (MOD-02 §4 table). `isManagerOf` must be transitive
   and exported — MOD-06 consumes it as-is.
4. Backfill script: name-match per spec (case/space-insensitive full name; unique match →
   set unless cycle; else unresolved row). Idempotent. DO NOT run on prod yourself —
   hand the command + report to the user.
5. Chart page: fetch `/hr/org-chart` → primereact nodes (keep current styling), node click →
   employee detail, collapse-to-departments above 150 nodes, loading skeleton. Delete
   `org-chat-data.ts`.
6. Manager edit on the employee detail Profile tab (employees:manage): searchable select,
   422-cycle → toast showing the returned path.
7. Unresolved worklist page `app/employees/org-chart/unresolved`: raw text → assign select
   per row; row clears on assignment.
8. Frontend tests §6 items 6–7; manual walkthrough in PR.

## Tests to write first

MOD-02 §6 items 1–7. The cycle test must cover: direct self, child-as-manager, deep
subtree, and the legal reassignment control case.

## Acceptance criteria

MOD-02 §7 — all five boxes. `isManagerOf`'s signature is frozen on merge (document it in
the service's JSDoc).

## Coordination warnings

- LCM-02 will re-parent direct reports on offboarding completion using your service —
  the cross-reference is already in both specs; nothing to do except keep `setManager`
  usable programmatically (no req/res coupling in the service layer).
- MOD-06 (leave) starts consuming `isManagerOf` possibly while you're still polishing UI —
  merge the service+API PR before the UI PR if you split them.
- The contract free-text columns stay (deprecated comments only) — dropping them is a later
  cleanup migration owned by Track A.
