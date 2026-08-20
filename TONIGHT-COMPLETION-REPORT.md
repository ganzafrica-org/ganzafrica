# Tonight's completion report

All three waves shipped, verified, and committed directly on `mod-01-employees-core` (no branches/worktrees, per instructions). 11 commits, `b1ebb29..HEAD`. Nothing pushed.

**Final state:** backend 54 test files / 532 tests passing; frontend typecheck + lint (0 errors) clean, 196 tests passing (2 flake under full-suite parallel load — both individually reconfirmed passing every time, see "Known flakiness" below); 8 new Playwright e2e specs + the pre-existing backend-health smoke test all passing in one full run.

---

## Shared infrastructure (not one of the 9 tasks, but required for all of them)

- Installed Chromium for Playwright (wasn't present in this environment).
- Stood up the dev stack (`backend` :3002, `hr` app :3006) for the whole night; added `http://localhost:3006` to `backend/.env`'s `CORS_ORIGINS` (the HR app's own dev port wasn't in it — a pre-existing local-env gap, `.env` is gitignored so this isn't a committed change).
- `e2e/tests/support/auth.ts`: shared login helper (`openAsRole(browser, role, path)`) using the seeded `hr@test.local`/`employee@test.local` accounts against the real backend, since cookies set talking to :3002 are host-only and carry over to :3006. Committed separately (`b1905b2`) after noticing it was a missing dependency of the first three e2e specs.
- Created isolated Postgres test databases (`ganzafrica_test_1b/1d/1e/2b/2c`) so parallel subagents' integration-test runs (each doing `resetDb()` truncation) couldn't stomp on each other. Real dev/test data lives in `ga_hr` / `ganzafrica_test` as before.
- `.gitignore`: added `e2e/test-results/` and `e2e/playwright-report/` (Playwright run artifacts were untracked and about to get swept into a commit).

---

## Wave 1

### 1A — Account deletion → deactivation

Replaced hard-delete with reversible deactivate/reactivate. **Schema decision to sanity-check:** added `employees.is_active` (boolean, default `true`, additive) — deliberately independent of `status`, which stays owned by the onboarding/offboarding process engine. Deactivating flips both `employees.is_active` and the linked `users.is_active` (blocks login — reuses the existing `!user.is_active` 401 check in `auth.ts::login`, no new auth logic needed). Directory defaults to active-only; `?active=inactive|all` opts in. Frontend: "Delete" → "Deactivate" (confirm dialog) / "Reactivate" (direct), gated the same as before.

### 1B — Real data on the Leave table

The dummy-data table turned out to be the "Leave Requests" table on `employees/time-off`, not literally hardcoded — it called `GET /hr/leaves`, a legacy HR-only route, so every non-HR viewer 403'd and saw the error state (visually indistinguishable from "still showing fake data"). Added `GET /hr/leave/requests` (own + manager-chain reports for a regular user, everyone for HR/admin), reusing the existing manager-chain helper. The Public Holidays/Annual Leave calendar (confirmed correct, untouched) is a _separate_ page (`app/leave/page.tsx`) built on genuinely mock data (`src/data/leave-data.ts`) — left alone per instruction, not to be confused with the table that was actually fixed.
**Sibling audit finding:** `apps/hr/src/components/time-off-module.tsx` is fully mock but dead code (zero imports anywhere) — flagged for removal, not wired up (would be effort spent on a component nothing renders).

### 1C — PDF viewer ("PDFx")

**Already correct — no source change.** The existing `<iframe src={presignedUrl}>` already renders Chrome's native PDF viewer (the toolbar in the reference screenshot) automatically, verified live in a headed browser. A `react-pdf` swap was prototyped and rejected: pdf.js reads via `fetch()`, and the storage bucket doesn't answer CORS preflights — confirmed that would have broken the viewer. Added tests pinning the existing contract instead of touching working code.

### 1D — Document category templates

New, additive, standalone entity (`hr_document_category_templates`: name, one of green/yellow/blue/orange, simple branding fields) inside the Documents page's Categories tab, mirroring the assets module's category-admin-sheet pattern. **Deliberately not wired to `hr_documents.category`** (a fixed 6-value enum) — auto-generating a document from a template is real follow-up work, not built tonight, per the source doc's own allowance. Table left unseeded (forcing an arbitrary name→color mapping onto the 6 fixed categories would recreate the coupling this design avoids).

### 1E — "Who can see this document" legibility + ACL verification

Typography: sub-headers and checkbox labels were `text-xs`, genuinely smaller than the rest of the form; bumped to `text-sm font-medium` with matching spacing. **Found and fixed a real bug** while verifying the ACL wiring end-to-end (not just reading the code): `validate()` Zod-parses the JSON-stringified `access` form field for a clean 400 but never writes the parsed value back onto `req.body`, so the controller forwarded the raw _string_ into the jsonb column (double-encoded on write). The runtime read path survived by accident (drizzle's jsonb decoder re-parses strings defensively), but the on-disk storage type was wrong. Fixed with explicit parsing in the controller; pinned with a direct `jsonb_typeof` assertion plus a full create-then-verify integration test through the real multipart route.

---

## Wave 2

### 2A — Personal Details dedupe (Create Employee wizard)

The contract-step + inline-signing work this task's brief warned to check for was already landed (from earlier tonight's own prior session) — built on top of it as instructed. Step 2 now pre-fills `job_title`/`department`/`hired_at→startDate` from step 1, one-way (editing step 2 never writes back), only filling what step 2 doesn't already have (so re-visiting doesn't clobber an edit). `employment_type` deliberately **not** carried over — profile's enum (staff/contractor/analyst/fellow/intern) and the contract's (full-time/part-time) share a label but are unrelated fields.

### 2B — Employee status lifecycle + creation notification

**Schema decision to sanity-check:** added `"pending"` as an additive `employees.status` value (Postgres CHECK constraints require drop+recreate to widen — not a real migration risk, no data touched). A new hire now starts `pending`, not `onboarding` directly. **Where the transition lands:** `createEmployee` still instantiates the onboarding process instance immediately in the same transaction as before (checklist exists right away) but sets initial status to `pending`; `process.service.ts`'s `completeTask`/`skipTask` now call a new `maybeStartOnboarding()` that flips `pending → onboarding` on the employee's first task action of any kind; `onboarding → active` reuses the **existing**, unmodified `maybeCompleteInstance` completion path — no new completion-detection logic was needed, LCM-01 already had it.
**Flagged, not fixed:** REC-05's offer-accept hire path (`offers.service.ts`) still lands new hires straight in `"onboarding"`, bypassing `pending` entirely — a real inconsistency between the two hire paths, left untouched as out of scope rather than silently changed.
Notification: `EMPLOYEE_CREATED` was already a fully-routed notification type (HR/admin recipients, not the new hire) that nothing had ever actually called `sendNotification` for. Wired in post-commit in the controller. No frontend changes needed — the existing notification feed renders any type generically by title/message.

### 2C — Sign from the onboarding checklist

Corrected mid-task: the reference screenshot (`img.png`) is the onboarding **task checklist** page, not the main documents list as the original brief assumed. Added, scoped to `contract_signing` task rows only: a "View" button (opens the linked contract read-only via the existing `ContractViewSheet`, reusing 1C's confirmed-correct viewer) and a "Sign" button (shown whenever the current viewer has a pending signature request against that contract, via the existing `useMySignatures()` — independent of task assignee, since the sequential HR-then-employee flow means either party's turn can land on the same row). No signing-backend changes — this only wires an existing, working system onto a surface that couldn't reach it before.

---

## Wave 3 — HR landing page

Investigated first: the real landing page is `apps/hr/src/app/page.tsx` (root `/`, what the nav actually routes to day-to-day) — `src/app/dashboard/page.tsx` is a separate, fully-mock legacy prototype that nothing links to except a post-login redirect fallback; left untouched as clearly out of scope (doesn't match any of the described sections).

- **headerStats:** new `GET /hr/employees/stats` (one grouped COUNT query by status, active-roster scoped) backs both the header tiles and the Employee Status circles from a single source. The doc's "Attendance ViewEmployeeContents" reference didn't map to anything literally present in the real landing page (HR had no headerStats row at all before tonight) — built a sensible new row (Total Employees / Active / Onboarding / **Alerts**), with Alerts as the explicit inert placeholder the doc asked for. **Worth a sanity check:** if there was a specific 4th real metric in mind beyond what I chose, easy to swap.
- **Employee Status card:** same 3-bubble visual, relabeled from the wrong employment-type categories (Permanent/contract/Internship) to the real lifecycle statuses (Active/Onboarding/Pending), real counts.
- **Leave summary:** real org-wide pending-request and on-leave-today counts, real monthly Annual-vs-Sick trend — from 1B's `GET /hr/leave/requests` (no new data source). Replaced the old static "34 Days"/"78 Days" tiles, which read like a personal balance oddly placed on an org-wide HR card.
- **Ongoing onboarding (new card):** org-wide in-progress onboarding instances via the existing process engine, each row linking to that employee's checklist.
- **Applicants summary:** confirmed Recruitment is fully integrated (live nav item, real `useRecruitment.ts` hooks/endpoints) — wired real hire-rate and applications-in-pipeline counts from `GET /hr/recruitment/opportunities`' stage breakdowns, per the doc's own "if yes, wire real data" branch.
- **Schedule:** real "who's away" calendar + avatar list, sourced from the same leave data as Leave summary (no new data source) — mock Meetings/Events/Holiday tabs removed entirely.
- **System Alerts:** untouched, as explicitly instructed.

---

## Known flakiness (not a regression)

Every full-suite frontend run tonight (before _and_ independent of any of these changes) intermittently times out 1–2 unrelated tests under full parallel load — confirmed every single time, across all three waves, that the same specific test passes cleanly when run in isolation immediately after. This looks like resource contention in this environment under the full 40-file parallel suite, not a code defect. Backend suite never showed this behavior.

## Pre-existing, untouched

- `apps/hr/src/tests/leave/approvals-page.test.tsx` — references an already-removed page (`@/app/leave/approvals/page`), present before any work tonight (MOD-06 territory).
- The final full e2e run's only failure was the pre-existing portal smoke test (`portal login page renders`) — it needs the portal app running on :3001, which nothing tonight required, so it was never started.

## Coordination

No collisions. Wave 1's five tasks (and Wave 2's three) touched disjoint files as pre-checked; the one near-miss was `apps/hr/vitest.config.ts`'s `access-builder.tsx` coverage-include line landing inside the 1B commit instead of 1E's own (both were mid-flight editing that file's `include` array within seconds of each other) — cosmetic attribution only, the line itself is correct and wanted either way.

## Not pushed, no PR opened, per instructions.

---

## Follow-up fixes (2026-08-20)

Two issues reported after testing in the browser.

### Employee-creation invite email didn't reach onboarding

Investigated the manual-create invite path (`employees-core.controller.ts`) end to end before
changing anything, and found three separate real bugs stacked on top of each other — not just
the one you could see:

1. **Why you saw nothing in the browser:** `RESEND_API_KEY` isn't set in `backend/.env`, so
   `sendEmail` was silently no-op'ing (a one-line `logger.warn`, nothing else) — this is a config/
   secret, not something I can set for you. Until a real key is added, no email leaves the server
   in this environment. To make local dev usable without one, `sendEmail`'s no-op path now also
   logs every link the email would have contained, so you can copy the invite link straight out of
   the backend console.
2. **The link was pointed at the wrong app.** `email.service.ts` built the reset-password/verify/
   login links from `env.WEBSITE_URL` (`localhost:3000`, the public marketing site, `apps/web` —
   no login or reset-password route exists there). Those routes actually live in the portal app.
   Fixed to use the existing, already-correct `env.PORTAL_URL` (`localhost:3001`) instead — this
   also fixes the general "forgot password" and email-verification links, not just the invite.
3. **No email had ever said "log in and land on onboarding."** The invite fired two separate,
   generic emails (a "Welcome" email with no link, plus a bare "Reset your password" email) and
   neither carried any destination beyond the portal's own login/platform-selection screen.

**Fix, matching your stated goal** ("a link that logs them in and lands exactly on the onboarding
page"): the invite now sends one combined, branded email — reusing the existing password-reset
token machinery to mint the link (`auth.service.ts::createSetPasswordLink`), but folding it into
`welcomeEmail()`'s own "Set up your account" button instead of a second, separate email.

Landing exactly on `/employees/onboarding/me` required threading a `next` parameter through the
portal's existing (but previously incomplete) SSO chain, all additive:

- The set-password link now carries `?next=/employees/onboarding/me`.
- `reset-password-form.tsx`: on success, forwards `next` into `/login?next=...` instead of a bare
  `/login` (previously dropped it on the floor).
- `login-form.tsx`: previously ignored any `next` entirely and always sent every login to the
  platform-selection chooser. It now reads `next`; if present and validated as a same-app relative
  path (never an absolute/protocol-relative URL — avoids turning this into an open redirect), it
  calls the portal's existing `redirectToApp("hr", ...)` SSO-handoff helper directly with that
  path, skipping the chooser screen entirely. No `next` (the normal login case) is unchanged.
- `employees-core.controller.ts`: `sendPasswordReset` (which always sent its own separate email)
  was replaced with the new `createSetPasswordLink`, which only mints the token/link.

Net effect: HR clicks Add Employee → the new hire gets one email → sets a password → logs in →
lands exactly on `/employees/onboarding/me`, no chooser screen, no second email. Verified live
against the running dev stack (curl through the real create-employee endpoint, confirmed exactly
one `password_reset_tokens` row and one logged link in the correct
`http://localhost:3001/reset-password?token=...&next=%2Femployees%2Fonboarding%2Fme` shape); the
existing `employees-core-api.test.ts` invite assertion and the full recruitment-offers suites
(which share the underlying token machinery) still pass unchanged, plus the full 532-test backend
suite. **Still needs a real `RESEND_API_KEY`** in whichever environment you want actual delivery
from — that part is a config step, not a code fix.

Out of scope, left untouched: REC-05's own offer-accept welcome email (`offers.ts::sendWelcome`)
still sends its old two-email pattern with no onboarding target — it wasn't part of this ask, but
now that `createSetPasswordLink` exists, folding it in later is a small, isolated change.

### Onboarding table now matches the employees table

`apps/hr/src/app/employees/onboarding/page.tsx`'s table (`instance-table.tsx`) was a bespoke,
one-off `<Table>` — different look, no search box, no pagination, no sortable columns, and a
`cursor-pointer` row style with no click handler actually wired to it (rows silently did nothing
except the employee-name text, which was a real link). Rewrote it to use the same shared
`DataTable` component the employees directory (`table-component.tsx`) already uses, keeping the
same public props (`rows`, `type`, `isLoading`, `isError`) so the page that renders it needed no
changes, and any future offboarding index page (LCM-02, not shipped yet) gets the same look for
free. Same visual columns as before (Employee + overdue badge, Role, Progress bar, Started,
Status), now with the employees table's search/sort/pagination toolbar, and the whole row is
genuinely clickable through to that onboarding checklist (fixing the latent dead-click bug).
Verified: typecheck and lint clean, no regressions in the full frontend suite (the one full-suite
failure, `approvals-page.test.tsx`, is the same pre-existing MOD-06 gap noted above — confirmed
unrelated by running it in isolation).
