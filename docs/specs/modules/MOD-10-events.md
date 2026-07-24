# MOD-10: HR Events

> **Status:** Ready
> **Track:** B default
> **Depends on:** FND-05 (roles for targeting)
> **Blocks:** MOD-11 (upcoming-events card)
> **Branch:** `feat/mod-10-events`

## 1. Goal

Internal HR events (all-hands, trainings, socials, deadlines) created by HR, targeted at
the whole org or slices (departments/employment types), visible on employee calendars and
the dashboard, with RSVP.

## 2. Context & current state

- Net-new schema. NOTE: a PLATFORM `events` module already exists
  (`backend/src/routes/events.routes.ts` mounted at `/events` — used by alumni/portal).
  Do NOT collide: HR events are `hr_events`, routes `/hr/events`. Evaluate reuse first:
  read `schema/` for the platform events table — if it cleanly supports internal targeting,
  extend it instead and record the decision in the PR; the spec below assumes separate
  (safer default).
- UI references: archived `apps/_archived/main/hr/events/`; hr app calendar page
  (fullcalendar) already renders leave (MOD-06) — events join that calendar as a second source.

## 3. Schema changes

```ts
export const hr_events = pgTable("hr_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull().default("general"), // general|training|social|all_hands|deadline
  starts_at: timestamp(..., { withTimezone: true }).notNull(),
  ends_at: timestamp(..., { withTimezone: true }),
  location: text("location"),                        // free text or link
  audience: jsonb("audience").$type<{departments?: string[]; employment_types?: string[]}>(),
    // null = everyone
  rsvp_enabled: boolean("rsvp_enabled").notNull().default(false),
  created_by: integer(...).notNull().references(() => users.id),
  ...timestampFields,
});

export const hr_event_rsvps = pgTable("hr_event_rsvps", {
  id: serial("id").primaryKey(),
  event_id: /* FK cascade */,
  employee_id: /* uuid FK employees */,
  response: text("response").notNull(),              // yes|no|maybe
  ...timestampFields,
}, (t) => ({ uniq: uniqueIndex("rsvp_once").on(t.event_id, t.employee_id) }));
```

## 4. API

| Endpoint                                | Permission             | Behavior                                                                               |
| --------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------- |
| CRUD `/hr/events`                       | events:manage (hr)     | create notifies the audience (notification fan-out through existing module; cap batch) |
| `GET /hr/events?from&to`                | events:read (everyone) | audience-filtered to the caller (department/type match or null-audience)               |
| `POST /hr/events/:id/rsvp` `{response}` | audience member        | upsert                                                                                 |
| `GET /hr/events/:id/rsvps`              | events:manage          | counts + list                                                                          |

## 5. Frontend

- HR `app/settings/events` or within calendar page (pick: calendar page + a manage list
  panel for events:manage): create/edit dialog (fields incl. audience multi-selects, rsvp
  toggle).
- Employee: events render on `app/calendar` (distinct color by category) with click →
  detail popover (description, location, RSVP buttons when enabled).
- Dashboard card (MOD-11 consumes): next 3 events for me.

## 6. Tests to write FIRST

1. Audience filtering: dept-targeted event invisible to other departments; null = all.
2. RSVP upsert + counts; non-audience RSVP → 403.
3. Notification fan-out targets exactly the audience (mock asserts recipients).
4. Calendar range query correctness (tz-aware boundaries).
5. Frontend: calendar shows both leave + events sources; RSVP flow (MSW).
   E2E: HR creates training for fellows → fellow sees + RSVPs; staff doesn't see it.

## 7. Acceptance criteria

- [ ] Events live on the shared calendar with audience rules enforced server-side.
- [ ] RSVP counts visible to HR.
- [ ] Platform-events reuse decision recorded (separate vs extend) after reading the existing module.
- [ ] Archived events UI cleaned from any mock imports.

## 8. Edge cases

- Multi-day events render across days; missing ends_at = point event.
- Audience change after RSVPs: keep existing RSVPs, hide from removed audience (they just lose access).
- Timezones: store timestamptz; render in browser tz (org is single-tz today — no per-user tz v1).

## 9. Out of scope

External calendar invites (ics), recurring events, attendance tracking at events.

## 10. Rollout

Independent; seed a demo event on staging.
