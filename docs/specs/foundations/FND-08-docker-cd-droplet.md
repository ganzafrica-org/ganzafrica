# FND-08: Docker CD + Droplet Migration

> **Status:** Ready
> **Track:** A
> **Depends on:** FND-04 (CI), FND-10 (backend bundling), FND-09 partially (each app needs `output:"standalone"` — those land per-app in FND-09; deploy each app only once its standalone build exists)
> **Blocks:** —
> **Branch:** `feat/fnd-08-docker-cd`
> **Target state:** docs/architecture/deployment.md (topology + runbook live there)

## 1. Goal

Merge to `main` = automatic deploy: CI builds per-service Docker images (only changed ones),
pushes to GHCR, SSHes to the droplet, runs migrations, and swaps containers with health-gated
compose. Manual SSH deploys end. The repo never lands on the droplet.

## 2. Context & current state

- Nothing exists: no .github/workflows/deploy, no Dockerfiles, no compose, no PM2 file in repo.
- Droplet: DO, being upsized 2GB→4GB (prerequisite — verify `free -h` before first deploy);
  native Postgres; PM2 processes managed by hand; DO Spaces for objects.
- Ports/services and Caddy vhosts: deployment.md §1.

## 3. Deliverables (files in repo)

1. `apps/<app>/Dockerfile` × 6 + `backend/Dockerfile` — multi-stage per deployment.md §2
   (`turbo prune <pkg> --docker` pattern; runtime `node:22-alpine`, non-root `USER node`,
   `ENV NODE_ENV=production`). Backend image includes `dist/`, `drizzle/`, `public/images/`.
2. `docker-compose.yml` (repo root): 7 services + caddy; each app
   `image: ghcr.io/<org>/ganzafrica-<name>:${TAG}`, `env_file: .env`, `restart:
   unless-stopped`, healthcheck (`wget -qO- localhost:PORT/api/health || exit 1`), memory
   limits (apps 256m, backend 512m); `extra_hosts: ["host.docker.internal:host-gateway"]`;
   plus a profile-`ops` one-shot `migrate` service (backend image,
   `command: npx drizzle-kit migrate`).
3. `Caddyfile` (repo root) — vhosts per deployment.md §1.
4. `.github/workflows/deploy.yml`:
   - trigger `push: branches [main]`;
   - job 1 `changes`: dorny/paths-filter → per-service booleans (an app rebuilds when the
     app, packages/**, or the lockfile changed; backend likewise);
   - job 2 `build`: matrix over changed services; docker/build-push-action with GHA cache
     (`cache-from/to: type=gha`), tags `:sha` + `:latest`, login via `GITHUB_TOKEN`;
   - job 3 `e2e-gate`: the FND-04 Playwright suite;
   - job 4 `deploy`: appleboy/ssh-action → `cd /srv/ganzafrica && sed -i "s/^TAG=.*/TAG=${SHA}/" .env
     && docker compose pull && docker compose --profile ops run --rm migrate &&
     docker compose up -d --wait && echo "$(date -Is) ${SHA}" >> releases.log`;
     also scp-sync `docker-compose.yml` + `Caddyfile` before pulling.
5. `.github/workflows/rollback.yml` — workflow_dispatch(sha) → same SSH pinning TAG, no migrate step.
6. `docs/architecture/deployment.md` §4 runbook executed and updated with real values
   (redact host). DB backup cron (nightly pg_dump → private Spaces bucket, 14-day retention).

Secrets to create in GitHub: `DEPLOY_SSH_HOST`, `DEPLOY_SSH_USER`, `DEPLOY_SSH_KEY` (new
deploy-only keypair, not the user's personal key). Droplet `.env`: all runtime secrets
(post-rotation values from FND-03).

## 4/5. API & Frontend

`/api/health` route in each Next app (if FND-04 didn't add them): static
`Response.json({status:"ok"})` — no DB call.

## 6. Tests to write FIRST

1. Local proof: `docker compose up` on the dev machine (with a local `.env` + local Postgres)
   serves all apps; healthchecks go healthy.
2. Image size assertions in the build job: fail if an app image > 350MB (regression guard).
3. deploy.yml dry-run on a throwaway branch with `workflow_dispatch` against the droplet
   BEFORE flipping main (parallel-run stage, §10).
4. Rollback drill: deploy sha N, rollback to N−1, verify `releases.log` + serving version
   (add a `/api/health` field `sha: process.env.GIT_SHA` baked at build time — makes this
   verifiable).
5. Migration failure drill: a deliberately failing migration on staging branch → deploy stops
   BEFORE `up -d` (old containers keep serving).

## 7. Acceptance criteria

- [ ] Merge to main deploys only changed services end-to-end without human action.
- [ ] Health-gated: a service failing its healthcheck aborts the swap (`--wait` behavior verified).
- [ ] Rollback via Actions UI in under 3 minutes, verified by /api/health sha.
- [ ] PM2 fully off (`pm2 list` empty, unstartup run); serving parity checked page-by-page first.
- [ ] Nightly DB backup lands in Spaces; a restore drill was performed once.
- [ ] The droplet has no repo checkout; deploy user has no more privileges than docker + /srv/ganzafrica.

## 8. Edge cases

- Disk pressure from images: weekly prune cron (deployment.md §5) + 4GB droplet has 80GB disk — monitor.
- Concurrent merges to main: `concurrency: {group: deploy, cancel-in-progress: false}` — deploys queue.
- Spaces/GHCR outage mid-deploy: pull fails → old containers untouched (pull-then-up ordering).
- Postgres bridge access: bind + pg_hba scoped to the docker subnet only; UFW keeps 5432 unreachable externally.
- Next standalone + monorepo: `output: "standalone"` needs `outputFileTracingRoot` set to repo root in each next.config — include in the per-app Dockerfile PRs.

## 9. Out of scope

Staging environment (future — the compose file is parameterized enough); zero-downtime
blue/green (compose `--wait` restart gap of seconds is accepted); moving Postgres into Docker.

## 10. Rollout

Parallel-run: deploy containers on alternate ports first, compare against PM2 apps, flip
Caddy vhosts service-by-service (backend last), watch a day, then decommission PM2.
