# MOD-04: Assets Finalization

> **Status:** Ready
> **Track:** B (ticket COLLEAGUE-01)
> **Depends on:** — (schema exists; employees repoint is additive)
> **Blocks:** LCM-02 asset_return gate
> **Branch:** `feat/mod-04-assets`

## 1. Goal

The asset module goes from "APIs v0.1 + partially wired UI" to complete: full CRUD with
categories/specs/images, assignment to employees with history, maintenance log, flags/issues,
and the employee-facing "my assets" slice. LCM-02's offboarding gate ("no assets still
assigned") gets its query.

## 2. Context & current state

- Schema COMPLETE: `hr_assets` + `hr_asset_categories`, `hr_asset_specs`, `hr_asset_image`,
  `hr_asset_maintenance` (backend/src/db/schema/hr/assets.ts) — statuses
  AVAILABLE/ASSIGNED/UNDER_MAINTENANCE/DISPOSED, `assigned_to_id`→hr_users (+ new
  `employee_id` from FND-05 §3b — use it for new writes, backfill handled by FND-05 script),
  `assigned_at`/`returned_at`, `has_issue`, `is_flagged`.
- Backend: `/hr/assets` routes/controllers/services from commit 1dbeb81 — audit each endpoint
  against §4 and fill gaps (esp. assignment history, return, maintenance CRUD, image upload).
- Frontend: `apps/hr/src/app/asset/` pages + `src/services/assets.service.ts` +
  `src/hooks/useAssets.ts` — path mismatches (`/assets` vs `/hr/assets`) and partial wiring;
  some views still on `src/data/*` mocks.
- Images: DO Spaces via `middlewares/upload.ts` (public-read is fine for device photos).

## 3. Schema changes

Additive only if audit finds gaps. Known need: assignment HISTORY —
`hr_asset_assignments(id, asset_id FK, employee_id FK, assigned_by user FK, assigned_at,
returned_at, return_condition text, notes)`; current columns on hr_assets keep the "current
holder" denormalized (write both in one transaction).

## 4. API (complete surface — audit existing, implement missing; permissions per auth-and-rbac.md: read=assets:read incl. own, manage=assets:manage)

| Endpoint | Behavior |
|---|---|
| `GET /hr/assets?status&category&assigned_to&search&page` | list with category + current holder |
| `POST /hr/assets` / `PATCH /hr/assets/:id` / `DELETE` | CRUD; delete only when never-assigned else DISPOSED transition; serial_number unique 409 |
| `POST /hr/assets/:id/images` / `DELETE .../images/:imageId` | upload via multer-s3 |
| CRUD `/hr/asset-categories`, nested spec definitions | categories with spec templates (existing hr_asset_specs pattern — audit) |
| `POST /hr/assets/:id/assign` `{employee_id, notes}` | 409 unless AVAILABLE; writes assignment row + denormalized fields; notification to employee |
| `POST /hr/assets/:id/return` `{condition, notes, has_issue?}` | closes assignment (returned_at, condition), status AVAILABLE or UNDER_MAINTENANCE if has_issue |
| `POST /hr/assets/:id/maintenance` + `PATCH .../maintenance/:mid` | log entries (start/end, cost, description); open entry ⇒ status UNDER_MAINTENANCE, closing last ⇒ AVAILABLE |
| `POST /hr/assets/:id/flag` `{note}` / unflag | is_flagged toggle |
| `GET /hr/assets/:id/history` | assignment + maintenance timeline |
| `GET /hr/me/assets` | own current assets (MOD-03 consumes) |
| `GET /hr/employees/:id/assets?open=true` | LCM-02 gate query (assets:read) |

Status machine (service-enforced): AVAILABLE→ASSIGNED/UNDER_MAINTENANCE/DISPOSED;
ASSIGNED→(return)→AVAILABLE|UNDER_MAINTENANCE; UNDER_MAINTENANCE→AVAILABLE|DISPOSED;
DISPOSED terminal. Illegal → 409 with allowed.

## 5. Frontend

- `app/asset/page.tsx`: real table (status/category filters, search, holder column), detail
  drawer/page: photos carousel, specs, current holder + assign/return actions
  (dialogs: employee select / condition form), maintenance tab (log + add entry), history
  timeline, flag toggle. Category admin section (assets:manage).
- Kill every mock import for assets; fix service paths to `/hr/assets`.
- "My assets" list component (consumed by MOD-03) — read-only + "report issue" button →
  sets has_issue + helpdesk ticket (MOD-08 exists — call its create endpoint; if not merged,
  has_issue only, TODO tagged).
- States everywhere: loading/empty/error; image upload progress.

## 6. Tests to write FIRST

Backend:
1. Status machine table-driven (every legal/illegal transition).
2. Assign: AVAILABLE only; assignment row + denormalized sync in one transaction (inject
   failure → neither).
3. Return closes the open assignment exactly once (double return → 409); condition stored.
4. Maintenance open/close drives status correctly with multiple entries.
5. `GET /hr/employees/:id/assets?open=true` exact rows (the LCM-02 gate).
6. serial_number uniqueness 409; delete guard.
7. Permissions: employee reads own via /hr/me/assets, 403 on manage endpoints.
Frontend:
8. Table + filters (MSW); assign dialog flow; return dialog validates condition.
9. My-assets renders + report-issue payload.
E2E: HR creates asset w/ photo → assigns to seeded employee → employee sees it in /me →
HR processes return with issue → asset shows UNDER_MAINTENANCE.

## 7. Acceptance criteria

- [ ] Zero mock data in asset pages; all service paths correct.
- [ ] Full lifecycle in e2e (create→assign→return-with-issue→maintenance→available).
- [ ] Assignment history preserved across cycles (timeline shows both holders after reassignment).
- [ ] LCM-02 gate endpoint frozen (shape documented here, consumed there).
- [ ] All §6 green.

## 8. Edge cases

- Assign to onboarding employee: allowed (that's the LCM-01 asset_assignment task).
- Concurrent assigns: transition guarded by `WHERE status='AVAILABLE'` (0 rows → 409).
- Image >10MB / wrong mime → 422 (upload middleware limits — verify existing).
- Category delete with assets → 409; spec template edits don't rewrite existing asset specs.

## 9. Out of scope

Depreciation/valuation, barcode/QR, purchase-order workflow.

## 10. Rollout

Independent; merge anytime. Coordinate only the FND-05 `employee_id` backfill timing.
