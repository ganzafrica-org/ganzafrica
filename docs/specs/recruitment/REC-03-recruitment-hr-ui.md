# REC-03: Recruitment HR UI (pipeline board, postings, application detail)

> **Status:** Ready
> **Track:** A
> **Depends on:** REC-02 (API + seed data)
> **Blocks:** — (REC-05 adds the offer tab into the detail panel)
> **Branch:** `feat/rec-03-recruitment-ui`

## 1. Goal

Replace the mock recruitment page in apps/hr with the real thing: job-posting management
(create → form builder → publish to the public site), a per-opportunity pipeline board, and
a full application-detail panel (answers, CV, screening flags, stage history, evaluation
scoring, emails). HR runs an entire hiring round without leaving the app.

## 2. Context & current state

- Mock today: `apps/hr/src/app/employees/recruitment/page.tsx` + `src/data/recruitment-data.ts`
  (hardcoded jobs/candidates) — replaced entirely.
- Rich archived UI to harvest (visual/layout reference, all mock):
  `apps/_archived/main/hr/recruitment/` (+ `recruitment/new`, `recruitment/[jobId]`,
  `recruitment/[jobId]/applications`) and `apps/_archived/hr/application-detail-panel.tsx`
  (55KB — mine it for the detail layout: tabs, applicant header, answers rendering).
  Harvest = copy what earns its place, rewire to real APIs, restyle to current hr app design;
  don't port dead weight.
- hr app stack: tanstack-query hooks pattern (`src/hooks/useX.ts`), services
  (`src/services/*.service.ts` via the shared api client), HeroUI/shadcn-local components
  (new components per FND-09 Wave E rule: import from `@workspace/ui`).
- API: everything in REC-02 §4 + REC-01 form/rules endpoints. Seed:
  `backend/scripts/seed-recruitment-demo.ts`.

## 3. Schema changes

None.

## 4. API

None new. If a UI need surfaces a missing endpoint, extend REC-02's routes in the same PR
with matching tests — note additions in the PR description.

## 5. Frontend (all under `apps/hr/src/app/recruitment/` — move out of employees/, add nav item "Recruitment", visible to `recruitment:manage|read`)

### 5a. `recruitment/page.tsx` — postings list
Cards/table: title, type (fellowship/employment), status (draft/published/closed by
deadline), per-stage counts (from `GET /hr/recruitment/opportunities`), views→applies mini
funnel placeholder (filled by REC-04). Actions: New posting, edit, view pipeline.
States: loading skeletons, empty ("No open positions — create one"), error retry.

### 5b. `recruitment/new` + `recruitment/[id]/edit` — posting editor
3 steps: (1) Details — title, description (reuse hr app's rich text editor if present, else
textarea), type, location, deadline, department/position-level (employment) or
program/cohort (fellowship) writing to `opportunities` + `employment_details`/`fellowship_details`
via existing opportunity endpoints (verify shape in `backend/src/routes/opportunity/`);
(2) Form — REC-01's `form-builder.tsx`; (3) Rules — eligibility rules (REC-01) +
screening rules (REC-02) in two tabs with an explainer line each ("Eligibility runs before
submission…", "Screening runs after…"). Publish button = publish opportunity + form
(confirm dialog listing what goes live on the public site).

### 5c. `recruitment/[id]` — pipeline board
- Columns = stages (submitted…hired; rejected/withdrawn collapsed into a footer drawer with
  counts). Cards: name, applied date, flag icon (+tooltip flag_note), weighted score badge
  when scored, "duplicate applicant" chip when same email has another application for this
  opportunity.
- Drag between columns → `POST .../transition` (optimistic, rollback + toast on 409 showing
  allowed moves). Reject via drag or card menu opens a dialog: reason (required), send-email
  checkbox (default on).
- Filters: search name/email, flagged-only, stage select (mobile fallback for the board = list + stage dropdown).

### 5d. Application detail panel (sheet/drawer from a card click) — the harvested 55KB panel, rebuilt
Tabs: **Profile** (standard fields, links to CV/supporting docs — presigned via existing
upload URLs), **Answers** (custom answers rendered by form definition of `form_version`),
**Evaluation** (criteria rows: my score inputs 0..max, comment; other reviewers' scores
read-only; weighted total), **History** (stage events timeline with actor names, automation
marked "System"), **Emails** (sent types + dates). Footer: stage transition select +
note (mirrors board rules).

### Hooks/services
`src/services/recruitment.service.ts` + `src/hooks/useRecruitment.ts` (query keys per
opportunity/list/detail; mutations invalidate the board + counts).

## 6. Tests to write FIRST

Frontend (vitest + MSW mirroring REC-02 contracts):
1. Board renders seeded stages/counts; illegal drag → card returns + toast (MSW 409).
2. Reject dialog: reason required; send_email flag passed through.
3. Detail Answers tab renders by pinned form_version (fixture with v1 vs v2 forms).
4. Evaluation tab: my inputs editable, others read-only; total updates after save (MSW echo).
5. Nav item hidden without recruitment permission (role-driven render test).
E2E (extends recruitment suite): create posting → publish → (public apply from REC-01 e2e) →
application appears in board → screen → shortlist (drag) → score → history shows it all.

## 7. Acceptance criteria

- [ ] Mock `recruitment-data.ts` and old mock page deleted.
- [ ] Full round runs on seed data: post → publish → applications visible → drag through stages → reject with email → evaluate with weighted total.
- [ ] Detail panel renders any seeded application without console errors, including legacy applications (null form_version → fall back to fixed-field rendering).
- [ ] Loading/empty/error states on every view; board usable at 375px width (list fallback).
- [ ] E2E green.

## 8. Edge cases

- Application against form v1 after v2 published — Answers tab uses v1 labels (never "unknown field").
- 100+ applications in a column: virtualize or paginate per column (pick one; virtualized list preferred — hr app already ships tanstack-virtual? check; else paginate at 50).
- Deadline passed: posting badge "Closed", public link shows closed state (REC-01 already handles the form side).
- Two HR users dragging the same card: 409 optimistic-rollback path (test 1 covers).

## 9. Out of scope

Offer tab (REC-05 adds it), funnel widget (REC-04 adds to 5a/5c), interview scheduling,
public site posting page changes (REC-01 owns the public side).

## 10. Rollout

Ship behind the nav permission — HR sees it when routes deploy; run one real posting in
parallel with the old manual process before switching fully.
