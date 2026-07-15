# Backend — agent notes

## Code quality

If a change needs a paragraph-long comment to justify why a workaround is necessary, the code
is wrong: fix the root cause properly, or — if a proper fix is too complex and the current
simple state is not actually a problem — leave it as-is. Never ship the justified-workaround
middle path. In particular, NEVER hand-edit drizzle-generated migration SQL
(`drizzle/NNNN_*.sql`); only hand-author `--custom` migrations.

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
- A DB that already has schema but no drizzle tracking (prod, an older local copy) is brought
  onto the rails ONCE with `pnpm db:reconcile` (`scripts/reconcile-db.ts`): it applies the
  idempotent squashed baseline (`drizzle/0000_baseline.sql`), drops the legacy
  `public.__drizzle_migrations`, and records the baseline in `drizzle.__drizzle_migrations`.
  Safe to re-run; touches no application data. Fresh DBs don't need it — `db:migrate` builds
  everything from the baseline.
- `pnpm db:verify` (`scripts/verify-migrations.ts`) proves the whole workflow on a disposable
  local DB (fresh migrate, generate no-op, reconcile, idempotency).

Full detail: `../docs/architecture/database-migrations.md`.

## Routing note

All API routes are mounted under `/api` (see `src/app.ts`), and HR routes under `/api/hr`.
Health check: `GET /api/health`.
