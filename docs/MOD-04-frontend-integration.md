# MOD-04 Assets — Frontend Integration Guide

This document describes how the `feat/mod-04-assets` frontend connects to the backend
we built, file by file. It's written so anyone picking this branch up — including
future-you — can verify the wiring without re-deriving it from the diff.

**Scope:** `apps/hr` (Next.js). Backend is assumed already merged/running per the
MOD-04 backend implementation (assign/return/flag/history/me-assets/employee-assets,
status machine, maintenance-driven status).

---

## 1. Architecture — the four layers

Every asset feature follows the same layering. Top to bottom:

```
Page (apps/hr/src/app/asset/*)
  └─ Components (apps/hr/src/components/assets/*, components/sections/sheets/*)
       └─ Hooks (apps/hr/src/hooks/useAssets.ts) — React Query wrappers
            └─ Service (apps/hr/src/services/assets.service.ts) — raw HTTP calls
                 └─ Backend (/api/hr/assets/*, /api/hr/me/assets, /api/hr/employees/:id/assets)
```

**Rule of thumb when adding anything new:** a component never calls `assetsService`
directly — it calls a hook. A hook never gets called from two different components with
different query keys for the same data — reuse the existing hook. If you need a new
backend field, it has to be added at every layer, bottom-up: type → service → hook →
component.

### Reuse-first: existing UI primitives — do not build new ones

This project already has its own modal/panel primitives. Every MOD-04 component listed
in §3 builds on top of these — none of them invented a new dialog or panel wrapper, and
nothing new should either:

| Existing primitive                                                                               | Location                                                                                       | Use for                                                                      | Already used by                                                                                                                                   |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Dialog` (+ `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`) | `apps/hr/src/components/ui/dialog.tsx`                                                         | Compact forms, pickers, confirmations — content that fits centered on screen | `assign-asset-dialog.tsx`, `return-asset-dialog.tsx`, `create-asset-dialog.tsx`                                                                   |
| `ReusableSheet`                                                                                  | `apps/hr/src/components/sections/sheets/sheet-component.tsx` (wraps `components/ui/sheet.tsx`) | Larger side-panel content — details views, admin panels, multi-section forms | `asset-sheet.tsx`, `maintenance-form-sheet.tsx`, `category-admin-sheet.tsx`, and pre-existing `add-contract-sheet.tsx` / `add-employee-sheet.tsx` |

**Before creating any new component file, check whether one of these two — used the way
the existing MOD-04 files already use them — actually covers the need.** A new
`SomethingDialog.tsx` should still import `Dialog` from `components/ui/dialog`, the same
way `assign-asset-dialog.tsx` does; a new `SomethingSheet.tsx` should still use
`ReusableSheet`, the same way `category-admin-sheet.tsx` does. The only thing that should
ever be "new" is the content inside one of these, never the wrapper itself.

---

## 2. Backend contract reference

All routes are mounted under `/api/hr` (see `backend/src/routes/hr/index.ts`).

| Method                        | Path                                 | Auth                     | Notes                                                                         |
| ----------------------------- | ------------------------------------ | ------------------------ | ----------------------------------------------------------------------------- |
| `GET`                         | `/hr/assets`                         | `assets:read` (HR/admin) | list, filters: `assignedTo`, `hasIssue`, `isFlagged`                          |
| `GET`                         | `/hr/assets/:id`                     | `assets:read`            | includes category, specs, images                                              |
| `POST`                        | `/hr/assets`                         | `assets:manage`          | multipart if images attached                                                  |
| `PATCH`                       | `/hr/assets/:id`                     | `assets:manage`          | **no longer accepts `status` or `assignedToId`**                              |
| `DELETE`                      | `/hr/assets/:id`                     | `assets:manage`          | hard-deletes if never assigned, else `DISPOSED` (409 if currently `ASSIGNED`) |
| `POST`                        | `/hr/assets/:id/assign`              | `assets:manage`          | `{ employeeId, notes? }` — 409 unless `AVAILABLE`                             |
| `POST`                        | `/hr/assets/:id/return`              | `assets:manage`          | `{ condition, notes?, hasIssue? }` — 409 if no open assignment                |
| `POST`                        | `/hr/assets/:id/flag`                | `assets:manage`          | `{ note? }`                                                                   |
| `POST`                        | `/hr/assets/:id/unflag`              | `assets:manage`          | —                                                                             |
| `GET`                         | `/hr/assets/:id/history`             | `assets:read`            | `{ assignments: [...], maintenance: [...] }`                                  |
| `GET`                         | `/hr/assets/categories`              | `assets:read`            | grouped by `parent_name`                                                      |
| `POST`/`PATCH`                | `/hr/assets/categories(/:id)`        | `assets:manage`          | **snake_case body** — see §4 gotcha                                           |
| `GET`/`POST`/`PATCH`/`DELETE` | `/hr/assets/maintenance(/:id)`       | mixed                    | `PATCH` accepts `completedAt` to close an entry                               |
| `GET`                         | `/hr/me/assets`                      | authenticate only        | own currently-assigned assets                                                 |
| `GET`                         | `/hr/employees/:id/assets?open=true` | `assets:read`            | LCM-02 gate — one row per **assignment**, not per asset                       |

Status machine (enforced server-side, 409 on illegal transitions):
`AVAILABLE → ASSIGNED | UNDER_MAINTENANCE | DISPOSED`, `ASSIGNED → AVAILABLE | UNDER_MAINTENANCE`,
`UNDER_MAINTENANCE → AVAILABLE | DISPOSED`, `DISPOSED` terminal.

---

## 3. File-by-file breakdown

### Modified

| File                                                                | What changed                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/hr/src/types/api.ts`                                          | Dropped `status`/`assignedToId` from `UpdateAssetRequest`. Added `AssetAssignment`, `AssetHistory`, `EmployeeAssetRow` types matching the backend response shapes exactly. **Fixed** `CreateCategoryRequest`/`UpdateCategoryRequest` to snake_case (see §4). |
| `apps/hr/src/services/assets.service.ts`                            | Added `assignAsset`, `returnAsset`, `flagAsset`, `unflagAsset`, `getAssetHistory`, `getMyAssets`, `getEmployeeAssets` — one method per new backend endpoint.                                                                                                 |
| `apps/hr/src/hooks/useAssets.ts`                                    | Added matching React Query hooks: `useAssignAsset`, `useReturnAsset`, `useFlagAsset`, `useUnflagAsset`, `useAssetHistory`, `useMyAssets`, `useEmployeeAssets`. All mutations invalidate `["assets"]` and `["asset", id]` on success.                         |
| `apps/hr/src/components/sections/sheets/asset-sheet.tsx`            | Removed the dead Status/Assigned-To/Is-Flagged edit fields (no longer PATCH-able). Wired in Assign/Return/Flag/History buttons and the two dialogs + history panel — **this file would not compile before this fix**, it referenced removed state.           |
| `apps/hr/src/components/sections/sheets/maintenance-form-sheet.tsx` | Added the "close this entry" checkbox (sends `completedAt`) that appears only when editing an open (`APPROVED`, uncompleted) entry — this is what actually drives an asset back to `AVAILABLE` from the UI.                                                  |
| `apps/hr/src/components/assets/category-admin-sheet.tsx`            | Fixed payload keys to snake_case (see §4).                                                                                                                                                                                                                   |
| `apps/hr/src/app/asset/page.tsx`                                    | See §5 — this is the main wiring.                                                                                                                                                                                                                            |
| `apps/hr/src/components/navbar.tsx`                                 | Added a "My Assets" link to the plain-employee nav menu, pointing at `/asset/me`.                                                                                                                                                                            |

### New

| File                                                       | Purpose                                                                                                                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/hr/src/components/assets/assign-asset-dialog.tsx`    | Employee picker + notes, calls `useAssignAsset`.                                                                                                             |
| `apps/hr/src/components/assets/return-asset-dialog.tsx`    | Condition + notes + "has issue" toggle, calls `useReturnAsset`.                                                                                              |
| `apps/hr/src/components/assets/asset-history-timeline.tsx` | Merges `assignments` + `maintenance` from `useAssetHistory`, sorted, into one timeline. Own loading/empty/error states.                                      |
| `apps/hr/src/components/assets/my-assets.tsx`              | Employee-facing read-only list (`useMyAssets`) + "Report Issue" → sets `hasIssue` **and** creates a real helpdesk ticket via `helpdeskService.createTicket`. |
| `apps/hr/src/components/assets/category-admin-sheet.tsx`   | Category CRUD, spec-schema builder (add/remove typed fields with `key`/`label`/`type`/`options`/`required`/`unit`).                                          |
| `apps/hr/src/components/assets/create-asset-dialog.tsx`    | "Add Asset" form. Spec fields render dynamically based on the selected category's `spec_schema`. Supports multi-image upload.                                |
| `apps/hr/src/app/asset/me/page.tsx`                        | Route for the employee-facing my-assets page, mirrors the existing `apps/hr/src/app/onboarding/me` pattern. Renders `<MyAssets />`.                          |

### Deliberately untouched

`apps/hr/src/data/assets-data.ts`'s `assetRequests`, `assetCategoryData`,
`assetConditionData`, `monthlyAssetData` — the Asset Requests and Analytics tabs on the
main page. These aren't in the MOD-04 API surface at all (no backend endpoints exist for
them), and per an earlier scoping decision they were left as-is rather than built out or
removed. If you want them wired to real data or removed, that's a separate task.

---

## 4. Two real bugs fixed along the way (not new features — worth knowing about)

1. **Backend route-shadowing bug**: `GET /hr/assets/:id` was registered before
   `GET /hr/assets/maintenance` in `assets.routes.ts`, so Express matched `/maintenance`
   requests as `id="maintenance"` and never reached the real handler. This silently broke
   maintenance list-loading for the frontend, which already called it on every page load.
   Fixed by moving the maintenance routes above `/:id` (same fix pattern the category
   routes already had a comment about).

2. **Category payload casing mismatch**: `CreateCategoryRequest`/`UpdateCategoryRequest`
   used camelCase (`parentName`, `specSchema`, `sortOrder`) but the backend's
   `createCategorySchema`/`updateCategorySchema` require snake_case
   (`parent_name`, `spec_schema`, `sort_order`) verbatim — this is the one part of the
   asset API that was never converted to camelCase. Category create/update would have
   silently failed zod validation. Fixed the frontend types and the one place that builds
   the payload (`category-admin-sheet.tsx`). **If you add new category fields, remember
   this endpoint is the snake_case exception — everything else in this API is camelCase.**

---

## 5. `apps/hr/src/app/asset/page.tsx` — the main wiring

This was the last piece assembled, so it's worth walking through explicitly:

- **State added**: `showCategoryAdmin`, `assignTarget: Asset | null`, `returnTarget: Asset | null`. Removed dead `editAsset` state — "Edit" now just opens the detail sheet (`AssetSheet` already has its own inline edit toggle, so a separate edit entry point was redundant).
- **`employees` lookup**: added `useEmployees({ limit: 200 })` so the "Assigned To" column can render a name instead of a raw UUID.
- **Assets Inventory tab actions dropdown**: "Assign" (visible only when `status === "AVAILABLE"`) opens `AssignAssetDialog` via `assignTarget`; "Return" (only when `"ASSIGNED"`) opens `ReturnAssetDialog` via `returnTarget`; "Report Issue" now actually calls `useFlagAsset()` instead of being a no-op.
- **Toolbar**: added a "Categories" button opening `CategoryAdminSheet`, alongside the existing "Add Asset" button which now actually opens `CreateAssetDialog` (previously `showAddSheet` was set but nothing rendered it).
- **Error state**: `useAssets()`'s `isError` is now handled with a retry button, alongside the existing loading state (the empty-table state is already handled inside `DataTable` itself — no separate empty-state code needed there).
- **Dialogs mounted** at the bottom of the page: `CreateAssetDialog`, `AssignAssetDialog`, `ReturnAssetDialog`, `CategoryAdminSheet`, alongside the pre-existing `MaintenanceFormSheet` (×2) and the `AssetSheet` detail `ReusableSheet`.

---

## 6. Manual verification checklist

Run through this in the browser once the backend is up (`pnpm dev` in both `backend/`
and `apps/hr/`), logged in as an `hr`/`admin` role for the main flows and as a plain
`employee` for the self-service ones:

1. **Create**: Assets Inventory → Add Asset → pick a category with spec fields → confirm
   the spec inputs render dynamically → submit with an image → asset appears in the table.
2. **Categories**: Categories button → create a new category with 2–3 spec fields →
   confirm it appears in the Add Asset category dropdown with those fields.
3. **Assign**: row with an `AVAILABLE` asset → Assign → pick an employee → confirm status
   badge flips to `Assigned` and "Assigned To" shows the employee's name.
4. **Return, no issue**: same asset → Return → condition text, leave "has issue" off →
   confirm status flips back to `Available`.
5. **Return, with issue**: assign again, then Return with "has issue" checked → confirm
   status goes to `Under Maintenance` instead.
6. **Maintenance close**: Maintenance tab → open a maintenance entry tied to that asset →
   check "Close this maintenance entry" → Update → if it was the last open entry, confirm
   the asset's status flips back to `Available`.
7. **Flag**: row action → Report Issue → confirm the flag badge/state updates.
8. **History**: open an asset's detail sheet → History button → confirm assignments and
   maintenance entries appear merged in one timeline, newest first.
9. **My Assets**: log in as (or impersonate) a plain employee → nav → My Assets → confirm
   only their own currently-assigned assets show → Report Issue on one → confirm a
   helpdesk ticket is created (check the Helpdesk module) and the issue flag is set.
10. **Delete guard**: try deleting an `ASSIGNED` asset → expect a 409/error toast. Delete
    an asset with assignment history but not currently assigned → confirm it becomes
    `Disposed` rather than disappearing. Delete a never-assigned asset → confirm it's
    actually gone.

---

## 7. What's still open

- The manual e2e walkthrough above, done for real with screenshots, is what the MOD-04
  acceptance criteria (§7) wants in the PR description — that's on you to run and capture,
  not something scriptable from here.
- Asset Requests and Analytics tabs remain mock-backed (see §3, "deliberately untouched")
  — flag if that should change scope.
- No automated frontend tests were written this phase (MOD-04 §6 items 8–9 — table +
  filters with MSW, assign dialog flow, return dialog validation, my-assets render +
  report-issue payload). Backend tests (§6 items 1–7) are done and passing; frontend
  tests are the one remaining unchecked box from the original task spec.
