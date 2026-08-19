Makes the employees module real: a filterable directory, a full employee detail page, and
HR-editable vs self-editable fields enforced server-side and reflected in both UIs. PR-18 had
already ported most of the backend from `hr_users` to `employees`, but nothing had verified it
end-to-end, and the frontend directory/detail/profile screens were still built against a
fictional API shape that never matched what the backend actually returns — creating an employee
through the UI has never worked, because the sheet read `employee.id` off a response envelope
the service never unwrapped.

Spec: `docs/specs/modules/MOD-01-employees-core.md` (§7 acceptance criteria all checked off in
the PR description below).

## What this adds

**Backend** — table-driven field-set enforcement test (every field in `HR_EDITABLE_FIELDS ∪
SELF_EDITABLE_FIELDS` × {self, hr} × {200, 422}) proves the split the service already enforced
but had never been exercised exhaustively. `phone`, `citizenship`, `home_country`, `home_city`
were writable via `PATCH /hr/me/profile` but never selected in any `GET` response — a
self-editable field could be set but never read back, which silently defeated the "everyone
sees read" half of the field-set contract. Now included in the directory/detail row shape.

**Contract status guard** — spec reserves `ACTIVE → TERMINATED` for LCM-02's offboarding flow,
but nothing blocked HR from setting it directly via PATCH. Added `HR_SETTABLE_CONTRACT_STATUSES`,
symmetric to the existing employee-status guard. Separately, `contract.validation.ts`'s status
enum was missing `"DRAFT"` — a DRAFT contract could be created at the service layer (there was
already a passing test for it) but not through the real `POST/PATCH` routes, because the request
400'd on validation before ever reaching the service. Both are new bugs the field-set matrix and
an HTTP-level regression test now pin.

**Frontend directory/detail rebuild** — `app/employees/page.tsx` was calling `useEmployees()`
with no params and re-implementing search/filter/pagination entirely client-side over whatever
page the backend happened to return; rewired to pass filters/pagination server-side (the spec's
"big directories: server-side pagination only" edge case). `app/employees/[id]/page.tsx` did not
exist — built with Profile/Contract/Assets/Documents/Leave/Onboarding-Offboarding tabs, reusing
the existing `ReusableSheet`/`ConfirmDialog`/`Tabs` primitives rather than new ones. Assets,
Documents, and Leave tabs are summary-count-plus-link, matching the assets module's own
precedent for not forking another module's UI.

**Add-employee flow** — was 4 steps with a contract-creation step that was a literal no-op
stub (`mutationFn: async () => {}`). Collapsed to the spec's 2 steps and wired the contract step
to the real nested `POST .../contracts` endpoint, sharing a new `ContractFormFields` component
with the detail page's own add/edit contract sheet.

**Self-profile editing** — `edit-profile-modal.tsx` never called any API; `onSave` was local
`setState` only, so an edit vanished on refresh, and it exposed HR-owned fields (title,
department, status, hire date) that the backend would 422 on if the save had ever actually
fired. Rebuilt on `ReusableSheet`, restricted to the real `SELF_EDITABLE_FIELDS`, now calling
`PATCH /hr/employees/me/profile` for real.

**Auth cutover seam** — `employees-core.service.ts` had grown its own local
`employeeIdForUser` query, duplicating `getEmployeeForUser` in `employee-context.ts`. It now
delegates to that seam instead, so FND-07's swap to session-based identity touches exactly one
file in this module, per the spec's transition-design requirement — this was checked, not
assumed.

**manager_id** — the backend already allows HR to PATCH it (guarded, tested), but the issue's
coordination note reserves manager validation for MOD-02. Left the backend allowance dormant
and did not expose it in either the add-employee sheet or the HR edit sheet.

## One latent bug fixed in passing

Three files outside this module's normal surface — `assign-asset-dialog.tsx`,
`access-builder.tsx`, `asset-sheet.tsx`, and `app/asset/page.tsx` — read `.firstName`,
`.lastName`, and `.position` off employee records fetched via the real `useEmployees()` hook.
Those fields never existed on the actual backend response; the old fictional `Employee` type
just didn't complain about it, so the bug was silent at compile time and broken at runtime
identically. Correcting `Employee` to match the real shape turned it into a compile error;
fixed the four call sites to the real field names (`first_name`, `last_name`, `job_title`)
rather than leave the app failing to build.

## Decision worth a look

The directory/detail response now returns `phone`/`citizenship`/`home_country`/`home_city` on
every row, not just when explicitly requested — `attachManagers` is shared by the plain
directory list and the detail/me endpoints, so adding the columns there exposes them everywhere
rather than only on detail. Low risk (only `employees:read` holders or the row's own owner can
reach these endpoints at all), but worth a look if a future module tightens directory-row
visibility.

## Verification

- Backend: 53/53 tests green across `employees-core.test.ts`, `employees-core-api.test.ts`
  (including the new field-set matrix), `contracts-core.test.ts`, the new
  `contracts-api.test.ts`, and `employee-context.test.ts`.
- Frontend: 124/124 tests green across all 25 files in `apps/hr`, including three new files
  under `tests/employees/` (directory rendering/filtering, detail-page role-gated affordances,
  self-edit payload shape).
- `tsc --noEmit` clean on both `backend` and `apps/hr`; 0 ESLint errors on every touched file.
- `next build` succeeds; dev server serves `/employees`, `/employees/[id]`, and `/profile`
  without error.
- No full authenticated browser click-through was done — that needs a live backend + Postgres +
  portal SSO session this environment doesn't have running. Verified instead via the
  integration suite (real HTTP routes, real auth middleware), typecheck, build, and a
  dev-server route-serves check.

## Not implemented

Contract delete has no dedicated test of its own — it reuses the same tested mutation pattern
as create/update. The contract's "employment agreement" field is a plain URL text input, not a
real file upload; MOD-05 doesn't yet expose an upload endpoint that returns a bare URL suitable
for this. Org chart, manager validation, and the self-service dashboard shell remain MOD-02/
MOD-03's job, per spec §9.
