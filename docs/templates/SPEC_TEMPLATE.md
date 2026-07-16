# SPEC-XX: Title

> **Status:** Draft | Ready | In progress | Done
> **Track:** A (user) / B (colleague) — default, reassignable
> **Depends on:** SPEC IDs that must be DONE before this starts
> **Blocks:** SPEC IDs waiting on this
> **Branch naming:** `feat/<spec-id>-<slug>` off `dev` (never commit to `dev` directly)

## 1. Goal

2–4 sentences: what exists after this spec is implemented, and why it matters.

## 2. Context & current state

Exact file paths of everything this touches. What exists today, what is broken/mock,
what must not break. An implementer with no other context reads only this section
and knows where they are.

## 3. Schema changes

Full Drizzle table definitions (TypeScript, matching the conventions in
`backend/src/db/schema/`) + the migration procedure (`pnpm db:generate`, migration
file expectations). State explicitly if NO schema changes.

## 4. API

For every endpoint: method, path, auth middleware + required permission, request
body/query (with types), success response JSON example, every error case
(status + body). Note which existing services/utilities to reuse.

## 5. Frontend

Pages/routes touched, components to create/modify (exact paths), loading/empty/error
states, role-based visibility rules, which shared components to use.
State explicitly if NO frontend work.

## 6. Tests to write FIRST (TDD)

- **Backend unit/integration** (vitest + supertest): list each test case by name.
- **Frontend unit** (vitest + Testing Library + MSW): list each test case.
- **E2E** (Playwright): which flows this spec adds/extends.

The implementer writes these tests before the implementation and finishes when they pass.

## 7. Acceptance criteria

- [ ] Checkbox list. Each item independently verifiable by running something.

## 8. Edge cases & error handling

Enumerated. Include concurrency, idempotency, timezone, empty-state, permission-denied cases.

## 9. Out of scope

What is deliberately NOT done here (and which spec covers it).

## 10. Rollout / migration notes

Data backfills, feature flags, coordination points with the other track, revert plan.
