# COLLEAGUE-01: Assets Finalization

> **Spec:** [MOD-04-assets](../specs/modules/MOD-04-assets.md) — the spec is the authority; read it fully first.
> **Depends on:** nothing (start now). The `employee_id` columns land with FND-05's schema slice — until it merges, keep writing `assigned_to_id` (hr_users) and switch per §Coordination.
> **Branch:** `feat/mod-04-assets` off `dev`
> **Estimated size:** L

## What you are building

Finish the asset module you started: complete the missing API surface (assignment with
history, return with condition, maintenance log driving status, flags, image upload), fix
the frontend service paths (`/assets` → `/hr/assets`), replace every remaining mock with
real data, and add the employee-facing "my assets" list with a report-issue action. The
asset status machine (AVAILABLE/ASSIGNED/UNDER_MAINTENANCE/DISPOSED) is enforced
server-side — illegal transitions return 409.

## Where things are

- Schema (complete): `backend/src/db/schema/hr/assets.ts` — you know this one.
- Your existing v0.1: `backend/src/routes/hr/` asset routes + controllers/services.
- Frontend: `apps/hr/src/app/asset/`, `src/services/assets.service.ts`, `src/hooks/useAssets.ts`.
- Upload middleware: `backend/src/middlewares/upload.ts` (public-read is OK for device photos).
- New table you add: `hr_asset_assignments` (history) — full definition in MOD-04 §3.

## Steps

1. **Migration** (after FND-02 merges — check with the team channel): add
   `hr_asset_assignments` per spec §3. Use the new workflow:
   `pnpm --filter ganzafrica-backend db:generate`, review SQL, commit both.
2. **Backend audit + fill**: go endpoint-by-endpoint through the table in MOD-04 §4; for
   each existing one verify behavior matches (esp. status machine + 409s); implement the
   missing ones (assign/return/maintenance/flag/history/me-assets/employees-open-assets).
   Assignment + denormalized fields update in ONE transaction.
3. **Tests first** for everything in step 2 — the list is MOD-04 §6 items 1–7. Use the
   FND-04 harness (factories + loginAs). If FND-04 isn't merged yet, write the tests
   anyway in its layout (`backend/tests/integration/assets.test.ts`) — they'll run when it lands.
4. **Frontend**: fix service base paths; wire table + filters; build assign/return dialogs,
   maintenance tab, history timeline, flag toggle, category admin; delete all
   `src/data/*` asset mocks. Loading/empty/error states on every view.
5. **My-assets component** (`components/assets/my-assets.tsx`) — read-only list +
   "Report issue" (sets has_issue; if MOD-08's helpdesk create endpoint exists, also create
   a linked ticket, else leave a `// TODO(MOD-08)` and only set the flag).
6. Frontend tests (MOD-04 §6 items 8–9) + run the e2e flow manually and note it in the PR.

## Tests to write first

MOD-04 §6 in full — 1..7 backend, 8..9 frontend. Status-machine test is table-driven over
every transition pair.

## Acceptance criteria

Copy of MOD-04 §7 — all five boxes, plus: PR description contains the manual e2e walkthrough
(create → assign → return-with-issue → maintenance → available) with screenshots.

## Coordination warnings

- **FND-05 schema slice** adds `employee_id` to hr_assets: when it merges, switch new
  assignment writes to `employee_id` (the backfill script maps old rows). Small, isolated change.
- **FND-07 cutover day**: your route files' `authenticateHr` imports get swapped by Track A —
  don't refactor middleware imports yourself; a merge freeze on `backend/src/routes/hr/**`
  will be announced for that day.
- **LCM-02 depends on** `GET /hr/employees/:id/assets?open=true` — treat its response shape
  (spec §4) as frozen once merged.
