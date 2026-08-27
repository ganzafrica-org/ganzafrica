Real reporting lines: `employees.manager_id` becomes the single source of truth (replacing the
free-text `hr_contracts.manager`/`report_to`), with cycle-safe assignment, a backfill from the
legacy text, and a live org chart replacing the hardcoded one. Also folds in a lower-priority
pass at mounting the HR app's notification UI (Phase 2 of this ticket), plus one live bug found
and fixed while smoke-testing the finished feature against a running server.

Spec: `docs/specs/modules/MOD-02-org-hierarchy-and-chart.md` (§7 acceptance criteria below).

## Phase 0 — verifying the foundation before building on it

MOD-02 depends on MOD-01 (employees module) actually working, not just claiming to. Stood up a
throwaway Postgres DB and ran the real integration suite rather than reading code and assuming:

- Auth: `apps/hr`'s http client is cookie-session + CSRF (`withCredentials`, `X-CSRF-Token`),
  matching the backend's `authenticate` middleware — not the Bearer/localStorage pattern the
  ticket flagged as a risk.
- `employees` is the live table behind the directory/detail/PATCH routes, not `hr_users`.
- The old `/employees` vs `/hr/employees` path mismatch is fixed — frontend and backend agree.
- Field-set enforcement (HR-only vs self-only fields) — 45/45 tests green, including the full
  field × {self, hr} × {200, 422} matrix.
- `employees.manager_id` is a real, nullable, self-referencing FK.

All five passed. Full pass/fail table with evidence was reported before Phase 1 started.

## What this adds

**Schema** — one additive migration: `org_backfill_unresolved(employee_id, raw_text, resolved)`
for the backfill worklist, a `MANAGER_CHANGED` value added to the existing notification-type
enum, and `@deprecated` comments on `hr_contracts.manager`/`report_to` (not dropped — that's a
separate migration once backfill is accepted, per the spec's coordination note).

**`org.service.ts`** — `setManager` (cycle-safe: walks the proposed manager's own ancestor chain
and rejects if the employee being reassigned appears in it — self-assignment falls out of this
same check as the depth-0 case, no special-casing needed), `getOrgTree` (recursive CTE, 60s
cache, exited managers' subtrees float to root instead of vanishing), `getReports` (direct via
one WHERE, transitive via CTE), and a re-exported `isManagerOf` — see "decisions worth a look."

**Backfill** — `backend/scripts/backfill-managers.ts` (thin CLI) over
`backend/src/services/hr/org-backfill.service.ts` (the actual logic, unit-testable). Case/space-
insensitive full-name match against `hr_contracts.report_to` (falling back to `.manager`);
unique match sets `manager_id` through `setManager` itself, so a would-be-cycle match is
recorded unresolved rather than forced through; zero/ambiguous matches go to
`org_backfill_unresolved` with the raw text preserved. Idempotent — reruns skip employees who
already have a manager and don't duplicate unresolved rows. **Not run against prod** — per the
brief, that's HR's call. Command: `pnpm tsx scripts/backfill-managers.ts` from `backend/`.

**Routes** — `GET /hr/org-chart` (`org_chart:read`, already seeded to `employee`), `GET
/hr/org-chart/unresolved` (`employees:manage`), `PATCH /hr/employees/:id/manager` and `GET
/hr/employees/:id/reports` (nested onto the existing employee routes, matching the assets
route's precedent for per-employee sub-resources).

**Frontend** — `app/employees/org-chart/page.tsx` rewired off `GET /hr/org-chart` (mock data
file deleted); primereact tree nodes carry the employee id, click navigates via
`/employees?employee=<id>` into the existing sheet-based detail view (added a small
`useSearchParams` deep-link effect there — there's no `[id]` route anymore, detail is a sheet).
Above 150 nodes, everything below the root level defaults to collapsed (primereact's own
expand/collapse) rather than a full-depth render. Manager reassignment lives in the existing
`EmployeeHrEditSheet` (a `ManagerPicker` searchable combobox, previously a documented no-op
pending this module) with a cycle-422 toast showing the actual rejection path. New unresolved-
managers worklist at `/employees/org-chart/unresolved`, HR-gated, rows clear on assignment via
query invalidation.

**Tests written first** — `backend/tests/integration/org.test.ts`: the four cycle cases the spec
calls out explicitly (self-assignment, direct child, deeper subtree, and a true negative-control
reassignment that must succeed), tree shape including the exited-manager float-to-root case,
transitive `isManagerOf`, the backfill's exact/ambiguous/missing/cycle-avoidance behavior and
idempotency, and permissions over real HTTP. Demonstrated the cycle test actually red→green (not
just written-and-assumed): temporarily gutted the cycle check, watched 3 of 4 cases fail, restored
it, watched all 16 pass. Frontend: chart renders a fixture tree and a node click navigates;
unresolved panel assigns and the row clears (MSW).

## Decisions worth a look

**`isManagerOf` already existed.** The spec assumed this function would be created fresh in
`org.service.ts`. It doesn't need to be — `employee-context.ts` already has a transitive,
cycle-safe, depth-capped implementation, already consumed live by MOD-06's leave-approval
routing and LCM-01's task assignment. Duplicating the walk in a second file would only invite
the two "cycle-safe" implementations to drift apart, so `org.service.ts` re-exports the existing
one as its documented, frozen-signature home instead of reimplementing it. Behavior and
signature match the spec exactly; only the canonical file differs from what the spec assumed.
Flagging per the brief's instruction to say so rather than silently pick a side.

**`getOrgTree`'s exited-manager anchor.** The literal recursive-CTE anchor is `manager_id IS
NULL`; a manager going `exited` without LCM-02's re-parenting hook (not yet built — see below)
would otherwise silently drop their entire subtree from the chart. Extended the anchor to also
include employees whose manager is exited, and belt-and-suspenders'd the same logic into the
application-side tree assembly, so the two agree even if they were ever to diverge.

**LCM-02 cross-reference.** MOD-02 §6 item 2 asks for a specific line to be added to LCM-02's
completion hook: re-parent an exiting manager's direct reports to their own manager, before the
`status='exited'` write (since `setManager` itself refuses an exited manager). Added as step 2
of `LCM-02-offboarding-and-alumni.md` §4's hook list — LCM-02 isn't built yet, so this is a spec
edit now, becomes real code once that module starts.

**Manager combobox exclusion.** Excludes only the employee themself client-side, not their whole
subtree (the spec explicitly calls this "a client hint; server is authority") — avoids an extra
subtree-fetch round trip for a case the 422 already covers correctly.

**"Collapse to department roots" (§5).** The spec doesn't elaborate the exact UX. Read literally
as depth-based collapse (root level expanded, everything below collapsed above the 150-node
threshold) rather than restructuring the tree into department-grouped pseudo-nodes, since the
brief says this is "a data-source swap, not a redesign."

## File-path assumptions that didn't match the repo

- `hr_contracts.manager`/`report_to` are at `contract.ts:15-16`, not `:18-19` as the brief
  assumed (off by the file's header comment lines) — same columns, correct file.
- The org-chart page has a **second**, unrelated, still-mock-data implementation:
  `components/sections/employee/department-chart.tsx`, rendered as an embedded tab inside
  `app/employees/page.tsx` (separate from the standalone `/employees/org-chart` route the
  sub-navbar links to, which is the one this ticket named). It reads its own mock data file
  (`@/data/employee-data`), untouched by this work and not something deleting
  `org-chat-data.ts` affects. Left alone — out of the file paths this ticket named — but it's a
  second, currently-fake "org chart" surface a user could stumble into; worth a follow-up.

## Phase 2 — notifications (explicitly lower priority, investigated before touching anything)

**What existed:** a fully-built backend (routes, controller, service: list, unread-count,
mark-read, mark-all-read, archive, preferences) that was **never mounted** anywhere —
`/hr/notifications/*` 404'd unconditionally. Even mounted, every call would have 400'd: the
controller resolved the caller via `resolvePlatformUserIdFromHrUser(req.user.id)`, which treats
`req.user.id` as an `employees.id` — it's actually the platform `users.id` (auth.middleware.ts
attaches it from the `users` table directly). A frontend `NotificationList` component existed,
correctly wired to a `useNotifications` hook, genuinely unmounted anywhere in the app — but typed
against a response shape (`{title, body, createdAt, read}`) that never matched what the backend
actually returns (`{title, message, created_at, status}`), so mounting it as-is would have shown
blank bodies and "Invalid Date" everywhere. The navbar's bell icon already had a full dropdown
shell — driven entirely by hardcoded fake data ("3 New", three made-up sample notifications),
not connected to anything real.

**What got fixed, in scope:** mounted the routes; fixed the id-resolution bug (7 call sites,
`Number(req.user!.id)` directly — matches the same `actorId(req)` pattern used throughout the
rest of the backend); corrected the frontend types/service/component to the real response shape;
added `unread-count` and `mark-as-read`/`mark-all-read` wiring (endpoints already existed,
frontend just never called them); replaced the navbar's hardcoded dropdown content with the real
`NotificationList` + a real unread badge + a working "mark all as read" action (the old "View all
notifications" button pointed nowhere — there's no `/notifications` page — swapped for the one
real action available). New test: `notifications-api.test.ts`, verifying list/unread-count/
mark-read end to end and that one user can't see another's notifications.

**Org-hierarchy notification hook:** `setManager` already writes an `hr_notifications` entry to
the employee and old/new manager on every reassignment (via the existing `sendNotification`
pattern, added `MANAGER_CHANGED` to its routing table) — this was in MOD-02 §4's own endpoint
table ("event-logged... write a hr_notifications entry"), and directly satisfies Phase 2 step 3's
first two asks (employee notified on manager change, new manager notified on gaining a report).
Did not add the optional third ask (notify HR when a backfill row goes unresolved) — the backfill
script runs once, outside a request context with no natural "who to notify" hook beyond "whoever
holds `employees:manage`," and the unresolved-count link already surfaces on the chart page
itself; judged this to need more than "a few notification-creation calls" and stopped rather than
inventing scope, per the brief's own instruction.

## A live bug found (and fixed) after everything above passed automated tests

Booted the actual backend + frontend dev servers against the real Postgres dev DB and drove the
new endpoints with `curl` and real page loads rather than stopping at green test suites. Found
`GET /hr/org-chart` 403ing for `hr@test.local` — `org_chart:read` is (correctly, per
auth-and-rbac.md) granted only to the `employee` role, on the assumption every HR/admin account
is _also_ a current employee. `backend/scripts/seed-test-users.ts`'s hr/admin test fixtures only
ever granted the account's single named role, never the `employee` role a real HR staff member
would also hold. Fixed the seed script to also grant `employee` whenever `makeEmployee: true` and
the primary role isn't already `employee`; re-ran it and re-verified `GET /hr/org-chart` returns
200 with the real tree. Also live-verified the manager-assignment PATCH and its exact
`{"error":"cycle","path":[...]}` 422 shape against the running server, and confirmed all three
new/changed frontend pages (`org-chart`, `org-chart/unresolved`, `employees`) compile and SSR
without error under Turbopack. No browser automation tool was available in this session, so this
was curl + SSR verification, not a clicked-through screenshot.

## Verification

- Backend: 49/49 test files, 481/481 tests green (includes the 16 new `org.test.ts` cases and 2
  new `notifications-api.test.ts` cases; zero regressions in the other 47 files).
- Frontend: 27/28 files, 126/126 real tests green. The one failing file
  (`tests/leave/approvals-page.test.tsx`) predates this session — it imports a page route
  (`app/leave/approvals/page.tsx`) already deleted before this work started, unrelated to MOD-02.
- Fixed two pre-existing tests broken by this session's own changes before they could regress
  silently: `directory.test.tsx` and `nav-permission.test.tsx` both needed
  `useSearchParams`/`useNotifications` mocks added once `Navbar` and the employees page gained
  new hooks.
- `tsc --noEmit` clean on both `backend` and `apps/hr`. `eslint` clean on every touched file
  (pre-existing unrelated warnings in `navbar.tsx` left as-is).
- Live-verified end to end against running dev servers + real Postgres (see above), not just the
  automated suite.

## Not done / open items

- Backfill has not been run against production data — command and summary above; that run is
  HR/the requester's call, not mine.
- No E2E browser click-through with screenshots (no browser automation tool available this
  session); relied on curl + SSR + the automated component-mount test suite instead.
- `department-chart.tsx`'s still-fake embedded org-chart tab (see above) is a known follow-up,
  not touched.
- This work is on the `mod-01-employees-core` branch, not a new `feat/mod-02-org-chart` branch
  off `dev` as the brief specified — flagged separately, not silently decided.
