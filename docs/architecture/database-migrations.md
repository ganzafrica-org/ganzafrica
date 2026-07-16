# Database Migrations — Workflow & Rules

> Source of truth after FND-02 lands. The old way (db:push + ad-hoc tsx scripts) is dead.

## 1. The only workflow

```bash
# 1. Edit schema files under backend/src/db/schema/**
# 2. Generate a migration:
pnpm --filter ganzafrica-backend db:generate     # drizzle-kit generate
# 3. Review the generated SQL in backend/drizzle/NNNN_*.sql — you MUST read it
# 4. Apply locally:
pnpm --filter ganzafrica-backend db:migrate      # drizzle-kit migrate
# 5. Commit schema change + generated SQL + meta/ together, same PR
```

Production migrations run ONLY as the deploy step (`docker compose run --rm migrate`,
see deployment.md) — never by hand, never from a laptop.

## 2. Forbidden

| Command / practice                                                    | Why                                                                                                                                          |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `db:push` against any shared/prod DB                                  | Bypasses the journal — this is what broke migrations originally. The script refuses when `DATABASE_URL` matches prod (guard added in FND-02) |
| Hand-written tsx migration scripts (`src/db/migrations/*.ts` pattern) | Invisible to drizzle-kit; archived under tag `archive/pre-cleanup`                                                                           |
| Editing an already-committed migration file                           | Checksums break on every environment that applied it. Write a new migration                                                                  |
| DDL in application code / triggers outside migrations                 | Use `drizzle-kit generate --custom` for raw SQL (triggers, indexes CONCURRENTLY, backfills)                                                  |
| Rolling back schema in prod                                           | Forward-only. Use expand/contract for risky changes (add-new → dual-write → migrate data → drop-old, across separate deploys)                |

## 3. Onboarding an EXISTING database — `db:reconcile`

Any database that already has schema but is NOT tracked by drizzle — production, a teammate's
older local copy, a half-migrated DB — is brought onto the rails with ONE idempotent command:

```bash
DATABASE_URL=... pnpm --filter ganzafrica-backend db:reconcile
```

It (1) applies `backend/drizzle/0000_baseline.sql`, an **idempotent squashed baseline**
(`CREATE TABLE IF NOT EXISTS`, enums/FKs wrapped in `DO … EXCEPTION WHEN duplicate_object`,
triggers via `CREATE OR REPLACE`) that creates whatever is missing and skips whatever exists —
touching no application data; (2) drops the legacy `public.__drizzle_migrations` left by the
old baseline scripts; (3) records the baseline in drizzle's own `drizzle.__drizzle_migrations`.
After it, `pnpm db:migrate` applies only migrations added AFTER the squash. Safe to run twice.

`db:reconcile` is the ONLY manual step, run ONCE per pre-existing DB. Fresh DBs skip it —
`pnpm db:migrate` builds everything from the baseline. New migrations after the baseline are
normal incremental `db:generate` files that flow to every DB via `db:migrate`.

### Background (FND-02, for the record)

The repo's schema had diverged from prod: prod ran everything EXCEPT the HR module (14 tables),
had two conflicting tracking tables (a bogus `public.__drizzle_migrations` with tag-named rows
from the old `baseline-database.ts`, plus a stray `drizzle.__drizzle_migrations` row), and
`drizzle-kit migrate` re-ran the full `0000` → "already exists". Rather than hand-patch each
DB, the three original migrations (baseline + triggers + hr_policies catch-up) were **squashed
into one idempotent `0000_baseline`**, and `db:reconcile` was written so prod, every local, and
CI all reach the identical tracked state with the same single command. Verified end-to-end
against a restore of the real prod schema.

## 4. Conventions

- Schema files: one table-group per file under `backend/src/db/schema/` (HR tables under
  `schema/hr/`), exported through `schema/index.ts`. snake_case columns, `timestampFields`
  from `schema/common.ts` on every table.
- Every FK declares `onDelete`. Every soft-enum column gets a CHECK or pg enum.
- Backfills that need app code (e.g. hr_users → employees copy) are one-off scripts in
  `backend/scripts/` run manually ONCE and documented in the spec that introduced them —
  they are not migrations and must be idempotent.
- Test DB: migrations are applied by the test harness before the suite (see testing-strategy.md).
