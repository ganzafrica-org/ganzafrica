# FND-03: Monorepo Phase-0 Foundations (workspace, hooks, formatting, cruft & secrets)

> **Status:** Ready
> **Track:** A
> **Depends on:** —
> **Blocks:** FND-04, FND-10
> **Branch:** one PR per numbered step below (`chore/fnd-03-<n>-<slug>`), CI-green (once FND-04 lands, retroactively) before the next

## 1. Goal

One coherent pnpm workspace with a single lockfile, root hygiene, prettier + husky +
lint-staged pre-commit/pre-push gates, and the repo swept of cruft and burned secrets.

## 2. Context & current state

- Root `D:\ganzafrica\package.json`: pnpm@10.4.1; has a WRONG npm-style `"workspaces"` array
  (pnpm ignores it; `pnpm-workspace.yaml` governs and lists `apps/*`, `packages/*`, `backend`);
  root carries runtime deps it must not have (`next`, `react`, `drizzle-orm`, `drizzle-kit`,
  `@radix-ui/react-checkbox`, `react-server-dom-webpack@19.1.1`, …).
- `backend/` has its OWN `pnpm-lock.yaml` and `pnpm-workspace.yaml` → nested, broken workspace.
- No `.prettierrc`, no husky, no lint-staged. ESLint: shared flat config package
  `@workspace/eslint-config` used only by root/web/portal; hr/internal/alumni/task use local
  configs; backend on ESLint 8.56.
- Cruft: `backend/git_history.txt` + `git_history_all.txt`; empty `backend/prisma/`;
  stray root `components/ContactUsContent.tsx` (check imports first — see §3.6); 8 payroll
  CSVs in `apps/internal/` (untracked, real salary data); committed `.env` files
  (`backend/.env`, `apps/{alumni,internal,portal,web}/.env`); `apps/internal/tsconfig.tsbuildinfo`.
- `.npmrc` empty.

## 3. Steps (each = one PR)

### 3.1 Root package.json + workspace merge

- Remove `"workspaces"` field and ALL runtime deps from root. Keep devDeps only:
  `turbo`, `prettier`, `husky`, `lint-staged`, `typescript`.
- Delete `backend/pnpm-lock.yaml` and `backend/pnpm-workspace.yaml`.
- `pnpm install` at root → one lockfile. Fix hoisting fallout: any package that only resolved
  via the root's stray deps must declare its own dependency (expected offenders: whatever
  imported react-server-dom-webpack, root-level scripts using drizzle).
- Add backend to `turbo.json` pipelines: `build`, `lint`, `check-types` (backend script name
  may differ — align script names across ALL packages: `build`, `lint`, `typecheck`, `test`).
- Verify: `pnpm turbo build` succeeds for all 7 packages (web build may need its existing
  type-check-disabling env kept for now — do NOT fix web types here, that's FND-09).

### 3.2 Prettier

- Root `.prettierrc.json`: `{ "semi": true, "singleQuote": false, "trailingComma": "all", "printWidth": 100 }`
  - `.prettierignore` (`dist`, `.next`, `drizzle/*.sql`, `pnpm-lock.yaml`, `apps/_archived`).
- One whole-repo `prettier --write .` commit; add its hash to `.git-blame-ignore-revs`.

### 3.3 husky + lint-staged

- `pre-commit`: lint-staged → `prettier --write` on staged files, `eslint --fix` on staged
  `*.{ts,tsx}` (per-package config resolution).
- `pre-push`: `pnpm turbo typecheck --filter=...[origin/dev]` (affected only, cached — fast).
- `prepare` script at root: `husky`.

### 3.4 ESLint alignment (config only, not fixing the world)

- Point hr/internal/alumni/task/backend at `@workspace/eslint-config` (next-js preset for the
  apps, base for backend); backend moves ESLint 8 → 9 flat.
- Where a package has a wall of existing violations: silence those specific rules per-package
  with a `/* ratchet */` comment in the config listing them — the goal is a GREEN baseline,
  tightened later. No mass auto-fix commits mixed with config changes.

### 3.5 Secrets sweep (treat everything committed as burned)

- Add `.env`, `.env.*`, `*.tsbuildinfo`, `*.csv` (scoped: `apps/internal/*.csv`) to root
  `.gitignore`; `git rm --cached` every tracked `.env`.
- Create `.env.example` for backend and each app (every key from `backend/src/config/env.ts`
  and each app's env usage, values blanked, comments explaining each).
- **Rotation checklist** (add as `docs/architecture/secret-rotation.md`, execute with the user —
  these require DO/Resend dashboards):
  1. DO Spaces access key pair — rotate, update droplet `.env`.
  2. `RESEND_API_KEY` — rotate.
  3. Database password — rotate (coordinate ~2 min downtime), update droplet.
  4. `JWT_SECRET` / `JWT_REFRESH_SECRET` — **defer to the FND-06 cutover deploy** (rotation
     force-logs-out everyone; bundle with the cookie change which does anyway).
  5. Anything else found in the committed .env files (Google/Microsoft OAuth secrets in task
     app, GenAI keys in portal) — inventory while sweeping, rotate each.
- Move the 8 payroll CSVs out of the repo tree to the user's local storage (they are inputs,
  not source); note in `apps/internal/README.md` where sample CSV fixtures for tests live
  (`backend/tests/fixtures/payroll/` — anonymized copies with fake names/amounts).

### 3.6 Cruft

- Tag first: `git tag archive/pre-cleanup && git push origin archive/pre-cleanup`.
- Delete: `backend/git_history*.txt`, `backend/prisma/`, `apps/internal/tsconfig.tsbuildinfo`
  (+ gitignore), root `public/` and `components/ContactUsContent.tsx` **after** `grep -r` shows
  no imports (if imported by web, move the file into apps/web instead).
- `apps/_archived` stays for now (REC-03 / LCM-01/02 / MOD-09/10 harvest it) — deleted in wave 6.

## 4. API / 5. Frontend

None.

## 6. Tests to write FIRST

Procedural spec — proofs instead:

1. `pnpm install --frozen-lockfile` clean at root; exactly one `pnpm-lock.yaml` in the repo.
2. `pnpm turbo build` — all 7 packages build.
3. `git ls-files | grep -E "\.env$|tsbuildinfo|git_history"` → empty.
4. Commit with a formatting violation → pre-commit fixes it; push with a type error in a
   touched package → pre-push blocks.
5. Every key in `backend/src/config/env.ts` appears in `backend/.env.example`.

## 7. Acceptance criteria

- [ ] One lockfile; root package.json has zero runtime deps; backend fully in the workspace.
- [ ] Hooks work on a fresh clone after `pnpm install` (husky auto-installs via prepare).
- [ ] `pnpm turbo lint typecheck` green repo-wide (via ratchet baselines where needed).
- [ ] No `.env`, CSVs (real data), or build artifacts tracked; `.env.example`s complete.
- [ ] `secret-rotation.md` exists with checkboxes; items 1–3 & 5 executed, item 4 deferred-and-linked to FND-06.
- [ ] `archive/pre-cleanup` tag pushed.

## 8. Edge cases

- pnpm hoisting differences after removing root deps can break `next dev` in apps that
  accidentally relied on root-hoisted packages — run each app's dev server once as a smoke check.
- Windows: husky hooks must be sh-compatible (no PowerShell-isms); test on the user's machine.
- The colleague has in-flight work — merge 3.1 (workspace) at a coordinated moment; he must
  `pnpm install` after pulling and delete `backend/node_modules` once.

## 9. Out of scope

Version bumps (FND-09), CI (FND-04), backend build (FND-10), fixing web's disabled type checking (FND-09).

## 10. Rollout

Steps land as 6 small PRs in order. 3.1 is the only disruptive one — coordinate with Track B.
