# Testing Strategy — TDD Conventions

> Every spec's §6 lists concrete test cases; this doc sets the shared conventions.
> Infrastructure is installed by FND-04.

## 1. Test pyramid & tools

| Layer                     | Tool                                                                          | Where                                       | Runs                        |
| ------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------- | --------------------------- |
| Backend unit              | vitest                                                                        | `backend/src/**/*.test.ts` (colocated)      | every PR                    |
| Backend integration (API) | vitest + supertest against a real test Postgres                               | `backend/tests/integration/**`              | every PR                    |
| Frontend unit/component   | vitest + Testing Library + MSW (already set up in apps/hr — replicate config) | `apps/<app>/src/**/*.test.tsx`              | every PR                    |
| E2E                       | Playwright                                                                    | `e2e/` (workspace package `@workspace/e2e`) | merge to dev/main + nightly |

Backend standardizes on **vitest** (the existing jest/mocha mix is removed in FND-04).

## 2. TDD rule

Each spec lists tests to write FIRST. The implementing agent:

1. Writes the listed tests (they fail).
2. Implements until green.
3. May add tests, may not delete listed ones. A PR that weakens or skips a listed test is rejected.

## 3. Backend integration conventions

- Test DB: `ganzafrica_test` Postgres (local: docker `postgres:16` or native; CI: service
  container). Harness applies drizzle migrations once per run, truncates all tables between
  test files (fast) via a `resetDb()` helper.
- Factories in `backend/tests/factories/` (plain functions returning insert objects:
  `makeUser()`, `makeEmployee()`, `makeOpportunity()`, `makeApplication()`, `makePayroll()`...).
  No fixtures-by-SQL-dump.
- Auth in tests: `loginAs(role)` helper creates a user with the role and returns an agent
  with the session cookie set — tests exercise the REAL auth middleware, no mocking of auth.
- External services are faked at the boundary: Resend (email) and S3/Spaces clients are
  injected/mocked module-level; assert on calls (e.g. "one email queued to X with link Y").
  Never hit real Spaces/Resend in tests.

## 4. Frontend conventions

- MSW handlers per service module mirror the backend API contract from the spec's §4 —
  when a spec changes an endpoint, its MSW handler changes in the same PR.
- Test user-visible behavior (roles see/don't-see, loading/empty/error states), not
  implementation details.

## 5. E2E conventions

- Playwright projects: `chromium` only (CI time), desktop + one mobile viewport.
- Runs against the real stack via docker compose (CI) or `turbo dev` (local), seeded by
  `e2e/seed.ts` (uses the factories through a backend seed endpoint enabled only when
  `NODE_ENV=test`).
- Core suites (grown by specs): auth (login, SSO handoff portal→hr, logout-everywhere),
  payslip-link (email link → PDF redirect), recruitment (public apply happy path +
  eligibility instant-reject), leave request→approve, onboarding checklist flows.
- E2E failures block deploy (they run in deploy.yml before the SSH step).

## 6. CI gates (FND-04)

- PR: prettier check, eslint, typecheck, unit + integration tests, build — all via
  `turbo run` with `--filter=...[origin/dev]` (affected only).
- dev/main merge: everything + Playwright e2e.
- Coverage: **no global threshold** (most of the repo predates test discipline — we don't
  backfill on unrelated work). Instead a **scoped ratchet**: code under active TDD is gated at
  **90%** and CI fails below it. Enforced today on the backend's `src/services/recruitment/**`
  (statements/branches/functions/lines all 90) and the hr app's recruitment UI
  (`src/{components,lib}/recruitment/**`, `recruitment.service.ts`, `useRecruitment.ts` —
  statements/functions/lines 90, branches 85 since UI conditional-render branches are hardest to
  reach). Widen the include glob + thresholds in each package's `vitest.config.ts` as other areas
  grow real suites — never lower an existing floor. Run locally with
  `pnpm --filter <pkg> test:coverage`.
