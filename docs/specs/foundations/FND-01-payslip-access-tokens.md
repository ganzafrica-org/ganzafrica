# FND-01: Payslip Access Tokens (1-year links)

> **Status:** Ready
> **Track:** A
> **Depends on:** FND-02 (drizzle re-baseline — needed to generate the migration)
> **Blocks:** MOD-07 (payroll-in-hr reuses the token pattern), REC-05 (offer-acceptance links reuse it)
> **Branch:** `feat/fnd-01-payslip-tokens`

## 1. Goal

Payslip emails currently contain a DigitalOcean Spaces presigned URL that dies after 7 days
(S3 SigV4 hard cap — the code even asks for 30 days at `pdf.service.ts:556`, which is
silently capped). HR needs links valid ~1 year. After this spec: emails contain a stable
backend URL carrying a random token; the backend validates the token (stored hashed, 1-year
expiry, revocable, access-counted) and 302-redirects to a fresh 5-minute presigned URL.

## 2. Context & current state

- `backend/src/services/hr/pdf.service.ts`
  - `uploadPayslipToSpaces()` (line 523) uploads PDFs `ACL: "private"`, key
    `hr/{cleanName}/{MM-YY}/payslip.pdf`. **Keep private — do not touch.**
  - `generateSignedPayslipUrl(key, expiresIn = 30*24*60*60)` (line 554) — presigner.
    The 30-day default is a lie (SigV4 caps at 7 days); after this spec it is only ever
    called with ≤ 5-minute expiries.
- `backend/src/services/hr/payroll-email.service.ts`
  - `generateAndSendPayslip(payrollId)` (line 101): generates/uploads PDF if missing, then
    lines 171–174 presign with `7*24*60*60` and email it. **This is the call site to replace.**
  - `sendPayslipEmail()` (line 15): HTML email with the link at lines 43 and 55.
  - `sendPayslipsBatch()` (line 198), `sendPendingPayslips()` (line 266) — batch senders; they
    funnel through `generateAndSendPayslip`, no changes needed there.
- `backend/src/db/schema/payroll.ts`: `payrolls` table — `id serial PK`,
  `payslip_file_url` / `payslip_file_key` (lines 67–68), `email_sent`/`email_sent_at`/`email_error`.
- Trigger point: `backend/src/controllers/hr/payroll.controller.ts` `sendPayslipEmails()`
  (line 711) → `payrollEmailService.sendPayslipsBatch(payroll_ids)`.
- Routes: payroll routes are mounted at `/payroll` in `backend/src/routes/index.ts:63`
  (file `backend/src/routes/payroll.ts`).
- Env: `backend/src/config/env.ts` — has `DO_SPACES_*`; needs `API_PUBLIC_URL` (the public
  base URL of the API, e.g. `https://api.ganzafrica.org`; dev `http://localhost:<port>`).
  Add to env schema as required string, and to `.env.example`.

## 3. Schema changes

New file `backend/src/db/schema/payslip-tokens.ts`, exported from `schema/index.ts`:

```ts
import { pgTable, serial, integer, char, timestamp, index } from "drizzle-orm/pg-core";
import { payrolls } from "./payroll";

export const payslip_access_tokens = pgTable(
  "payslip_access_tokens",
  {
    id: serial("id").primaryKey(),
    payroll_id: integer("payroll_id")
      .notNull()
      .references(() => payrolls.id, { onDelete: "cascade" }),
    token_hash: char("token_hash", { length: 64 }).notNull().unique(), // sha256 hex
    expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
    revoked_at: timestamp("revoked_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    last_accessed_at: timestamp("last_accessed_at", { withTimezone: true }),
    access_count: integer("access_count").notNull().default(0),
  },
  (t) => ({ payrollIdx: index("payslip_tokens_payroll_idx").on(t.payroll_id) }),
);
```

Migration: `pnpm --filter ganzafrica-backend db:generate` → one SQL file. Review, commit.

## 4. API

New service `backend/src/services/hr/payslip-token.service.ts`:

- `mintPayslipToken(payrollId: number): Promise<string>` — `crypto.randomBytes(32).toString("base64url")`;
  store `sha256(token)` hex + `expires_at = now() + 365 days`; **revoke (set `revoked_at`) all
  previous unrevoked tokens for the same payroll_id in the same transaction** (a re-send
  invalidates old links — simplest mental model for HR); return the raw token (never stored,
  never logged).
- `redeemPayslipToken(token: string): Promise<{ payslipKey: string } | { error: "not_found" | "expired" | "revoked" }>` —
  hash, single `SELECT ... JOIN payrolls`, check `revoked_at IS NULL && expires_at > now()`;
  on success `UPDATE ... SET access_count = access_count + 1, last_accessed_at = now()`.
- `revokeTokensForPayroll(payrollId: number): Promise<number>`.
- Build the email link as `${env.API_PUBLIC_URL}/api/payslips/view/${token}`.
  (Confirm the API path prefix used by `app.ts` when mounting `routes/index.ts` — reuse
  exactly whatever prefix `/payroll` routes get; adjust the literal here accordingly.)

New routes in `backend/src/routes/payslip-view.ts`, mounted in `routes/index.ts` as
`router.use("/payslips", payslipViewRoutes)`:

| Method & path                    | Auth                                                                                                                                                                                                    | Behavior                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /payslips/view/:token`      | **none** (public, the token IS the auth) + rate limit 10/min/IP (use existing rate-limit middleware if present in `backend/src/middlewares/`; else add `express-rate-limit` scoped to this router only) | Redeem. Success → `302 Location: <5-min presigned URL from generateSignedPayslipUrl(key, 300)>`. Failure → `410 Gone` with a small self-contained HTML page (inline styles, GanzAfrica green #045F3C header like the email): "This payslip link has expired or been revoked. Contact HR at info@ganzafrica.org." Same page for not_found/expired/revoked — do not leak which. |
| `POST /payroll/:id/revoke-links` | `authenticate` + same guard as `sendPayslipEmails` (today: existing payroll controller auth; after FND-05: `requirePermission("payroll:manage")`)                                                       | Body: none. Revokes all tokens for payroll `:id`. `200 {"revoked": n}`. `404` if payroll doesn't exist.                                                                                                                                                                                                                                                                       |

Changes to existing code:

- `payroll-email.service.ts` lines 171–174: replace the presign call with
  `const link = await payslipTokenService.mintAndBuildLink(payrollId)` (helper combining mint +
  URL build). Email HTML unchanged apart from the URL; update the sentence "You can view and
  download your payslip" to add "This link is valid for one year."
- `pdf.service.ts:556`: change the default `expiresIn` to `300` and add a guard
  `if (expiresIn > 7*24*60*60) throw new Error("presigned URLs cannot exceed 7 days")` so the
  original bug can never return.

## 5. Frontend

`apps/internal/src/app/payroll/payslips/page.tsx` (the live payroll table): the existing
"resend" action already goes through the backend send path → automatically mints fresh
tokens; no change required. Add a "Revoke links" action per row calling
`POST /payroll/:id/revoke-links` with a confirm dialog ("Old emailed links will stop
working."). Show `access_count`/`last_accessed_at` in the row expansion if trivially
available from the existing payroll GET (optional — do not build a new endpoint for it).

## 6. Tests to write FIRST (TDD)

Backend integration (`backend/tests/integration/payslip-tokens.test.ts`):

1. minting stores only a 64-char hash, never the raw token.
2. `GET /payslips/view/:token` with a valid token → 302 whose Location contains the Spaces
   host + `X-Amz-Expires=300`.
3. Redeeming bumps `access_count` and sets `last_accessed_at`.
4. Expired token (insert with past `expires_at`) → 410, HTML body, no Location header.
5. Revoked token → 410. Unknown token → 410 (identical body — no oracle).
6. Re-sending a payslip revokes prior tokens (old link → 410, new link → 302).
7. `POST /payroll/:id/revoke-links` requires auth (401 anonymous) and revokes (subsequent
   view → 410).
8. Rate limit: 11th request in a minute from one IP → 429.
9. `generateSignedPayslipUrl` throws for `expiresIn > 604800`.

E2E (Playwright, extends the payslip suite): send payslip to a seeded payroll → capture the
link from the mocked email payload → visit it → assert redirect towards Spaces URL shape;
revoke → visit again → 410 page shows the HR contact email.

## 7. Acceptance criteria

- [ ] Payslip emails contain `API_PUBLIC_URL/…/payslips/view/<token>` — no `X-Amz-*` params anywhere in the email.
- [ ] A sent link works on day 1 and (simulated clock) day 364; fails with the branded 410 page on day 366.
- [ ] Revoke action kills all previously emailed links for that payroll immediately.
- [ ] Raw tokens appear nowhere in DB, logs, or error messages.
- [ ] Payslip objects remain `ACL: private` in Spaces (verify uploadPayslipToSpaces untouched).
- [ ] All §6 tests green; existing payroll tests still green.

## 8. Edge cases

- Payroll deleted → tokens cascade-delete; already-emailed links → 410.
- `payslip_file_key` missing on redeem (file deleted from Spaces separately): presign will
  still 302; the Spaces 404 is acceptable — do not pre-check object existence (cost).
- Concurrent redeems: `access_count` update must be a single SQL increment, not read-modify-write.
- Token in URL gets copied into other mailboxes — accepted risk (same as any emailed link);
  mitigations are the 1-year cap + revocation + private ACL.
- Clock: all comparisons in SQL (`now()`), not JS Date math.

## 9. Out of scope

- In-app payslip listing for employees (MOD-03 / MOD-07).
- Offer-letter links (REC-05 reuses `mintPayslipToken`'s pattern via a generalized helper —
  refactor then, not now).

## 10. Rollout

Deploy backend first; emails sent after deploy carry new links. Old presigned links in old
emails keep dying at 7 days — HR should re-send any payslip that needs a fresh link (existing
resend button). No data backfill. Revert = restore the old call site (tokens table is inert).
