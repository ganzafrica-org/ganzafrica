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

| Command / practice | Why |
|---|---|
| `db:push` against any shared/prod DB | Bypasses the journal — this is what broke migrations originally. The script refuses when `DATABASE_URL` matches prod (guard added in FND-02) |
| Hand-written tsx migration scripts (`src/db/migrations/*.ts` pattern) | Invisible to drizzle-kit; archived under tag `archive/pre-cleanup` |
| Editing an already-committed migration file | Checksums break on every environment that applied it. Write a new migration |
| DDL in application code / triggers outside migrations | Use `drizzle-kit generate --custom` for raw SQL (triggers, indexes CONCURRENTLY, backfills) |
| Rolling back schema in prod | Forward-only. Use expand/contract for risky changes (add-new → dual-write → migrate data → drop-old, across separate deploys) |

## 3. How prod was re-baselined (FND-02, for the record)

Prod had the full 73-table schema but an untracked journal, so `0000_amused_victor_mancha.sql`
failed with "already exists". Fix: verified the baseline matches prod (generate against a
prod-dump scratch DB, diff), inserted the 0000 hash/timestamp into `__drizzle_migrations`
in journal-aware format, converted `triggers.sql` into `0001` via `generate --custom` and
marked it applied. From then on, plain `drizzle-kit migrate` works everywhere.

## 4. Conventions

- Schema files: one table-group per file under `backend/src/db/schema/` (HR tables under
  `schema/hr/`), exported through `schema/index.ts`. snake_case columns, `timestampFields`
  from `schema/common.ts` on every table.
- Every FK declares `onDelete`. Every soft-enum column gets a CHECK or pg enum.
- Backfills that need app code (e.g. hr_users → employees copy) are one-off scripts in
  `backend/scripts/` run manually ONCE and documented in the spec that introduced them —
  they are not migrations and must be idempotent.
- Test DB: migrations are applied by the test harness before the suite (see testing-strategy.md).
