# SSO Flow — Target Architecture

> Source of truth for FND-06/07. Replaces the current token-in-query-param handoff.

## 1. Why the current flow is flaky (diagnosis, verified in code)

Current: `apps/portal/app/platform-selection/page.tsx` redirects to each app's
`/auth-callback?token=<JWT>&user=<JSON>`; apps store both in localStorage; API calls use
a Bearer interceptor; refresh relies on a `sameSite=strict`, host-only cookie
(`backend/src/config/constants.ts` COOKIE_OPTIONS).

Failure modes:

1. **Stale token replay** — platform-selection reuses whatever access token sits in portal
   localStorage; after 24h expiry (TOKEN_EXPIRY.ACCESS) the destination app's first call
   401s → bounce to login → "sign in twice".
2. **Refresh cookie never arrives cross-context** — `sameSite=strict` cookies are dropped on
   top-level cross-site navigations and any non-same-site XHR, so app-side refresh fails.
3. **Rotation race** — multiple apps/tabs share one refresh cookie; first refresh invalidates
   the token a second tab is about to send → random logouts.
4. **Security** — bearer token + full user JSON in URLs (history, server logs, Referer).

## 2. Target design

### Cookies (the main fix)

|                               | Dev (localhost:3000–3005 + API :PORT)                            | Production                                                                                                     |
| ----------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Session/refresh cookie domain | none (host-only `localhost` — port-agnostic, shared by all apps) | `.ganzafrica.org` (apps are `ganzafrica.org`, `portal.`, `hr.`, `alumni.`, `tasks.`, API `api.ganzafrica.org`) |
| sameSite                      | `lax`                                                            | `lax`                                                                                                          |
| secure                        | false                                                            | true                                                                                                           |
| httpOnly                      | true (both cookies)                                              | true                                                                                                           |

`sameSite=lax` (not strict) so top-level navigations (email links into apps) carry the
cookie. CSRF delta covered by enforcing the existing `ganzafrica_csrf` double-submit token
on all state-changing routes (FND-06 §6).

CORS: exact-origin allowlist (all six app origins, dev + prod) with `credentials: true`.

### One-time handoff code (replaces token-in-URL)

```
portal (logged in, cookie)                    backend                          target app
  │  POST /auth/handoff {target_app} ───────────▶ create code (16 rand bytes,
  │  ◀─────────────────────── {code} ────────────  store sha256, 60s TTL, single-use)
  │  redirect browser to
  │  https://hr.ganzafrica.org/auth-callback?code=XYZ&next=/dashboard
  │                                                                              │
  │                                    ◀── POST /auth/handoff/exchange {code} ───┤ (withCredentials)
  │                    validate: unused, unexpired; mark used;                   │
  │                    create session; Set-Cookie (domain cookies);              │
  │                    respond {user} ─────────────────────────────────────────▶ │
  │                                                       router.replace(next)   │
```

- Codes: single-use (`used_at` set transactionally), 60s expiry, sha256-only at rest.
- Replayed/expired code → app redirects to portal login with `?next=` — never an error loop.
- **Fast path:** auth-callback first calls `GET /auth/me` with credentials; if 200 (domain
  cookie already present — the common case), skip the exchange entirely. This alone kills
  the double-login for users who already have a session.

### Refresh

- Access 24h / refresh 30d, rotation on every refresh **with a 60-second grace window**:
  after rotation the previous refresh token remains exchangeable for 60s and maps to the
  same session row (kills the multi-tab race).
- Sliding: successful refresh extends the session.
- Single logout: `POST /auth/logout` revokes the session row + clears cookies on the parent
  domain → all apps logged out.

### Clients

- Delete every localStorage token read/write and every Bearer interceptor
  (apps/hr `src/services/http.service.ts`, apps/task + apps/internal + apps/alumni
  api clients, apps/portal `lib/api-client.ts`).
- All API clients: `withCredentials: true`, plus `X-CSRF-Token` header from the readable
  CSRF cookie on mutating requests.
- Backend `authenticate` middleware already prefers the cookie — unchanged entry point.

## 3. Login UX

- Any app hit unauthenticated → its middleware redirects to
  `https://portal.../login?next=<original absolute URL>` (dev: `localhost:3001`).
- Portal after login: if `next` points at an app, mint handoff code and redirect to that
  app's `/auth-callback?code=...&next=<path>`; else show platform-selection.
- Platform-selection cards filtered by the app access matrix in `auth-and-rbac.md` §5.

## 4. Rollout order (FND-06 §10)

1. Ship cookie changes (lax + domain) + `/auth/me` + handoff endpoints — old query-param
   flow still works in parallel.
2. Switch each app's auth-callback to the new flow, one app per PR (portal-side keeps
   sending BOTH old params and new code until all apps are switched).
3. Remove token/user query params + localStorage code.
4. Rotate `JWT_SECRET` (bundled here because it force-logs-out everyone anyway — see
   secret rotation checklist in FND-03).
