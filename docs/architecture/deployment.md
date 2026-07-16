# Deployment — Target Architecture & Runbook

> Source of truth for FND-08. Decision: Docker Compose + GHCR + GitHub Actions.
> Droplet upsized 2GB → 4GB (decision confirmed 2026-07). Postgres stays NATIVE on the droplet.

## 1. Topology

```
GitHub (repo) ──PR──▶ ci.yml (lint, typecheck, tests, build)
     │ merge to main
     ▼
deploy.yml ──▶ build changed images (turbo prune + Next standalone)
           ──▶ push ghcr.io/<org>/ganzafrica-<service>:<sha> and :latest
           ──▶ SSH to droplet:
                 1. write TAG=<sha> to /srv/ganzafrica/.deploy-env
                 2. docker compose pull
                 3. docker compose run --rm migrate        # drizzle-kit migrate
                 4. docker compose up -d --wait            # healthcheck-gated
                 5. echo "<date> <sha>" >> releases.log
```

Services (docker-compose.yml): `web` (3000), `portal` (3001), `task` (3003), `alumni` (3004),
`hr` (3005 — takes over internal's port slot after MOD-07), `backend` (4000), `caddy` (80/443).
`internal` exists only until MOD-07 parity, then is removed from compose.

- Postgres: native on the droplet, containers reach it via
  `extra_hosts: ["host.docker.internal:host-gateway"]` and `DATABASE_URL` pointing at
  `host.docker.internal`. `pg_hba.conf` allows the docker bridge subnet, `listen_addresses`
  includes the bridge IP. Postgres is NOT exposed publicly (firewall).
- Caddy (reverse proxy, auto-TLS): `ganzafrica.org`→web, `portal.`→portal, `hr.`→hr,
  `alumni.`→alumni, `tasks.`→task, `api.`→backend. ~20-line Caddyfile, in repo, synced on deploy.
- Runtime secrets live ONLY in `/srv/ganzafrica/.env` on the droplet (chmod 600), referenced
  by compose `env_file`. GitHub holds only `DEPLOY_SSH_HOST`, `DEPLOY_SSH_USER`,
  `DEPLOY_SSH_KEY`. GHCR auth uses the built-in `GITHUB_TOKEN` (push) and a read-only PAT
  on the droplet (pull).

## 2. Images

- Next apps: `output: "standalone"` in every next.config; multi-stage Dockerfile:
  `turbo prune <app> --docker` → install pruned deps → build → runtime stage copies
  `.next/standalone` + `.next/static` + `public` onto `node:22-alpine`. Target < 250MB/app.
- Backend: build stage runs tsup (FND-10) → runtime stage copies `dist/` + `drizzle/`
  (migrations must ship in the image for the migrate step) + `public/images` (payslip logo).
- Every service defines a `HEALTHCHECK` hitting `/api/health` (Next apps — a route each app
  gains in FND-04) or `/health` (backend, exists).

## 3. Rollback

`rollback.yml` = `workflow_dispatch` with an `sha` input → SSH → pin `TAG=<sha>` →
`docker compose up -d --wait`. Schema is forward-only: risky migrations use expand/contract
so image N−1 always runs against schema N. Never roll back the database.

## 4. Droplet runbook (one-time setup — FND-08 §5 has the command list)

1. Upsize droplet to 4GB. 2. Install docker + compose plugin. 3. Create `/srv/ganzafrica/`
   with compose file, `.env`, `releases.log`. 4. `docker login ghcr.io` with read-only PAT.
2. Configure Postgres for bridge access. 6. UFW: allow 22/80/443 only. 7. Point DNS
   (all subdomains → droplet IP); Caddy provisions certs on first boot. 8. First deploy;
   verify PM2 apps and containers serve identical responses; stop PM2; `pm2 unstartup`.

## 5. Ongoing operations

- Deploy = merge to `main`. Nothing is ever built on the droplet; the repo is not on the droplet.
- Logs: `docker compose logs -f <service>`; log rotation via docker `json-file` opts (max-size 10m, max-file 3).
- Disk: weekly `docker image prune -af --filter "until=168h"` (cron).
- DB backups: nightly `pg_dump` cron to DO Spaces (separate private bucket) — included in FND-08.
