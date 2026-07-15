# MOD-07: Payroll in the HR App (absorb apps/internal, retire it)

> **Status:** Ready
> **Track:** B default (coordination with A on retirement step)
> **Depends on:** FND-07 (HR on SSO — payroll pages need RBAC), FND-01 (token links live)
> **Blocks:** apps/internal retirement, MOD-03 payslips card, MOD-11
> **Branch:** `feat/mod-07-payroll-hr`

## 1. Goal

The payroll workflow (CSV import in 4 formats → review → generate payslips → email with
1-year links → track/resend/revoke) moves into apps/hr under `finance`/`hr` roles, plus an
employee self-service "my payslips" view. apps/internal then retires (portal card removed,
compose service removed).

## 2. Context & current state

- Live app: `apps/internal/src/app/payroll/payslips/page.tsx` — table by month-year, upload
  CSV, send/resend emails, delete rows; auth via SSO callback + email allowlist. This is
  production — parity before retirement.
- Backend COMPLETE and staying: `payrolls` schema (multi-format columns, payroll_type
  rwf|rwf_usd|wop_usd|xof|rwf_wop, payslip file fields, email tracking, uploaded_by) —
  `backend/src/db/schema/payroll.ts`; routes `/payroll` (`routes/payroll.ts`, mounted
  index.ts:63); controller `controllers/hr/payroll.controller.ts` (sendPayslipEmails:711);
  services payroll/payroll-email/pdf + FND-01 token service. CSV import logic previously in
  `src/db/migrations/migrate-payroll*.ts` (archived by FND-02) — the upload endpoint's parser
  is the live path (verify controller handles all 4 formats; the CSVs' shapes are mirrored in
  the schema comments).
- `payrolls.user_id` stays (README guardrail). Self-service join: users→employees.

## 3. Schema changes

None. (Service-layer rule from the guardrail: on new payroll row creation, warn-log when no
matching employees row exists for the email/user.)

## 4. API

Mostly exists — changes:
| Change | Detail |
|---|---|
| Permissions | All `/payroll/*` admin endpoints → `requirePermission("payroll:manage")` (finance, hr, admin) — replaces any allowlist logic (FND-05 §4d already mapped; verify done) |
| `GET /hr/me/payslips` | NEW (authenticate): payroll rows for my user_id (join via employees.user_id), fields: period, date_of_payment, net summary, `view_url` = freshly minted FND-01 token link **per request? NO** — mint on demand via `POST /hr/me/payslips/:id/link` → `{url}` (5-min presign directly is fine here since the user is authenticated in-app; reuse `generateSignedPayslipUrl(key, 300)` — no token row needed for in-app viewing) |
| Audit | `GET /payroll?period=` response must include email_sent, email_sent_at, email_error, token stats (access_count/last_accessed_at via FND-01 table join) for the tracking table |

## 5. Frontend (apps/hr)

- `app/payroll/page.tsx` (replace the mock): period picker, import flow (CSV upload +
  format select (4 formats) + dry-run preview table with per-row validation errors before
  commit — if the current backend imports directly, add `?dry_run=true` support to the
  upload endpoint), payroll table (name, program, net, email status chips, payslip actions:
  preview PDF, send, resend, revoke links (FND-01), delete row), batch actions (send all
  unsent for the period), progress/result toast from the existing batch response shape.
- `app/finance/page.tsx` mock: fold into payroll or leave for MOD-11 — decide: payroll page
  covers it; delete the mock.
- Employee `app/me/payslips` (MOD-03 slot): period list + "View" (in-app presign fetch, open
  in new tab). Show nothing but their own — server enforces by session join.
- Nav: Payroll visible to payroll:manage only; My payslips to everyone (MOD-03 nav config).
- **Parity checklist vs apps/internal** (in PR): month-year filter, upload w/ all formats,
  send/resend, delete, per-row PDF — each demonstrated.

## 6. Tests to write FIRST

Backend:
1. `/hr/me/payslips` returns only own rows (two-employee fixture); employee without payroll
   rows → empty 200; user without employees row → empty 200 (not 500).
2. In-app link endpoint: own payslip → presigned 200; someone else's id → 404.
3. Permission sweep: staff on /payroll admin → 403; finance → 200.
4. Dry-run import: malformed rows reported, nothing inserted; commit inserts (per format
   fixture — 4 small CSV fixtures, anonymized, in backend/tests/fixtures/payroll/).
5. Token stats join present in admin list response.
Frontend:
6. Import flow: dry-run errors render per-row; commit disabled until clean or override.
7. Table chips reflect email_error; revoke action confirm.
8. me/payslips renders periods; view opens URL from mutation.
E2E: finance imports fixture CSV → sends batch → (FND-01 e2e link check) → employee logs in →
sees payslip under /me → opens it.

## 7. Acceptance criteria

- [ ] Full payroll cycle runs in apps/hr on staging: import → review → send → track → revoke.
- [ ] Parity checklist vs apps/internal signed off by the user (who runs payroll).
- [ ] Employee self-service payslips live, strictly own-rows.
- [ ] Retirement executed: portal "HR & Finance" card removed/repointed to hr app payroll, internal removed from compose + FND-09 exemption noted, `apps/internal` deleted from the repo (after 2 clean cycles — see §10).
- [ ] Email allowlist (`NEXT_PUBLIC_INTERNAL_AUTHORIZED_EMAILS`) gone everywhere.

## 8. Edge cases

- Payroll rows for people not in employees (past staff, Burkina team without accounts):
  admin flow unaffected (payrolls stands alone); self-service simply won't show them.
- Duplicate import same period: existing behavior? verify — target: dry-run flags duplicates
  (same email+period), commit skips or replaces per an explicit toggle.
- Deleting a payroll row with sent emails: confirm dialog warns links die (cascade kills tokens).
- Currency rendering: use payroll_type/currency fields — no assumptions (XOF/WOP formats in fixtures).

## 9. Out of scope

Payroll computation/tax engines (import-based flow stays), approvals on payroll, severance.

## 10. Rollout

Run apps/hr payroll and apps/internal in PARALLEL for two monthly cycles (both hit the same
backend — safe). User runs the real cycle in hr app with internal as fallback. Then retire.
