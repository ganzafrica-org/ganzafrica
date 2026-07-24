# FND-02: Drizzle Re-baseline — make `db:generate` + `db:migrate` just work

> **Status:** Ready
> **Track:** A
> **Depends on:** — (do this before ANY schema change anywhere)
> **Blocks:** FND-01, FND-05, REC-01, LCM-01/02, MOD-09/10/12 — every spec with a migration
> **Branch:** `feat/fnd-02-drizzle-rebaseline`

## 1. Goal

`pnpm db:generate` then `pnpm db:migrate` works on every environment (fresh dev DB, existing
dev DBs, prod) with zero custom scripts. The ad-hoc migration machinery is retired.

## 2. Context & current state

- Config `backend/drizzle.config.ts` is fine: `schema: "./src/db/schema/**/*.ts"`, `out: "./drizzle"`, postgresql.
- Exactly ONE generated migration exists: `backend/drizzle/0000_amused_victor_mancha.sql`
  (full 73-table baseline); journal `backend/drizzle/meta/_journal.json` has that single entry.
- Prod DB has the whole schema but `__drizzle_migrations` never tracked it → running
  `drizzle-kit migrate` re-executes 0000 → `type "application_status" already exists`.
- Workarounds to retire: `backend/src/db/migrations/` — ~20 hand-written tsx scripts
  (`01_create_roles.ts` … `20_add_is_published_to_projects.ts`), custom `migrate.ts` (programmatic
  migrate + `setupTriggers()` from `triggers.sql`), `baseline-database.ts`, `check-migrations.ts`,
  one-off `migrate-payroll*.ts` / `migrate-alumni.ts` / `run-*.ts` / `setup-triggers.ts`.
- `backend/package.json` scripts: `db:migrate` currently = `tsx src/db/migrations/migrate.ts`;
  `db:push` = `drizzle-kit push` (this is what people actually use — the root cause).
- Also present: empty `backend/prisma/schema.prisma` (abandoned; deleted in FND-03).

## 3. Procedure (ordered — do not reorder)

1. **Verify the baseline matches prod.**
   - Take a prod dump (`pg_dump --schema-only`), restore into a scratch DB.
   - Point `DATABASE_URL` at the scratch DB, run `drizzle-kit generate`.
   - If it produces a non-empty migration, the schema files and prod have drifted: fold the
     diff into the schema files FIRST (schema files must describe prod exactly), regenerate
     until `drizzle-kit generate` produces nothing. Commit any schema-file corrections
     separately with the diff listed in the PR description.
2. **Convert triggers to a tracked migration.** `drizzle-kit generate --custom --name triggers`
   → paste the content of the current `triggers.sql` (make every statement idempotent:
   `CREATE OR REPLACE FUNCTION`, `DROP TRIGGER IF EXISTS … ; CREATE TRIGGER …`). This becomes
   `0001_triggers.sql` in the journal.
3. **Write the baseline marker script** `backend/scripts/mark-baseline-applied.ts` (tsx, idempotent):
   creates `drizzle.__drizzle_migrations` if absent (schema: `id SERIAL, hash text, created_at bigint` —
   match drizzle-kit's own table exactly, including the `drizzle` schema namespace it uses),
   and inserts rows for `0000` and `0001` with the hashes/millis **read from
   `drizzle/meta/_journal.json`** (never hardcode). Skips rows that already exist.
4. **Run the marker on prod and every existing dev DB.** After it, `drizzle-kit migrate` on
   prod is a no-op. Prove it: run it; expect "no migrations to apply".
5. **Rewire scripts** in `backend/package.json`:
   - `db:generate` = `drizzle-kit generate`
   - `db:migrate` = `drizzle-kit migrate`
   - `db:push` = `tsx scripts/guard-push.ts` — refuses (exit 1, explains why) unless
     `DATABASE_URL` host is `localhost`/`127.0.0.1` AND `NODE_ENV !== "production"`; else
     execs `drizzle-kit push`. (Push stays available for local prototyping only.)
   - Delete the `db:migrate:baseline`, `db:migrate:check`, and every `tsx src/db/migrations/*`
     script entry.
6. **Archive the old machinery.** `git rm -r backend/src/db/migrations/` (the 20 scripts +
   migrate.ts + baseline-database.ts + check-migrations.ts + one-offs). They remain reachable
   via the `archive/pre-cleanup` tag created in FND-03. Keep `backend/src/db/seed/` if present
   (seeding ≠ migration).
7. **Write `docs/architecture/database-migrations.md` workflow into CLAUDE.md** (or create
   `backend/CLAUDE.md`) so agents pick it up: three-line summary + link.

## 4. API / 5. Frontend

None.

## 6. Tests to write FIRST

Scripted verification (this spec is procedural; the "tests" are executable proofs, add as
`backend/scripts/verify-migrations.ts` run in CI by FND-04):

1. Fresh empty DB → `drizzle-kit migrate` applies 0000 + 0001 cleanly; a sentinel trigger from
   0001 exists (`SELECT 1 FROM pg_trigger WHERE tgname = '<one known trigger>'`).
2. `drizzle-kit generate` immediately after → produces NO new migration (schema ↔ SQL in sync).
3. Simulated existing DB (restore dump, run marker script) → `migrate` = no-op, exit 0.
4. Marker script is idempotent (run twice → same state, exit 0).
5. `pnpm db:push` with a prod-looking `DATABASE_URL` (non-localhost host) → exit 1.
6. Add-a-column drill on a branch: edit any schema file, `db:generate` → exactly one new SQL
   file containing exactly one `ALTER TABLE` — then discard.

## 7. Acceptance criteria

- [ ] On prod: `drizzle-kit migrate` runs clean as a no-op (screenshot/log in PR).
- [ ] On a fresh DB: `migrate` builds the entire schema including triggers.
- [ ] `src/db/migrations/` no longer exists; package.json has only the three db:\* scripts + guard.
- [ ] `db:push` refuses non-localhost targets.
- [ ] `verify-migrations.ts` passes and is wired into CI (or a follow-up note in FND-04 if CI lands later).

## 8. Edge cases

- Drift found in step 1 bigger than expected (e.g. prod-only columns): each drift item is
  folded into schema files, never "fixed" by SQL on prod.
- Multiple dev DBs in unknown states: the marker script + `migrate` sequence is the universal
  repair; document it in the PR description for the colleague.
- drizzle-kit version pin: keep `drizzle-kit ^0.30.4` for this work; upgrading drizzle is
  out of scope (do not mix concerns).

## 9. Out of scope

Removing root package.json's stray drizzle deps (FND-03); CI wiring (FND-04); any schema change.

## 10. Rollout

Coordinate a 30-minute freeze on schema changes with Track B while steps 1–4 run against prod.
Revert path: the marker script only INSERTS tracking rows — deleting those rows restores the
previous (broken) state exactly.
