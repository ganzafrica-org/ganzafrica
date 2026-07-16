# REC-05: Offers + Hire Conversion (offer → accept → user + employee + onboarding)

> **Status:** Ready
> **Track:** A
> **Depends on:** REC-02 (pipeline), FND-05 (users/employees/RBAC), FND-01 (token-link pattern)
> **Blocks:** LCM-01 (onboarding instances are created here)
> **Branch:** `feat/rec-05-offers`

## 1. Goal

HR creates an offer on an application in the `offer` stage, sends it with a secure
acceptance link; the candidate views the offer letter and accepts/declines in the browser;
acceptance transactionally: marks the application `hired`, creates the `users` account
(invite flow), creates the `employees` row (`status='onboarding'`), and instantiates the
onboarding process — the exact "automatic transfer to onboarding" the user described.

## 2. Context & current state

- Pipeline + transition matrix: REC-02 (`offer→hired|rejected|withdrawn` validated there).
- `employees` table + roles: FND-05. Onboarding `process_*` tables + `instantiateProcess()`:
  LCM-01 — **build order note:** REC-05 calls `instantiateProcess` if LCM-01 is merged,
  else records `onboarding_pending=true` for LCM-01 to backfill; implement the call behind a
  small seam (`onboarding.hooks.ts` with a no-op default) so either merge order works.
- Token pattern: FND-01's mint/redeem (sha256 at rest, expiry, single service). **Refactor
  step included here:** generalize into `backend/src/services/secure-links.service.ts`
  (`mintLink(kind, subjectId, ttl)` / `redeemLink(kind, token)`) with kinds
  `payslip` (migrating FND-01's table? NO — keep payslip table as-is; the generalized service
  gets its own `secure_link_tokens` table and payslips migrate opportunistically later — note
  in code).
- Offer letter files: DO Spaces private upload (reuse `middlewares/upload.ts` S3 client with
  `ACL: "private"` — a private variant helper may need extracting since the middleware
  defaults to public-read).
- `hr_contracts` exists for post-hire contract details; the offer's accepted terms prefill a
  draft contract (LCM-01's contract-signing step finalizes).

## 3. Schema changes

```ts
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  application_id: integer("application_id").notNull().unique()
    .references(() => applications.id, { onDelete: "cascade" }),
  position_title: text("position_title").notNull(),
  employment_type: text("employment_type").notNull(),   // fellow|analyst|staff|contractor|intern
  department: text("department"),
  start_date: date("start_date"),
  gross_salary: numeric("gross_salary", { precision: 15, scale: 2 }),
  currency: text("currency").notNull().default("RWF"),
  additional_terms: text("additional_terms"),
  letter_file_key: text("letter_file_key"),              // uploaded PDF, private
  status: text("status").notNull().default("draft"),     // draft|sent|accepted|declined|expired|withdrawn
  expires_at: timestamp("expires_at", { withTimezone: true }), // acceptance deadline
  sent_at: timestamp("sent_at", { withTimezone: true }),
  responded_at: timestamp("responded_at", { withTimezone: true }),
  decline_reason: text("decline_reason"),
  created_by: integer("created_by").notNull().references(() => users.id),
  ...timestampFields,
});

export const secure_link_tokens = pgTable("secure_link_tokens", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(),                 // 'offer' | (future: 'invite', ...)
  subject_id: integer("subject_id").notNull(),  // offer.id for kind=offer
  token_hash: char("token_hash", { length: 64 }).notNull().unique(),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  revoked_at: timestamp("revoked_at", { withTimezone: true }),
  used_at: timestamp("used_at", { withTimezone: true }), // set on accept/decline (single decision)
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

## 4. API

HR side (`requirePermission("recruitment:manage")`):
| Endpoint | Behavior |
|---|---|
| `POST /hr/recruitment/applications/:id/offer` | Create draft (409 if application not in `evaluation`/`offer` stage or offer exists); moves stage → `offer` if coming from evaluation |
| `PATCH /hr/offers/:id` | Edit draft only (409 otherwise) |
| `POST /hr/offers/:id/letter` | Upload letter PDF (private) |
| `POST /hr/offers/:id/send` | Requires letter + start_date; status→sent, mint offer token (TTL = expires_at or 14d default), email candidate (offer template, link `${WEB_PUBLIC_URL}/offer/<token>`), record `recruitment_emails` type `offer` |
| `POST /hr/offers/:id/withdraw` | sent→withdrawn, revoke tokens, optional email |

Candidate side (public, token-auth, rate-limited):
| Endpoint | Behavior |
|---|---|
| `GET /offers/view/:token` | Redeem-read (not consumed): offer summary JSON + 5-min presigned letter URL. Expired/revoked/used → 410 with state (`decided`, `expired`) so the page can render the right message |
| `POST /offers/respond/:token` `{decision: "accept"|"decline", decline_reason?}` | Atomic consume (`used_at` guard like FND-06 exchange). **Accept transaction:** offer→accepted; `transition(application, "hired", null)`; find-or-create `users` by application email (create: random placeholder hash, `email_verified=false` → send set-password invite via existing password-reset machinery); grant roles `employee` + employment-type role (fellow/analyst) per auth-and-rbac.md; create `employees` (names/emails from application, employment_type, status `onboarding`, hired_at=start_date); draft `hr_contracts` row from offer terms; call `onboarding.hooks.onHired(employeeId, offer)`; email "welcome / next steps". **Decline:** offer→declined + reason; application → rejected? NO — stays `offer` stage with a stage-event note "offer declined" so HR decides the next move manually |

## 5. Frontend

**Public offer page** `apps/web/app/offer/[token]/page.tsx`: branded page — position,
start date, terms summary, "View offer letter" (opens presigned PDF), Accept / Decline
buttons (decline asks optional reason; both confirm). Decided/expired states per §4.
Accepted → "Welcome! Check your email to set up your account."

**apps/hr**: Offer tab in the REC-03 detail panel — create/edit form, letter upload,
send (confirm dialog shows recipient + expiry), status timeline (sent/viewed?—no view
tracking, keep it honest: sent/responded), withdraw. Pipeline board card badge for offer
status.

## 6. Tests to write FIRST

1. Offer CRUD guards: wrong stage 409; edit after send 409; send without letter 422.
2. Token flow: view (not consumed, presigned letter URL), respond accept (consumed),
   second respond → 410 `decided`; concurrent double-accept → exactly one success.
3. **Accept transaction** (the big one): all-or-nothing — inject a failure at each step
   (user create, employee create, contract draft) → NOTHING persisted (transaction covers
   all inserts; emails fire post-commit only). Assert final state: application hired,
   user exists w/ employee+fellow roles, employees row onboarding, draft contract, hook called.
4. Accept when a `users` row with that email ALREADY exists (former applicant account):
   reuses it, grants roles, does NOT touch password, invite email replaced by "you've been
   hired" variant.
5. Decline: reason stored, application stage unchanged + event noted, no user/employee created.
6. Expiry: respond after expires_at → 410 `expired`; HR resend mints a fresh token (revokes old).
7. E2E: HR sends offer on the seeded pipeline → open emailed link (mock capture) → accept →
   employee appears in HR employees list with "onboarding" badge.

## 7. Acceptance criteria

- [ ] Full happy path e2e green: evaluation → offer → send → accept → hired + user invite + employees(onboarding) + draft contract (+ onboarding instance when LCM-01 merged).
- [ ] Acceptance link single-decision, expiring, revocable; raw tokens never stored/logged.
- [ ] Accept is atomic (fault-injection tests green).
- [ ] Existing-email hires don't clobber accounts.
- [ ] Decline leaves HR in control (no auto-reject).

## 8. Edge cases

- Application email typo'd by candidate: HR can edit application email before send (add
  PATCH allowance for email on `recruitment:manage`, event-logged).
- Offer to someone already an active employee (internal move): employees row exists →
  update employment_type/status? NO — block with 409 "already an employee; handle as internal
  transfer" (future feature), noted in UI.
- expires_at passing while candidate has page open: respond re-checks server-side (410).
- Salary privacy: offer JSON via token only; HR endpoints behind recruitment:manage; letter private-ACL.

## 9. Out of scope

E-signature on the letter (acceptance click + audit trail is the signature for now);
contract finalization/signing ceremony (LCM-01 step); internal transfers.

## 10. Rollout

Merge after REC-02/REC-03; if before LCM-01, the hook no-ops and `onboarding_pending` offers
are backfilled by LCM-01's migration script (listed there).
