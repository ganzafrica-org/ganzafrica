# MOD-09: Performance + Feedback (review cycles, goals, peer/manager feedback)

> **Status:** Ready
> **Track:** B default
> **Depends on:** MOD-02 (manager relationships), FND-05 (roles)
> **Blocks:** MOD-11 (dashboard widgets)
> **Branch:** `feat/mod-09-performance`

## 1. Goal

A working performance module: HR opens review cycles; employees set goals agreed with their
manager; during a cycle, self-review + manager review (+ optional peer feedback) are
collected against a rating scale; managers see their team's status; HR sees completion
across the org. Continuous feedback (praise/suggestion) can be given any time — the
"feedback" feature the user called out.

## 2. Context & current state

- NOTHING exists in the backend — schema is net-new.
- Mock UI to replace: `apps/hr/src/app/performance/page.tsx` +
  `app/employees/performance/`; archived reference `apps/_archived/main/hr/performance/`
  (harvest layout: cycle cards, review forms, ratings display).
- Manager checks: `isManagerOf` (MOD-02). Notifications module for nudges.

## 3. Schema changes (net-new file `backend/src/db/schema/hr/performance.ts`)

```ts
export const perf_cycles = pgTable("perf_cycles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),                    // "2026 Mid-Year"
  starts_on: date("starts_on").notNull(),
  ends_on: date("ends_on").notNull(),
  status: text("status").notNull().default("draft"), // draft|open|closed
  rating_scale: jsonb("rating_scale").$type<{value:number,label:string}[]>().notNull(),
    // e.g. [{value:1,label:"Needs improvement"}..{value:5,label:"Outstanding"}]
  include_peer_feedback: boolean("include_peer_feedback").notNull().default(false),
  created_by: integer("created_by").notNull().references(() => users.id),
  ...timestampFields,
});

export const perf_goals = pgTable("perf_goals", {
  id: serial("id").primaryKey(),
  employee_id: /* uuid FK employees */,
  cycle_id: integer("cycle_id").references(() => perf_cycles.id), // null = standing goal
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"), // active|achieved|dropped
  agreed_with_manager: boolean("agreed_with_manager").notNull().default(false),
  ...timestampFields,
});

export const perf_reviews = pgTable("perf_reviews", {
  id: serial("id").primaryKey(),
  cycle_id: integer("cycle_id").notNull().references(() => perf_cycles.id),
  employee_id: /* uuid FK employees */,            // the subject
  reviewer_user_id: integer(...).notNull().references(() => users.id),
  kind: text("kind").notNull(),                    // self|manager|peer
  rating: integer("rating"),                       // within cycle scale; null until submitted
  strengths: text("strengths"),
  improvements: text("improvements"),
  goal_comments: jsonb("goal_comments").$type<{goal_id:number, comment:string}[]>(),
  status: text("status").notNull().default("pending"), // pending|submitted
  submitted_at: timestamp(..., { withTimezone: true }),
  ...timestampFields,
}, (t) => ({ uniq: uniqueIndex("review_uniq").on(t.cycle_id, t.employee_id, t.reviewer_user_id, t.kind) }));

export const feedback_notes = pgTable("feedback_notes", {  // continuous feedback
  id: serial("id").primaryKey(),
  employee_id: /* subject, uuid FK employees */,
  author_user_id: integer(...).notNull().references(() => users.id),
  kind: text("kind").notNull(),                    // praise|suggestion
  body: text("body").notNull(),
  visibility: text("visibility").notNull().default("subject_and_manager"),
    // 'subject_and_manager' | 'manager_only' | 'public_team'
  ...timestampFields,
});
```

## 4. API (routes/hr/performance.routes.ts)

| Endpoint                                                              | Permission                                     | Behavior                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CRUD `/hr/perf/cycles`                                                | performance:manage (hr)                        | open → instantiate pending reviews: self for every active employee, manager review per manager_id (null manager → hr owner), peers only if flag (peer selection = manager picks up to 3, endpoint below); close → freeze (no more submissions) |
| `POST /hr/perf/cycles/:id/peers` `{employee_id, peer_user_ids[]}`     | manager-of or manage                           | create pending peer reviews                                                                                                                                                                                                                    |
| `GET /hr/me/reviews`                                                  | self                                           | reviews I must write (as reviewer) + my own results (as subject; manager/peer reviews visible only after cycle close AND manager review submitted — HR configurable? keep fixed rule v1)                                                       |
| `PATCH /hr/reviews/:id`                                               | the reviewer, while cycle open                 | save draft / submit (`status=submitted` requires rating + strengths)                                                                                                                                                                           |
| `GET /hr/perf/cycles/:id/status`                                      | performance:manage; managers get their subtree | completion matrix (submitted/pending by kind)                                                                                                                                                                                                  |
| Goals: CRUD `/hr/me/goals`; `PATCH /hr/goals/:id/agree`               | self; manager-of                               | agree flips agreed_with_manager (manager only)                                                                                                                                                                                                 |
| Feedback: `POST /hr/feedback` `{employee_id, kind, body, visibility}` | any employee                                   | store + notify per visibility                                                                                                                                                                                                                  |
| `GET /hr/me/feedback` / `GET /hr/employees/:id/feedback`              | self / manager-of or review:performance        | visibility-filtered                                                                                                                                                                                                                            |

Review visibility rule (service-enforced, test hard): subject NEVER reads manager/peer
review content while cycle open; reviewer reads only own drafts; hr reads all.

## 5. Frontend (apps/hr — replace mock pages; harvest \_archived layouts)

- HR `app/performance`: cycles list + create (dates, scale editor with sensible 1–5 default,
  peer toggle), cycle detail = completion dashboard (bar per kind, nudge button →
  notification to laggards), org results after close (avg rating by department — simple).
- Manager: team review queue (write manager reviews, pick peers, agree goals), team results
  post-close.
- Employee `app/me/performance` (MOD-03 shell): my goals CRUD (+agreed badge), reviews to
  write (self/peer forms: rating selector from cycle scale, strengths/improvements,
  per-goal comments), my results (post-close view: manager rating + text, feedback notes).
- Continuous feedback: "Give feedback" button on employee profiles (MOD-01 detail) →
  dialog (kind, visibility, body); feed on own /me/performance.

## 6. Tests to write FIRST

1. Cycle open instantiation: correct pending set (self×N, manager per reports, no manager →
   hr fallback); reopen-idempotent (no dupes on double-open).
2. Visibility rule matrix: subject during open (403 on manager review content), after close
   (200); reviewer drafts private; hr all — table-driven.
3. Submit validation: rating within scale bounds, required fields; edits after close 409.
4. Peer selection: only manager-of or manage; max 3.
5. Goals: agree only by manager-of; subject CRUD own only.
6. Feedback visibility filtering (3 kinds × reader roles).
7. Frontend: review form drives from scale fixture; results hidden pre-close (MSW).
   E2E: HR opens cycle → employee submits self-review + manager submits → HR closes →
   employee sees results; peer path when enabled.

## 7. Acceptance criteria

- [ ] Full cycle e2e green incl. the visibility rule at each stage.
- [ ] Mock performance pages deleted; archived layouts adapted.
- [ ] Completion dashboard live for HR with nudges.
- [ ] Continuous feedback usable from profiles with visibility respected.

## 8. Edge cases

- Employee hired mid-cycle: HR "add to cycle" action (instantiates their pending set).
- Manager change mid-cycle: existing pending manager review reassigned via PATCH (manage).
- Offboarded mid-cycle: their pending reviews auto-cancelled by LCM-02? — add to LCM-02
  completion hook list as informational note only (non-blocking); reviews of them by others stay.
- Rating scale edited after open: blocked (409) — scale frozen at open.

## 9. Out of scope

360-degree anonymity guarantees, calibration workflows, compensation linkage, PDF exports.

## 10. Rollout

Pilot one small cycle (HR + one team) before org-wide.
