# Backend — agent notes

## Database migrations (read before ANY schema change)

The ONLY migration workflow:

```bash
# 1. edit schema under src/db/schema/**
pnpm db:generate          # drizzle-kit generate — review the new drizzle/NNNN_*.sql
pnpm db:migrate           # drizzle-kit migrate — applies pending migrations
# 3. commit schema + generated SQL + drizzle/meta together, same PR
```

- **Never** `db:push` against a shared/prod DB — it is guarded (`scripts/guard-push.ts`)
  and refuses non-localhost / NODE_ENV=production. Push bypasses the journal; that is what
  broke migrations before.
- **Never** hand-write tsx migration scripts. Raw SQL (triggers, backfills) → `drizzle-kit generate --custom`.
- A DB that already has the schema but no drizzle tracking (e.g. prod pre-baseline) is
  reconciled with `pnpm db:migrate:mark-baseline` (`scripts/mark-baseline-applied.ts`),
  which writes drizzle's own `drizzle.__drizzle_migrations` rows so `migrate` becomes a no-op.
- `pnpm db:verify` (`scripts/verify-migrations.ts`) proves the workflow on a disposable local DB.

Full detail: `../docs/architecture/database-migrations.md`.

## Routing note

All API routes are mounted under `/api` (see `src/app.ts`), and HR routes under `/api/hr`.
Health check: `GET /api/health`.
