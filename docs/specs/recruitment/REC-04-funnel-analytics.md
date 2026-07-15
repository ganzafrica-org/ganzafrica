# REC-04: Recruitment Funnel Analytics (views → form starts → submissions)

> **Status:** Ready
> **Track:** A (small — good gap-filler)
> **Depends on:** REC-01 (form + eligibility counters exist)
> **Blocks:** —
> **Branch:** `feat/rec-04-funnel`

## 1. Goal

Per posting, HR sees: how many people viewed it, how many started the form, how many
submitted, and how many were blocked by each eligibility rule — the funnel the user asked
for ("how many viewed, how many got to the form, how many applied").

## 2. Context & current state

- Public posting pages live in apps/web (opportunity detail + apply form from REC-01).
- Eligibility `hit_count` per rule already counts pre-submission rejections (REC-01).
- Submissions = `applications` rows. No view/start tracking exists.

## 3. Schema changes

```ts
// backend/src/db/schema/recruitment/funnel.ts
export const opportunity_funnel_events = pgTable(
  "opportunity_funnel_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    opportunity_id: integer("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    event: text("event").notNull(), // 'view' | 'form_start' | 'form_submit'
    session_key: char("session_key", { length: 36 }).notNull(), // client-generated uuid, anonymous
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    oppEventIdx: index("funnel_opp_event_idx").on(t.opportunity_id, t.event, t.created_at),
    dedupIdx: uniqueIndex("funnel_dedup_idx").on(t.opportunity_id, t.event, t.session_key),
  }),
);
```

Dedup via the unique index: one view/start/submit per session per posting — inserts use
`ON CONFLICT DO NOTHING`. No PII, no IP, no user agent stored.

## 4. API

| Endpoint                                                | Auth                                  | Behavior                                                                                                                                                                                                                                     |
| ------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /opportunities/:id/events` `{event, session_key}` | public, rate-limit 60/min/IP          | Validate event ∈ enum, session_key is uuid, opportunity exists+published; insert-ignore; always `204` (fire-and-forget — never block the page on errors; invalid input also 204 after validation failure is logged, to keep the client dumb) |
| `GET /hr/recruitment/opportunities/:id/funnel`          | requirePermission("recruitment:read") | `200 { views, form_starts, submissions, eligibility_blocks: [{rule_id, field_key, reject_message, hits}], conversion: {view_to_start, start_to_submit} }` — counts distinct session_keys; blocks from REC-01 hit_count                       |

Counts are single GROUP BY queries; no rollup table unless volume ever demands it (note in
code comment where the rollup would go).

## 5. Frontend

**apps/web instrumentation** (tiny client util `lib/funnel.ts`):

- `session_key`: `crypto.randomUUID()` in `sessionStorage` (per-tab-session — acceptable
  granularity; NOT localStorage, no cross-visit tracking, no consent-banner implications).
- `view`: posting detail page mount (useEffect once).
- `form_start`: first input/change on the application form (once per mount, guarded).
- `form_submit`: on successful apply response (the API measures real submissions anyway —
  this event lets start→submit be computed on the same session basis).
- `navigator.sendBeacon` where available, fetch keepalive fallback; failures swallowed.

**apps/hr funnel widget** `components/recruitment/funnel-widget.tsx`:

- Horizontal funnel bar (views → starts → submits) with absolute numbers + conversion %,
  and an "Eligibility blocks" list (reject_message + count).
- Placed on the posting card (REC-03 §5a compact variant) and the pipeline page header
  (REC-03 §5c full variant). Empty state: "No traffic yet."

## 6. Tests to write FIRST

Backend:

1. Same session posts `view` 3× → one row; distinct sessions → 3.
2. Invalid event name / bad uuid / unpublished opportunity → 204, no row, warning logged.
3. Funnel GET math: fixture (5 views, 3 starts, 2 submissions, rule with 4 hits) → exact JSON.
4. Permissions: staff 403; director (recruitment:read) 200.
   Frontend (web): view fires once per mount; form_start once despite multiple keystrokes;
   uses sendBeacon when defined (spy).
   E2E: extend the REC-01 apply e2e — after the run, HR funnel endpoint reflects 1/1/1.

## 7. Acceptance criteria

- [ ] Funnel widget shows real numbers for the pilot posting.
- [ ] Zero PII in the events table (schema review: no ip/ua/user_id columns).
- [ ] Event endpoint cannot 5xx the public page (all failure paths → 204/logged).
- [ ] Dedup holds under the e2e run (repeat visits same tab don't inflate).

## 8. Edge cases

- Ad-blockers killing beacons: accepted undercount; submissions remain exact (DB rows).
- Bot traffic inflating views: rate limit + dedup blunt it; revisit with a bot filter only if HR reports nonsense.
- `sessionStorage` unavailable (private mode edge): generate ephemeral key in memory — still works within the page's life.

## 9. Out of scope

Time-in-stage analytics (derivable from `application_stage_events` later), rollup tables,
external analytics tools.

## 10. Rollout

Backend + web instrumentation deploy together; widget appears with the next hr release.
