# FND-06: SSO Handoff + Cookie Unification (kill the double login)

> **Status:** Ready
> **Track:** A
> **Depends on:** FND-05
> **Blocks:** FND-07
> **Branch:** `feat/fnd-06-sso` (multi-PR per rollout stage §10)
> **Target state:** docs/architecture/sso-flow.md (diagnosis + design live there; this spec is the work order)

## 1. Goal

Login once at the portal, land in any app with zero re-prompt, stay logged in across apps,
log out everywhere at once. No tokens in URLs or localStorage.

## 2. Context & current state (files to change)

- `backend/src/config/constants.ts:7-12` — COOKIE_OPTIONS `sameSite:"strict"`, no domain.
- `backend/src/services/auth.service.ts` — login/refresh/session logic; `sessions` table exists.
- `backend/src/middlewares/auth.middleware.ts:74` — `authenticate` reads cookie or Bearer.
- `apps/portal/app/platform-selection/page.tsx` — redirects with `?token=<JWT>&user=<json>`
  from localStorage. `apps/portal/lib/auth-utils.ts`, `lib/api-client.ts`.
- App callbacks + clients: `apps/task/app/auth-callback/page.tsx`,
  `apps/alumni/.../auth-callback/`, `apps/internal/src/app/auth-callback/page.tsx`
  (+ their axios clients with Bearer/refresh interceptors);
  `apps/hr/src/services/http.service.ts` (localStorage Bearer + refresh),
  `apps/hr/src/app/api/set-session/route.ts` + `apps/hr/middleware.ts` (`auth_session` cookie) —
  hr wiring is replaced in FND-07, but the http.service groundwork lands here.
- CORS setup in `backend/src/app.ts` (verify current origin list).
- CSRF: `CSRF_COOKIE_NAME = "ganzafrica_csrf"` exists in constants — find current issuance/
  verification (if dormant, activate).

## 3. Schema changes

```ts
// backend/src/db/schema/auth-handoff.ts
export const auth_handoff_codes = pgTable("auth_handoff_codes", {
  id: serial("id").primaryKey(),
  code_hash: char("code_hash", { length: 64 }).notNull().unique(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  target_app: text("target_app").notNull(), // 'hr'|'alumni'|'task'|'portal'|'internal'
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  used_at: timestamp("used_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

Sessions: add `refresh_rotated_at timestamp` + `previous_refresh_hash char(64)` columns to the
existing `sessions` table (grace-window support) — inspect `schema/security.ts` first and fit
the existing shape.

## 4. Backend

### 4a. Cookies

- `COOKIE_OPTIONS`: `sameSite: "lax"`; add `domain: env.COOKIE_DOMAIN` (new env var —
  `.ganzafrica.org` prod, UNSET dev → host-only localhost). Both auth + refresh cookies.
- CORS: exact-origin allowlist from env `CORS_ORIGINS` (comma-sep; dev = the six localhost
  ports, prod = the six subdomains), `credentials: true`.
- CSRF enforcement middleware on all mutating routes (double-submit: readable
  `ganzafrica_csrf` cookie must equal `X-CSRF-Token` header). Exempt: `/auth/login`,
  `/auth/handoff/exchange`, `/payslips/view/:token`, public application POST (they're
  entry points without a prior cookie).

### 4b. Endpoints

| Endpoint                               | Auth                | Behavior                                                                                                                                                                                                                                                                     |
| -------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /auth/handoff` `{target_app}`    | authenticate        | 16 random bytes base64url; store sha256, 60s expiry; `200 {code}`                                                                                                                                                                                                            |
| `POST /auth/handoff/exchange` `{code}` | none (code IS auth) | Validate unused+unexpired (single `UPDATE ... SET used_at=now() WHERE used_at IS NULL AND expires_at>now() RETURNING` — atomic). Create session, Set-Cookie (both cookies, §4a options), `200 {user: {id,email,name,roles:[...]}}`. Invalid → `401 {"error":"invalid_code"}` |
| `GET /auth/me`                         | authenticate        | `200 {user}` (exists? verify; create/extend to include `roles` array)                                                                                                                                                                                                        |
| `POST /auth/refresh`                   | refresh cookie      | Rotation WITH grace: accept current OR previous hash if `refresh_rotated_at > now()-60s`; issue new pair, shift current→previous                                                                                                                                             |
| `POST /auth/logout`                    | authenticate        | Revoke session row; clear both cookies WITH the domain attribute                                                                                                                                                                                                             |

## 5. Frontend

### 5a. Portal

- `platform-selection/page.tsx`: card click → `POST /auth/handoff {target_app}` →
  `window.location = "<appOrigin>/auth-callback?code=" + code + "&next=" + encodeURIComponent(path)`.
  App origins from env (`NEXT_PUBLIC_APP_URL_HR` etc.). Cards filtered by `user.roles` per
  auth-and-rbac.md §5. **Transition:** during §10 stage 2 the redirect carries BOTH the new
  `code` and the legacy `token`/`user` params; legacy params removed in stage 3.
- Login page: honor `?next=` (absolute URL on an allowlisted origin only — validate!) by
  minting a handoff code post-login and forwarding.

### 5b. Every app's auth-callback (task, alumni, internal now; hr in FND-07)

Standard sequence: `GET /auth/me` (withCredentials) → 200? `router.replace(next)` :
`POST /auth/handoff/exchange {code}` → 200? store user in app state, `router.replace(next)` :
redirect to portal login with `?next=<here>`. No localStorage writes.

### 5c. API clients

All apps: axios/fetch `withCredentials: true`; DELETE Bearer interceptors and localStorage
token reads; add CSRF header injection (read cookie, set `X-CSRF-Token`) on mutations;
on 401 → single silent `POST /auth/refresh` retry → still 401 → portal login redirect.
Extract this into `packages/ui/src/lib/api-client.ts` (or a new tiny `@workspace/api-client`
package) so all apps share ONE implementation — decide by effort, prefer the new package.

## 6. Tests to write FIRST

Backend integration:

1. Handoff: mint → exchange → 200 + Set-Cookie with expected attributes (lax, httpOnly,
   domain when env set); user JSON has roles.
2. Exchange twice → second gets 401 (atomicity: fire 5 concurrent exchanges → exactly one 200).
3. Expired code (>60s) → 401.
4. Refresh grace: rotate, then refresh again with the OLD token within 60s → 200; after
   grace → 401 and session revoked (reuse = theft signal).
5. Logout revokes: subsequent `/auth/me` with old cookie → 401.
6. CSRF: mutation without header → 403; with matching header → passes; exempt routes pass without.
7. CORS: disallowed origin gets no ACAO header.

E2E (Playwright — THE acceptance test for this whole spec): 8. Login at portal → click Task card → land on task WITHOUT any login form → reload task →
still authenticated → logout from task → portal also logged out. 9. Deep link: visit task route unauthenticated → portal login → back to the exact task route.

## 7. Acceptance criteria

- [ ] E2E #8/#9 green — the double-login is dead.
- [ ] No `token=` or `user=` in any URL; grep shows zero localStorage token usage in apps/portal, task, alumni, internal.
- [ ] Single logout works across apps (manual check on prod after deploy).
- [ ] JWT_SECRET + JWT_REFRESH_SECRET rotated in the cutover deploy (secret-rotation.md item 4 checked off).
- [ ] Old flow removed (stage 3 complete) within one week of stage 2.

## 8. Edge cases

- `?next=` open-redirect: validate against the app-origin allowlist; reject others → default route.
- User with zero app-access roles logs in → platform-selection shows an "ask an admin" empty state, not zero clickable cards + confusion.
- Cookie size: keep the session cookie a compact JWT (id + session id only — roles fetched via /auth/me, NOT embedded, so role changes don't need re-login).
- Safari ITP: first-party parent-domain cookies are fine; verify on Safari once deployed.
- Dev over http: `secure:false` only when NODE_ENV!=production (already the pattern).

## 9. Out of scope

apps/hr wiring + hr_users deletion (FND-07); apps/web (public, no auth today).

## 10. Rollout (stages = PRs)

1. Backend: cookies lax+domain, /auth/me, handoff endpoints, CSRF, refresh grace. Old flow untouched — both work.
2. Portal sends code+legacy params; migrate task → alumni → internal callbacks one PR each.
3. Remove legacy params + all localStorage/Bearer code. Rotate JWT secrets in this deploy (everyone re-logs-in once, expected).
