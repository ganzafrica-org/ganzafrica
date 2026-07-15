# FND-04: CI (PR checks) + Test Infrastructure

> **Status:** Ready
> **Track:** A
> **Depends on:** FND-03 (single workspace/lockfile)
> **Blocks:** FND-05 and every TDD spec (they need the harness); FND-08 (deploy pipeline extends this)
> **Branch:** `feat/fnd-04-ci-tests`

## 1. Goal

Every PR is gated on format, lint, typecheck, unit + integration tests, and build — affected
packages only, cached. The vitest/supertest/Playwright harness described in
`docs/architecture/testing-strategy.md` exists and runs locally and in CI.

## 2. Context & current state

- No `.github/` directory at all.
- Tests today: apps/hr has vitest + Testing Library + MSW (working config — copy it);
  backend has a stale jest + mocha/chai/sinon mix (remove).
- turbo.json exists with `build`, `lint`, `check-types`, `dev` tasks (align names: FND-03
  renames `check-types` → `typecheck`; add `test`).
- Backend has `/health`? Verify: if `backend/src/app.ts` lacks a health route, add
  `GET /health → 200 {"status":"ok","uptime":<s>}` here.

## 3. Backend test harness

- Remove jest/mocha/chai/sinon deps + configs from backend. Add `vitest`, `supertest`.
- `backend/vitest.config.ts`: node environment; `tests/setup.ts` runs migrations
  (`drizzle-kit migrate` programmatically against `DATABASE_URL_TEST`) once per run;
  `resetDb()` truncates all tables (`TRUNCATE ... RESTART IDENTITY CASCADE`, excluding
  `__drizzle_migrations`) between files.
- `backend/tests/factories/index.ts`: `makeUser(overrides?)`, `makeRole`, `makeOpportunity`,
  `makeApplication`, `makePayroll`, `makeHrUser` (+ grow per spec). Insert via drizzle,
  return the row.
- `backend/tests/helpers/auth.ts`: `loginAs(roleName)` → creates user+role via factories,
  performs real `POST /auth/login` with supertest agent, returns the cookie-bearing agent.
- Email/S3 fakes: `tests/mocks/` — vi.mock `resend` and `@aws-sdk/client-s3` +
  `@aws-sdk/s3-request-presigner` at the module level with recording fakes
  (`sentEmails: Array<{to, subject, html}>`, `presignedUrls: string[]`).
- Env: `backend/.env.test.example` → `DATABASE_URL_TEST=postgres://...:5432/ganzafrica_test`.

## 4. E2E package

- New workspace package `e2e/` (`@workspace/e2e`): Playwright, `playwright.config.ts` with
  `baseURL` per app via env; `e2e/seed.ts` calls a backend seed endpoint
  (`POST /test/seed`, mounted ONLY when `NODE_ENV=test`, guarded by an `x-test-key` header)
  that resets + seeds via the factories.
- First smoke specs: portal login page renders; backend `/health` 200; one full login
  (seeded admin) reaching platform-selection. (Feature suites grow via later specs.)

## 5. Workflows

`.github/workflows/ci.yml`:

```yaml
name: CI
on: { pull_request: {}, push: { branches: [dev, main] } }
concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }
jobs:
  checks:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_DB: ganzafrica_test, POSTGRES_PASSWORD: test }
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready" --health-interval 5s --health-retries 10
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }          # needed for --filter=...[origin/dev]
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - uses: actions/cache@v4            # turbo cache
        with: { path: .turbo, key: turbo-${{ github.sha }}, restore-keys: turbo- }
      - run: pnpm prettier --check .
      - run: pnpm turbo lint typecheck test build --filter=...[origin/dev]
        env: { DATABASE_URL_TEST: postgres://postgres:test@localhost:5432/ganzafrica_test }
```

`.github/workflows/e2e.yml`: on push to `dev`/`main` — build affected apps, start backend +
portal + hr (+ others as suites grow) with test env, run Playwright, upload trace artifacts
on failure. (FND-08 later moves the main-branch e2e run inside deploy.yml as a pre-deploy gate.)

Also: `.github/pull_request_template.md` — checklist: spec/ticket link, tests-first confirmation,
migration reviewed, screenshots for UI.

Branch protection (manual step, document in PR): `dev` and `main` require the `checks` job.

## 6. Tests to write FIRST

The harness IS the deliverable; prove it with:
1. A trivial backend integration test (`GET /health → 200`) passing locally + in CI.
2. A factory + loginAs round-trip test (create admin, login, `GET` an authenticated route → 200).
3. `resetDb()` isolation test (two files inserting the same unique email both pass).
4. apps/hr existing vitest suite runs under `turbo test`.
5. Playwright smoke suite green in e2e.yml.
6. A deliberately failing PR (type error) is blocked; reverting unblocks. (Do once, screenshot, revert.)

## 7. Acceptance criteria

- [ ] PRs show the `checks` job; affected-only filtering works (docs-only PR: no builds run).
- [ ] `pnpm turbo test` green locally repo-wide.
- [ ] Backend integration tests run against real Postgres in CI (service container).
- [ ] jest/mocha fully removed from backend.
- [ ] e2e package runs headed locally (`pnpm --filter @workspace/e2e test:headed`) and headless in CI.
- [ ] Branch protection on for dev + main.

## 8. Edge cases

- `--filter=...[origin/dev]` needs full git history — `fetch-depth: 0` (set above).
- Windows contributors: harness must run on Windows (paths, no `rm -rf` in scripts — use tsx/node scripts).
- Turbo cache poisoning by env-dependent tasks: declare `DATABASE_URL_TEST` in turbo.json `env` for `test`.
- Seed endpoint must be triple-guarded (NODE_ENV=test + header key + not mounted otherwise) — verify with a prod-mode boot test.

## 9. Out of scope

Deploy workflows (FND-08); coverage thresholds; fixing app test debt beyond making existing suites run.

## 10. Rollout

Land after FND-03.1. From this point every spec follows TDD against this harness.
