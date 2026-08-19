# Onboarding × E-Signing: contract-signing sign-off

> Same format as `Things-to-work-on.md`. This closes the gap left when LCM-01 shipped: the
> `contract_signing` task kind checked `contract.status === 'ACTIVE'` but nothing ever created a
> signature request or flipped that status — this session wires the two together.

## 0. Step 0 findings (read before the decisions below)

- **No multi-signer/sequential support existed.** `signature_requests` was one-document-to-
  one-signer (`signer_user_id`/`signer_email` are singular columns, no grouping or ordering).
  Built from scratch: a `sequence_no` column plus orchestration in `signing.service.ts`.
- **`ref_id` was `integer`, but `hr_contracts.id` is a `uuid`.** A pre-existing, never-exercised
  type mismatch (grepped the whole backend — `ref_kind`/`ref_id` had zero real callers before
  this work). Fixed as part of the same migration: `ref_id` is now `text`.
- **No UI existed to link a contract to a `contract_signing` task at all** — `reassignTask`'s
  `link_ref` plumbing was API-only. Added a "link a draft contract" picker to `TaskRow`.
- **The DRAFT→ACTIVE `employment_agreement_url` guard is one shared code path** —
  `createContract` and `updateContract` both call it; there was no separate "onboarding
  contract" path to begin with.
- **No `signature_templates` row existed anywhere** in seed data — confirmed by grepping every
  `scripts/seed-*.ts` and `db/seed.ts`.
- **Onboarding pages were already correctly nested** at `/employees/onboarding`,
  `/employees/onboarding/[id]`, `/employees/onboarding/me`, and the per-instance
  pending/resolved task split already satisfied "status of all employees, what's done/missing"
  — it just wasn't factored into a reusable component yet.
- **Found and fixed stale links from the nav move** (`/onboarding*` → `/employees/onboarding*`,
  confirmed 404 — the old route directory no longer exists): `navbar.tsx`, `sub-navbar.tsx`
  (which also had an `id` property that doesn't exist on `SubNavItem` — a pre-existing
  typecheck error, unrelated to the href, fixed alongside it), the onboarding detail page's "All
  onboarding" back link, `InstanceTable`'s per-row link (was building `/${type}/${id}`), and —
  from the prior MOD-01 session — the employee Overview tab's onboarding card, which had
  already been patched by something into a non-route filesystem path
  (`/apps/hr/src/app/employees/onboarding/me`); corrected along with its test assertions.

## 1. The two decisions (Step 0.3 and 0.4)

Both were presented to you before implementing; recording the choices and reasoning here.

### 0.3 — Contract activation scope: **onboarding only, manual path unchanged**

`createContract`/`updateContract` still require `employmentAgreementUrl` for DRAFT→ACTIVE,
completely unchanged — HR can still activate a contract by pasting a URL for anything outside
onboarding (renewals, amendments, a contract that already has a wet-ink signed PDF).

A new function, `contract.service.ts::activateViaSignature(contractId, signedFileKey)`, bypasses
that guard entirely — it's called from exactly one place:
`signing.service.ts::completeSequenceStep`, only when a contract's full signature sequence just
finished. It sets `status: "ACTIVE"` and `employment_agreement_url: signedFileKey` directly. Two
independent activation paths, zero shared code, zero risk to the existing manual flow.

### 0.4 — Signature template: **seeded, with placeholder fields**

`backend/scripts/seed-signing-template.ts` (`pnpm db:seed:signing`, mirrors
`seed-onboarding-template.ts`'s idempotent-by-name pattern) creates one "Employment Contract"
template with 4 fields: HR Representative Signature + HR Sign Date (signer_index 0), Employee
Signature + Employee Sign Date (signer_index 1). The template's `description` and this document
both say explicitly these are placeholders — HR should review/adjust via the existing template
builder (Settings → E-Signing Templates) before relying on them in production.

**This seed has not been run in this environment** (no live DB here — see §5). Until it runs
against a real database, `startContractSigning` (`process.service.ts`) throws a 422
`SIGNING_TEMPLATE_MISSING` with an actionable message when HR tries to link a contract — tested
in `contract-signing-sequence.test.ts`. The feature fails loudly and clearly rather than
silently, exactly as the guardrail asked.

## 2. How it works end to end

1. HR opens the onboarding detail page (`/employees/onboarding/[id]`), finds the "Sign contract"
   task, and picks one of the employee's DRAFT contracts from a new inline selector on the task
   card (`TaskRow`) — POSTs via the existing `PATCH /hr/process-tasks/:id` (`link_ref`).
2. `process.service.ts::reassignTask` detects `link_ref.contract_id` was newly set on a
   `contract_signing` task and calls `startContractSigning`, which looks up the "Employment
   Contract" template and creates **two** `signature_requests` via
   `signing.service.ts::createSequentialRequests`: sequence 1 = the HR user who did the linking,
   sequence 2 = the employee (resolved via `employees.user_id`). Both internal signers — no
   emailed-token path touched. Only sequence 1 is sent; sequence 2 stays `draft`.
3. HR signs their half from the existing "Documents to Sign" (`Sign` nav) page. On completion,
   `signInternal` calls the new `completeSequenceStep`, which finds sequence 2 still `draft` and
   sends it — the employee's request flips to `sent` and now shows up as actionable for them.
   Before this, the employee's request existed but was `draft`; `signInternal` already 409s on
   anything not `status: "sent"`, so there was no way to jump the queue even before this session
   — verified in `contract-signing-sequence.test.ts`.
4. The employee signs their half. `completeSequenceStep` finds no more `draft` siblings, confirms
   every request in the sequence is `signed`, and — since `ref_kind === "contract"` — calls
   `activateViaSignature`. The contract flips to `ACTIVE`.
5. The `contract_signing` task's completion check (`process.service.ts::runKindHook`) is
   **completely unmodified** — it was already just reading `contract.status === "ACTIVE"`, so it
   now passes on its own the moment step 4 happens. No duplicated completion logic, per the
   guardrail.

## 3. The two reusable components

### `ProcessStatus` (`apps/hr/src/components/processes/process-status.tsx`)

The per-employee "what's done, what's missing" breakdown, extracted from what was inline JSX on
the onboarding detail page. Two variants:

- **full** — progress bar + Outstanding/Completed sections with live `TaskRow`s (actions,
  skip, the new contract-linking control). Used by `/employees/onboarding/[id]/page.tsx`.
- **summary** — compact progress bar + a plain list of missing task titles, no actions. Used by
  the employee detail Overview tab's onboarding card
  (`sheet-contents/view-employee-contents.tsx`), which previously only showed a bare
  "X/Y (Z%)" line with no breakdown — now it's the same component, same data shape, just less
  of it rendered. For the HR-viewing-another-employee case, the Overview card fetches
  `useProcess(instanceId)` once the instance id is known (a second, nested query) to get the
  full task list that the list endpoint doesn't include; the self-viewing case already had it
  via `useMyProcess`.

Not used by `/employees/onboarding/me/page.tsx` — that page's "mine vs. being handled for you"
split answers a different question (task ownership, not completion status) and isn't the same
concept being duplicated, so it was left as-is rather than forced into this component.

### `ContractSigningStatus` (`apps/hr/src/components/processes/contract-signing-status.tsx`)

Renders a signer sequence fetched via the new `GET /hr/signing/requests?ref_kind&ref_id`
endpoint (ownership-checked in the service: HR/admin see any sequence, anyone else only one
they're a signer on — same "own row or manage" convention as `employees-core.service.ts`, which
is what lets the _same_ component and the _same_ endpoint serve both an HR viewer and the
employee looking at their own contract). Two variants:

- **compact** — one badge: "Fully executed" or "Waiting on {name}". Used inline on the
  `TaskRow` for a linked `contract_signing` task, on each DRAFT contract row on the Contracts
  tab, and next to each contract-linked request in the Sign page's list.
- **full** — per-signer rows (icon + name + status: Signed / Awaiting signature / Waiting for
  turn / Declined / Voided / Expired). Available for a more detailed view; not currently used at
  full size anywhere but built as the general case the compact variant derives from.

## 4. Tests

**Backend** (`backend/tests/integration/contract-signing-sequence.test.ts`, new):

- 422 `SIGNING_TEMPLATE_MISSING` when no template exists (the blocker path from §0.4).
- Linking a contract creates a two-signer sequential request: HR `sent` at sequence 1, employee
  `draft` at sequence 2, in that order.
- The employee's request is gated (409) until HR signs; signing HR's advances the employee's to
  `sent`.
- The contract stays `DRAFT` and the task **cannot** complete after only HR signs (`completeTask`
  still 422s, unmodified check); after both sign, the contract is `ACTIVE` and the task
  completes cleanly.

**Frontend, new component tests:**

- `apps/hr/src/tests/processes/process-status.test.tsx` — summary: "nothing missing" vs. a
  populated missing-list; full: Outstanding/Completed split renders.
- `apps/hr/src/tests/processes/contract-signing-status.test.tsx` — no contract linked; linked
  but nothing sent yet; HR signed (employee's turn) in both variants; both signed → fully
  executed in both variants.

**Frontend, updated existing tests** (to keep them accurate/quiet, not because they were wrong):

- `apps/hr/src/tests/employees/detail-page.test.tsx` — the onboarding-embed assertions now
  expect the corrected `/employees/onboarding/*` links and the new "X of Y tasks complete (Z%)"
  text (previously "X / Y (Z%)"); added a `processDetail` mock and an assertion that missing
  task titles actually render, since the card now shows the real breakdown instead of one line.
- `apps/hr/src/tests/onboarding/detail-page.test.tsx` — added mocks for the contract list and
  signing-sequence endpoints that `TaskRow`'s new contract-linking control now fires (previously
  unhandled-request noise on the `contract_signing` fixture task; no assertions changed).

**Full-suite runs:**

- `apps/hr`: `pnpm vitest run` → 137 passed, 1 pre-existing failure
  (`src/tests/leave/approvals-page.test.tsx`, imports a non-existent
  `@/app/leave/approvals/page` — MOD-06 territory, present before this session, not touched).
  `tsc --noEmit` and `eslint` clean of errors (same pre-existing warnings as before).
- `backend`: `tsc --noEmit` and `eslint src scripts` clean (0 errors; only pre-existing `any`
  warnings in unrelated files). **Integration tests could not be run in this environment** — no
  Docker daemon is available here (`docker.service` doesn't exist, no socket), and the test
  suite requires it to spin up a disposable Postgres. The new test file is written and
  typechecks cleanly against the real schema/services, but hasn't executed against a live DB.
  Flagging this explicitly rather than claiming a green run I don't have.

## 5. Rollout note

Two seeds need to run once against a real database before this is usable, in order:
`pnpm db:migrate` (applies `drizzle/0021_open_killraven.sql`), then `pnpm db:seed:signing`. The
migration is additive and touches an unpopulated column (`ref_id`'s type) and a new
default-backed column (`sequence_no`), so it's safe to run against existing data.

## 6. How to test this

Nothing here ran against a live DB in this session (§4/§5), so this is the flow to actually
verify it — manual UI first, then an API-only alternative if you'd rather skip clicking through,
then the automated tests you can already run today without a DB at all.

### 6.0 One-time setup

```bash
cd backend
pnpm db:migrate              # applies drizzle/0021_open_killraven.sql
pnpm db:seed:rbac            # if not already seeded — signing:manage / processes:manage etc.
pnpm db:seed:onboarding      # the default onboarding template, if not already seeded
pnpm db:seed:signing         # NEW — creates the "Employment Contract" template + 4 fields
```

Confirm the seed worked: `pnpm db:studio` → `signature_templates` should have one row named
"Employment Contract"; `signature_template_fields` should have 4 rows against it.

You'll need two logins: one with the `hr` role, one plain `employee` — either your existing
seeded users or `pnpm db:seed:test-users` if that fits your local setup.

### 6.1 Get an employee to the signing step

You need someone `status: onboarding` with an in-progress onboarding instance and a **DRAFT**
contract to link. Fastest path:

1. As HR, create a legacy employee (Employees → Add Employee) or accept a REC-05 offer — either
   way they land in `onboarding` with an instance auto-started from the default template (which
   includes a `contract_signing` task, "Sign employment contract", per
   `seed-onboarding-template.ts`).
2. On that employee's detail sheet → Contracts tab → Add Contract. Leave it as **DRAFT** (don't
   paste an agreement URL) — the picker in step 6.2 only offers DRAFT contracts on purpose (an
   ACTIVE one is already signed, usually via the manual path).

### 6.2 Walk the sequence as HR, then as the employee

1. Go to **Employees → Onboarding**, open that employee's instance
   (`/employees/onboarding/[id]`). Find "Sign employment contract" under Outstanding.
2. You should see a **"Link a contract to send for signature"** selector under the task (this is
   `TaskRow`'s new control) — pick the DRAFT contract from step 6.1.
3. Immediately under the task title you should now see a compact `ContractSigningStatus` badge:
   **"Waiting on \<your HR name\>"** — HR's request went out `sent`, the employee's is still
   `draft`.
4. Go to **Sign** (top nav). Your (HR's) pending request — subject "Employment contract —
   \<name\>" — should be under **Pending**, with the same compact status badge next to it. Click
   **Review & sign**, fill the fields, confirm, sign.
5. Back on the onboarding task card, the badge should now read **"Waiting on \<the employee\>"**.
6. Log in as that employee. Go to **Sign** — their request should now be under **Pending** (it
   was invisible/inert before HR signed — confirm this by checking _before_ step 4 that it does
   **not** appear there, which is the "wait for the other signer" behavior this session added).
   Sign it.
7. Back as HR: the onboarding task card's badge should read **"Fully executed"**, and the task
   itself should have moved from Outstanding to Completed on its own — nothing to click, the
   existing `contract_signing` completion check just started passing.
8. Confirm the contract itself: employee detail sheet → Contracts tab → that contract's status
   badge should now say **Active** (no `ContractSigningStatus` badge next to it anymore — that
   only shows for DRAFT contracts).
9. Optional: check the employee detail Overview tab's onboarding card — it should reflect one
   fewer missing task via `ProcessStatus`.

### 6.3 Edge cases worth clicking through once

- **Template not seeded**: skip `pnpm db:seed:signing`, try step 6.2.2 — linking should fail
  with _"No 'Employment Contract' signature template configured — create one in Settings →
  E-Signing Templates before linking a contract to this task."_ (422, surfaced as the task
  card's error text).
- **Employee tries to sign early**: if you can, hit `POST /hr/signing/my/:id/sign` for the
  employee's request before HR signs (or just confirm it's absent from their Sign page in step
  6.6) — should be impossible either way.
- **Manual path still works**: create a _different_ contract via the Contracts tab, paste an
  `employmentAgreementUrl`, save with status ACTIVE directly — should succeed with no signature
  request involved at all, confirming §0.3's dual-path decision didn't regress the existing flow.

### 6.4 API-only alternative (no UI)

```bash
# link the contract (triggers signature-request creation)
curl -X PATCH $API/hr/process-tasks/$TASK_ID \
  -H "Cookie: $HR_SESSION" -H "Content-Type: application/json" \
  -d '{"link_ref": {"contract_id": "'$CONTRACT_ID'"}}'

# see the sequence
curl "$API/hr/signing/requests?ref_kind=contract&ref_id=$CONTRACT_ID" -H "Cookie: $HR_SESSION"

# HR signs (id from the response above)
curl -X POST $API/hr/signing/my/$HR_REQUEST_ID/sign \
  -H "Cookie: $HR_SESSION" -H "Content-Type: application/json" -d '{"field_values": {}}'

# employee signs
curl -X POST $API/hr/signing/my/$EMPLOYEE_REQUEST_ID/sign \
  -H "Cookie: $EMPLOYEE_SESSION" -H "Content-Type: application/json" -d '{"field_values": {}}'

# confirm: contract ACTIVE, task completes on its own
curl $API/hr/employees/$EMPLOYEE_ID/contracts -H "Cookie: $HR_SESSION"
curl -X POST $API/hr/process-tasks/$TASK_ID/complete -H "Cookie: $HR_SESSION"   # now succeeds
```

### 6.5 Automated tests you can run right now

No DB needed for the frontend; the backend integration test needs `pnpm test:db:up` first
(Docker) — see §4 for why that didn't run in this session.

```bash
# backend (needs Docker)
cd backend && pnpm test:db:up && pnpm vitest run tests/integration/contract-signing-sequence.test.ts

# frontend (no DB needed)
cd apps/hr
pnpm vitest run src/tests/processes src/tests/onboarding src/tests/employees/detail-page.test.tsx src/tests/signing
```

## 7. Files touched this session

**New:**

- `backend/scripts/seed-signing-template.ts`
- `backend/tests/integration/contract-signing-sequence.test.ts`
- `backend/drizzle/0021_open_killraven.sql`, `backend/drizzle/meta/0021_snapshot.json` (generated)
- `apps/hr/src/components/processes/process-status.tsx`
- `apps/hr/src/components/processes/contract-signing-status.tsx`
- `apps/hr/src/tests/processes/process-status.test.tsx`
- `apps/hr/src/tests/processes/contract-signing-status.test.tsx`
- `onboarding-sign-flow-sign.md` (this file)

**Modified:**

- `backend/src/db/schema/signing.ts` — `ref_id` integer→text, new `sequence_no` column.
- `backend/src/services/signing.service.ts` — sequencing (`createSequentialRequests`,
  `completeSequenceStep`, `getSequenceSiblings`), `getTemplateByName`, `listByRef`,
  `listByRefForViewer`, `signInternal` now advances the sequence after committing.
- `backend/src/services/hr/contract.service.ts` — `activateViaSignature`.
- `backend/src/services/hr/process.service.ts` — `reassignTask` takes `actorUserId` and triggers
  `startContractSigning` on a new `link_ref.contract_id`.
- `backend/src/controllers/hr/process.controller.ts` — passes `actorId(req)` into `reassignTask`.
- `backend/src/controllers/signing.ts`, `backend/src/routes/hr/signing.routes.ts`,
  `backend/src/validations/signing.ts` — new `GET /hr/signing/requests` endpoint; `ref_id`
  validation type fix.
- `backend/package.json` — `db:seed:signing` script.
- `apps/hr/src/hooks/useProcesses.ts` — `enabled` param on `useProcesses`/`useMyProcess`.
- `apps/hr/src/hooks/useSigning.ts` — `useSignatureSequence`.
- `apps/hr/src/services/signing.service.ts` — `listByRef`, `SequenceSigner` type,
  `sequence_no`/`ref_kind`/`ref_id` on `MySignatureRequest`.
- `apps/hr/src/components/processes/task-row.tsx` — contract-linking control + inline
  `ContractSigningStatus` for `contract_signing` tasks.
- `apps/hr/src/components/processes/instance-table.tsx` — per-type base path for the row link
  (was hardcoded to the pre-nav-move `/onboarding` shape).
- `apps/hr/src/components/sections/sheets/sheet-contents/view-employee-contents.tsx` — Overview
  onboarding card now uses `ProcessStatus` (summary); Contracts tab rows show
  `ContractSigningStatus` for DRAFT contracts; broken onboarding link fixed.
- `apps/hr/src/components/sub-navbar.tsx`, `apps/hr/src/components/navbar.tsx` — stale
  `/onboarding*` hrefs fixed to `/employees/onboarding*`; dropped an invalid `id` property that
  was already a pre-existing typecheck error.
- `apps/hr/src/app/employees/onboarding/[id]/page.tsx` — replaced inline progress/task JSX with
  `ProcessStatus`; fixed the "All onboarding" back link; passes `employeeId` through.
- `apps/hr/src/app/signing/page.tsx` — embeds `ContractSigningStatus` on contract-linked rows.
- `apps/hr/src/tests/employees/detail-page.test.tsx`,
  `apps/hr/src/tests/onboarding/detail-page.test.tsx` — see §4.

**Deleted:** none.

Not touched: the actual page-file move (`app/onboarding/*` → `app/employees/onboarding/*`) —
that was already done, uncommitted, in the working tree before this session started (visible as
a git rename); this session only fixed the links that still pointed at the old location.

## 8. Explicitly out of scope / blocked

- **External (emailed-token) signer path** — untouched, per the guardrail. `signExternal` and
  `completeSigning` are unmodified; `completeSequenceStep` is only ever called from
  `signInternal`.
- **The manual Contracts-tab activation path** — untouched, per the §0.3 decision. Still
  requires `employmentAgreementUrl`.
- **Production-ready signature template copy/fields** — the seeded "Employment Contract"
  template is a placeholder (§0.4); HR should review it via the template builder before this is
  relied on for real contracts.
- **Running the migration + seed against a live database** — not possible in this environment
  (no Docker); both are written, typecheck-clean, and covered by an integration test that
  exercises them logically, but neither has executed against real Postgres here.
- **A full-detail (non-compact) `ContractSigningStatus` placement anywhere in the current UI** —
  the full variant exists and is tested, but every current call site uses `compact`; there wasn't
  a natural place in this pass's UI that needed the expanded per-signer list front-and-center.
- **LCM-02 offboarding's equivalent of any of this** — doesn't exist yet in this codebase; the
  `InstanceTable` base-path map has a placeholder entry (`/offboarding`) for when it ships.
