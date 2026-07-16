# REC-02: Recruitment Pipeline Backend (stages, screening, emails, evaluation)

> **Status:** Ready
> **Track:** A
> **Depends on:** REC-01, FND-05 (requirePermission)
> **Blocks:** REC-03, REC-05
> **Branch:** `feat/rec-02-pipeline`

## 1. Goal

Applications move through a CRM-style staged pipeline with an audit trail, post-submission
screening rules (auto-reject/flag), idempotent applicant emails at stage transitions, and
weighted evaluation scoring — all on top of the existing `applications` table, additively.

## 2. Context & current state

- `applications` (backend/src/db/schema/opportunities.ts:124) has
  `status applicationStatusEnum` default 'submitted' — check `schema/enums.ts` for its
  current values; DO NOT repurpose it (portal reads it). New `pipeline_stage` column is the
  pipeline's truth; a sync rule keeps legacy `status` coherent (mapping below).
- `application_reviews` (line 180): `reviewer_id`, `score int`, `comments`, `recommendation`,
  unique (application, reviewer). Kept as the overall-recommendation record; per-criterion
  scores are new.
- Emails: `backend/src/services/email.service.ts` (Resend, inline HTML).
- Portal application views read these tables — additive changes only.

## 3. Schema changes

```ts
// backend/src/db/schema/recruitment/pipeline.ts
export const pipeline_stage = [
  "submitted",
  "screening",
  "shortlisted",
  "interview",
  "evaluation",
  "offer",
  "hired",
  "rejected",
  "withdrawn",
] as const;

// ALTER applications:
//   ADD pipeline_stage text NOT NULL DEFAULT 'submitted' (CHECK in enum)
//   ADD rejection_reason text
//   ADD flagged boolean NOT NULL DEFAULT false
//   ADD flag_note text

export const application_stage_events = pgTable(
  "application_stage_events",
  {
    id: serial("id").primaryKey(),
    application_id: integer("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    from_stage: text("from_stage"),
    to_stage: text("to_stage").notNull(),
    actor_user_id: integer("actor_user_id").references(() => users.id), // NULL = automation
    note: text("note"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ appIdx: index("stage_events_app_idx").on(t.application_id) }),
);

export const screening_rules = pgTable("screening_rules", {
  // same shape/operators as eligibility_rules (REC-01) minus reject_message, plus:
  id: serial("id").primaryKey(),
  opportunity_id: integer("opportunity_id")
    .notNull()
    .references(() => opportunities.id, { onDelete: "cascade" }),
  field_key: text("field_key").notNull(),
  operator: text("operator").notNull(),
  value: jsonb("value"),
  action: text("action").notNull(), // 'auto_reject' | 'flag'
  email_template: text("email_template"), // template key for auto_reject (null = silent reject)
  rejection_reason: text("rejection_reason"), // stored on the application
  is_active: boolean("is_active").notNull().default(true),
  hit_count: integer("hit_count").notNull().default(0),
  ...timestampFields,
});

export const evaluation_criteria = pgTable("evaluation_criteria", {
  id: serial("id").primaryKey(),
  opportunity_id: integer("opportunity_id")
    .notNull()
    .references(() => opportunities.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  weight: numeric("weight", { precision: 5, scale: 2 }).notNull().default("1"),
  max_score: integer("max_score").notNull().default(5),
  sort_order: integer("sort_order").notNull().default(0),
  ...timestampFields,
});

export const application_scores = pgTable(
  "application_scores",
  {
    id: serial("id").primaryKey(),
    application_id: integer("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    criterion_id: integer("criterion_id")
      .notNull()
      .references(() => evaluation_criteria.id, { onDelete: "cascade" }),
    reviewer_user_id: integer("reviewer_user_id")
      .notNull()
      .references(() => users.id),
    score: integer("score").notNull(), // 0..criterion.max_score, service-validated
    comment: text("comment"),
    ...timestampFields,
  },
  (t) => ({
    uniq: uniqueIndex("app_score_uniq").on(t.application_id, t.criterion_id, t.reviewer_user_id),
  }),
);

export const recruitment_emails = pgTable(
  "recruitment_emails",
  {
    id: serial("id").primaryKey(),
    application_id: integer("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    email_type: text("email_type").notNull(), // 'received'|'rejected'|'shortlisted'|'interview'|'offer'|'hired'
    sent_at: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ uniq: uniqueIndex("recruitment_email_once").on(t.application_id, t.email_type) }),
);
```

Legacy `status` sync mapping (service-level, on every stage change):
hired→'accepted'-family, rejected→'rejected'-family, withdrawn→'withdrawn' if the enum has
it, everything else→'submitted'/'under_review'-family — read `applicationStatusEnum`'s real
values first and encode the map as data with a test.

## 4. API & services

`backend/src/services/recruitment/pipeline.service.ts`:

- `ALLOWED_TRANSITIONS: Record<Stage, Stage[]>` — submitted→screening|rejected|withdrawn;
  screening→shortlisted|rejected|withdrawn; shortlisted→interview|rejected|withdrawn;
  interview→evaluation|rejected|withdrawn; evaluation→offer|rejected|withdrawn;
  offer→hired|rejected|withdrawn (offer/hired transitions are executed by REC-05, still
  validated here); rejected/withdrawn/hired → ∅ (terminal). `withdrawn` reachable from any
  non-terminal stage (applicant-initiated, via REC-05's applicant links later — for now HR-set).
- `transition(applicationId, toStage, actorUserId|null, note?)` — validates matrix, writes
  application + stage event in one transaction, triggers the stage email (below), syncs legacy status.
- `runScreening(applicationId)` — called AFTER insert by the apply handler (REC-01's), and
  re-runnable via API. Wrapped in try/catch: **a screening error never fails the submission**.
  Rules evaluated with the REC-01 engine; `flag` action → `flagged=true, flag_note`;
  `auto_reject` → `transition(..., "rejected", null)` + `rejection_reason`; hit counters bumped.
- Email sender `sendApplicantEmail(applicationId, type)` — INSERT into `recruitment_emails`
  first; unique-violation → skip (idempotency); then Resend. Templates in
  `services/recruitment/email-templates.ts`: `received` (on submit), `rejected`
  (uses `rejection_reason` in courteous copy), `shortlisted`, `interview`, GanzAfrica-branded
  like the payslip HTML. Stage→email map: submitted→received, rejected→rejected (only if the
  rejecting rule/actor asked — HR manual reject has a "send email" checkbox → parameter),
  shortlisted→shortlisted, interview→interview.

Routes (`routes/hr/recruitment.routes.ts`, mounted under `/hr` — all `requirePermission("recruitment:manage")`
unless noted):

| Endpoint                                                                                     | Behavior                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /hr/recruitment/opportunities`                                                          | HR list: opportunities + counts per stage (one GROUP BY) — also readable by `recruitment:read` (director)                                                                         |
| `GET /hr/recruitment/applications?opportunity_id&stage&flagged&search&page`                  | paged list, joined essentials                                                                                                                                                     |
| `GET /hr/recruitment/applications/:id`                                                       | full detail: answers, stage events, scores, emails sent                                                                                                                           |
| `POST /hr/recruitment/applications/:id/transition` `{to_stage, note?, send_email?: boolean}` | `transition()`; 409 on illegal move with `{allowed:[...]}`                                                                                                                        |
| `POST /hr/recruitment/applications/:id/rescreen`                                             | re-run screening (rules changed)                                                                                                                                                  |
| CRUD `/hr/recruitment/opportunities/:id/screening-rules`                                     | like REC-01 rules endpoints                                                                                                                                                       |
| CRUD `/hr/recruitment/opportunities/:id/criteria`                                            | evaluation criteria; block delete when scores exist                                                                                                                               |
| `PUT /hr/recruitment/applications/:id/scores` `{scores:[{criterion_id, score, comment}]}`    | upsert own scores (`recruitment:manage` OR an assigned reviewer — reviewers get `recruitment:read` + row check); weighted total = Σ(score/max\*weight)/Σweight, returned computed |

## 5. Frontend

None (REC-03). This spec ships API + a seed script `backend/scripts/seed-recruitment-demo.ts`
(one opportunity, form, rules, 12 applications across stages) for UI development.

## 6. Tests to write FIRST

1. Transition matrix: table-driven legal/illegal (409 lists allowed).
2. Transition transactionality: forced email failure → stage still moves, email marked absent (email is post-commit, non-blocking) — decide-and-test: email sending happens AFTER commit, failure logged + retryable via a `resend` param, never rolls back the stage.
3. Screening: auto_reject rule → stage rejected, event actor NULL, rejection_reason set, rejected email recorded once; flag rule → flagged, no email.
4. Screening error injection (rule with garbage operator) → application stays submitted, error logged, POST /apply still 2xx (characterization from REC-01 still green).
5. Email idempotency: two rescreens → one `rejected` row, one Resend call (mock counts).
6. Scores: upsert overwrites own, not others'; weighted total math (fixture with weights 2/1/1); score > max_score → 422.
7. Legacy status sync: each pipeline stage maps to the asserted enum value.
8. Permissions: staff 403 on everything; director reads lists but 403 on transition.

## 7. Acceptance criteria

- [ ] An application flows submitted→…→evaluation via API with a complete audit trail.
- [ ] A screening rule set BEFORE applications arrive auto-rejects matching ones with a single courteous email; identical resubmission never double-emails.
- [ ] Screening can never break a public submission (error-injection test green).
- [ ] Weighted scores computed server-side; reviewers can't edit each other's scores.
- [ ] Portal's existing application views unaffected (legacy status coherent).

## 8. Edge cases

- Concurrent transitions: `UPDATE ... WHERE pipeline_stage = $from` (optimistic) — 0 rows → 409.
- Applicant reapplies to the same opportunity: allowed (no unique) — HR sees both; note in list UI (REC-03).
- Rule edits are prospective only (rescreen is explicit, never automatic on rule change).
- GDPR-ish: rejection emails contain no rule internals — only `rejection_reason` copy written by HR.

## 9. Out of scope

Offers/hire (REC-05), UI (REC-03), funnel events (REC-04), interview scheduling tooling
(calendar invites — future; `interview` stage is a status only for now).

## 10. Rollout

Backend-only; inert until REC-03 UI lands. Seed script gives Track A a demo pipeline immediately.
