# MOD-02: Org Hierarchy + Org Chart

> **Status:** Ready
> **Track:** B (ticket COLLEAGUE-04)
> **Depends on:** MOD-01
> **Blocks:** MOD-06 (manager-routed approvals), MOD-09 (manager reviews)
> **Branch:** `feat/mod-02-org-chart`

## 1. Goal

Real reporting lines: `employees.manager_id` becomes the single source of truth (replacing
the free-text `hr_contracts.manager`/`report_to`), with cycle-safe assignment, a backfill
from the legacy text, and a live org chart replacing the hardcoded one.

## 2. Context & current state

- `employees.manager_id` self-FK exists (FND-05 §3a), unused.
- Legacy: `hr_contracts.manager` + `report_to` free text (backend/src/db/schema/hr/contract.ts:18-19).
- UI: `apps/hr/src/app/employees/org-chart/page.tsx` renders primereact `OrganizationChart`
  from hardcoded `src/data/org-chat-data.ts`.
- MOD-01's directory/detail provide the manager display + edit affordance hook points.

## 3. Schema changes

None (manager_id exists). Deprecation note added as comments on the contract text columns
(dropped in a later cleanup migration once backfill is accepted).

## 4. API

`backend/src/services/hr/org.service.ts`:

- `setManager(employeeId, managerId|null, actor)` — guards: not self; manager exists and
  status ∉ {exited}; **cycle check** — walk `manager_id` ancestors from the proposed manager;
  if employeeId appears → 422 `{"error":"cycle","path":[names]}`. Depth cap 20 (defensive).
- `getOrgTree()` — recursive CTE from roots (`manager_id IS NULL`, status != 'exited'):
  `{id, name, job_title, department, picture, children:[...]}`. Cache 60s in-memory.
- `getReports(employeeId, {direct: boolean})` — direct via one WHERE; all via CTE. Exposed
  for MOD-06/09 ("is X a manager of Y" check `isManagerOf(managerId, employeeId)` — transitive).

| Endpoint                                         | Permission                             | Behavior                                                                                                                                                                        |
| ------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /hr/org-chart`                              | org_chart:read (every employee)        | full tree                                                                                                                                                                       |
| `PATCH /hr/employees/:id/manager` `{manager_id}` | employees:manage                       | setManager; event-logged (notes/audit via existing notification or a simple employees history? keep simple: write a `hr_notifications` entry to the employee + old/new manager) |
| `GET /hr/employees/:id/reports?direct=true`      | employees:read OR the manager themself | reports list                                                                                                                                                                    |
| `GET /hr/org-chart/unresolved`                   | employees:manage                       | backfill leftovers (below)                                                                                                                                                      |

**Backfill script** `backend/scripts/backfill-managers.ts` (one-off, idempotent):
for each active employee's latest contract, take `report_to` (fallback `manager`) text,
normalize, match against employees full names (`first_name || ' ' || last_name`,
case/space-insensitive); unique match → set manager_id (skip if would cycle — report);
zero/multi match → row in the report. Report JSON drives the **unresolved list**: store
leftovers in a tiny table `org_backfill_unresolved(employee_id, raw_text, resolved boolean)`
so the UI can work through them (row deleted/marked when HR assigns manually).

## 5. Frontend

- `app/employees/org-chart/page.tsx`: fetch `GET /hr/org-chart` → map to primereact
  OrganizationChart nodes (keep the existing renderer/styling; delete `org-chat-data.ts`).
  Node click → employee detail. Loading skeleton; >150 nodes → collapse to department roots
  by default (primereact supports collapsible).
- Manager edit: on MOD-01 detail Profile tab (employees:manage): searchable employee select
  (excludes self + own subtree — client hint; server is authority), cycle 422 → toast with
  the path.
- **Unresolved managers panel** `app/employees/org-chart/unresolved` (employees:manage):
  table raw_text → employee, with assign-select per row; empties itself as HR resolves.

## 6. Tests to write FIRST

Backend:

1. Cycle prevention: A→B→C, set C's manager = A's report... concretely: setManager(A, C)
   where C is in A's subtree → 422 with path; legal reassignments pass; self → 422.
2. CTE tree shape (fixture forest with 2 roots, 3 levels); exited employees excluded;
   orphaned subtree (manager exited → children float to root; decide+test: on offboarding
   completion LCM-02 sets reports' manager_id = exiting employee's manager — cross-ref added
   as step 2 of LCM-02 §4's completion hook: "re-parent direct reports", ahead of the
   status='exited' write so setManager's own "not an exited manager" guard doesn't reject it).
3. `isManagerOf` transitive true/false cases.
4. Backfill: fixtures with exact, case-variant, ambiguous ("John"), missing names → correct
   sets + unresolved rows; rerun idempotent.
5. Permissions: employee reads chart 200, edits manager 403.
   Frontend:
6. Chart renders fixture tree; node click navigates.
7. Unresolved panel assigns and removes rows (MSW).
   E2E: HR assigns manager on detail → chart reflects; attempt cycle → error toast.

## 7. Acceptance criteria

- [ ] Chart shows the real org from manager_id (hardcoded data deleted).
- [ ] Cycles impossible server-side (test 1 green).
- [ ] Backfill run on prod data; unresolved list worked down to 0 by HR (or documented leftovers).
- [ ] `isManagerOf` exported and consumed by MOD-06's approval check (interface frozen here).
- [ ] LCM-02 re-parenting line added (cross-ref committed in both specs).

## 8. Edge cases

- Two employees with identical full names: backfill → unresolved (never guess).
- Manager on_leave: still a valid manager (approvals may delegate later — out of scope).
- Deep chains (>20): cap returns 422 asking HR to restructure (log loudly — data smell).

## 9. Out of scope

Approval delegation, dotted-line/matrix reporting, department-head modeling (department
stays a string until a future need).

## 10. Rollout

Ship API+backfill first, run backfill with HR reviewing the report, then chart UI.
