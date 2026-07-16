# Secret Rotation Checklist

> Created by FND-03.5. Background: `.env` files with real secrets existed in plaintext on
> dev machines and the droplet. Although git history shows they were never committed (the
> `.gitignore` covered `.env`/`.env.*`), the values should still be rotated because they
> lived unencrypted in multiple locations. Execute WITH the user — these need
> DigitalOcean / Resend / Google dashboards.

## Status

- [ ] **1. DigitalOcean Spaces key pair** (`DO_SPACES_ACCESS_KEY` / `DO_SPACES_SECRET_KEY`)
      — Spaces → API keys → generate new pair, update droplet `/srv/ganzafrica/.env`, redeploy,
      then delete the old pair.
- [ ] **2. `RESEND_API_KEY`** — Resend dashboard → API Keys → roll; update droplet `.env`.
- [ ] **3. Database password** (in `DATABASE_URL`) — `ALTER ROLE ... PASSWORD`; coordinate
      ~2 min downtime; update droplet `.env` and any local dev `.env`.
- [ ] **4. `JWT_SECRET` / `JWT_REFRESH_SECRET` / `SESSION_SECRET`** — **DEFERRED to the FND-06
      SSO cutover deploy.** Rotating these invalidates every session (force-logs-out all users);
      the FND-06 cookie change does that anyway, so bundle them to spend the disruption once.
- [ ] **5. Google Calendar OAuth** (`GOOGLE_CALENDAR_CLIENT_SECRET`) — Google Cloud Console
      → Credentials → reset secret; update droplet `.env`; re-test task-app calendar link.
- [ ] **6. Inventory sweep** — grep every on-disk `.env` (backend + apps/{alumni,internal,
      portal,web}) for any additional key (GenAI keys in portal, Microsoft Graph in task) and
      rotate each provider found.

## Rule going forward

Secrets live ONLY in the droplet `/srv/ganzafrica/.env` (chmod 600) and each dev's local
`.env`. `.env.example` files (values blanked) are the only env files in the repo. CI/CD
never carries runtime secrets in GitHub — only the deploy SSH key (see deployment.md).
