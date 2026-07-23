# MOD-06: Leave (balances, manager approvals, calendar — Deel parity)

> **Status:** Implemented (backend + HR UI) — see §11 for what shipped
> **Track:** B default (may switch to A — first-free rule)
> **Depends on:** MOD-02 (`isManagerOf` — implemented here, not the full org-chart module), MOD-01
> **Blocks:** LCM-01 leave_setup kind, MOD-03 leave card, MOD-11
> **Branch:** `feat/mod-06-leave`

## 1. Goal

Leave reaches Deel parity: per-employee annual balances with accrual policy, request →
manager approval routed via the real org hierarchy (not free text), team/HR calendars,
overlap warnings, and self-service request/history. This is the module that lets the org
cancel Deel.

## 2. Context & current state

- Schema: `hr_leaves` (user_id→hr_users + new employee_id, type ANNUAL/SICK/MATERNITY/
  PATERNITY/UNPAID/OTHER, start/end_date, reason, status PENDING/APPROVED/REJECTED/CANCELLED,
  reviewed_by_id, reviewed_at) — backend/src/db/schema/hr/leave.ts. **No balances table.**
- Backend `/hr/leave` v0.1 exists (request CRUD-ish); frontend `app/leave/` + services with
  the `/leaves` vs `/leave` mismatch (FND-07 normalizes; alias earlier if needed).
- Approval routing today: none (HR reviews). Target: employee's manager approves
  (`isManagerOf` from MOD-02), HR can always act.
- Calendar: `app/calendar/page.tsx` + fullcalendar dep in apps/hr.

## 3. Schema changes

```ts
export const hr_leave_balances = pgTable("hr_leave_balances", {
  id: serial("id").primaryKey(),
  employee_id: /* uuid FK employees */,
  year: integer("year").notNull(),
  type: /* same leave type enum */,
  entitled_days: numeric("entitled_days", { precision: 5, scale: 1 }).notNull(),
  carried_over_days: numeric(..., ).notNull().default("0"),
  used_days: numeric(...).notNull().default("0"),      // denormalized, recomputed on approval/cancel
  ...timestampFields,
}, (t) => ({ uniq: uniqueIndex("balance_uniq").on(t.employee_id, t.year, t.type) }));

export const hr_leave_policies = pgTable("hr_leave_policies", {   // org defaults
  id: serial("id").primaryKey(),
  employment_type: text("employment_type").notNull(),  // fellow|analyst|staff|contractor|intern
  type: /* leave type */,
  annual_days: numeric(...).notNull(),
  max_carry_over: numeric(...).notNull().default("0"),
  ...timestampFields,
}, (t) => ({ uniq: uniqueIndex("leave_policy_uniq").on(t.employment_type, t.type) }));
```

Also on `hr_leaves`: ADD `days numeric(5,1)` (computed working days, stored at request),
`approver_note text`.

Working-day calc: Mon–Fri minus `hr_org_holidays(date, name)` (new tiny table + CRUD in
settings). Half-days out of scope v1.

## 4. API

`services/hr/leave.service.ts`:

- `computeDays(start, end)` — working days per above; 0 → 422.
- `ensureBalances(employeeId, year)` — instantiate from policies by employment_type
  (idempotent; the LCM-01 `leave_setup` side-effect calls this; also lazily called on first
  request of a year).
- Request: validate no overlap with own PENDING/APPROVED (409 listing), sufficient balance
  for balance-tracked types (ANNUAL, SICK per policy; UNPAID/OTHER untracked), create
  PENDING, notify approver (manager, else HR fallback when no manager).
- Decide: `approve/reject(leaveId, actor, note?)` — actor must be `isManagerOf(actor.employee, requester)`
  OR leave:manage; APPROVED updates `used_days`; REJECT requires note.
- Cancel: requester before start_date (APPROVED cancel → used_days released); HR anytime.

| Endpoint                                          | Permission                                           | Behavior                                                |
| ------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------- |
| `GET /hr/me/leave`                                | self                                                 | balances + my requests                                  |
| `POST /hr/me/leave` `{type,start,end,reason}`     | self                                                 | request flow above                                      |
| `POST /hr/leave/:id/cancel`                       | self(own)/leave:manage                               | per rules                                               |
| `GET /hr/leave/pending-approvals`                 | manager/hr                                           | my queue (reports' PENDING)                             |
| `POST /hr/leave/:id/approve` / `/reject` `{note}` | manager-of/leave:manage                              | decide                                                  |
| `GET /hr/leave?status&employee&type&range`        | leave:manage                                         | admin list                                              |
| `GET /hr/leave/calendar?from&to&team=me`          | employee (team=own reports/dept), leave:manage (all) | events for fullcalendar (approved + own pending)        |
| CRUD `/hr/leave-policies`, `/hr/holidays`         | leave:manage                                         | settings (`app/settings/timeoff` page exists — wire it) |
| `PATCH /hr/leave-balances/:id`                    | leave:manage                                         | manual adjustment (audit note required)                 |

## 5. Frontend

- `app/me/leave` (MOD-03 slot) / `app/leave/page.tsx`: balance cards per type
  (entitled/used/remaining ring), request dialog (type, range picker with working-day count
  preview + overlap warning from a dry-run param `?validate=true`), history table w/ status.
- Approvals `app/leave/approvals`: queue cards (requester, dates, days, balance-after,
  overlap-with-team warning), approve/reject (note dialog).
- Calendar `app/calendar`: fullcalendar month view — my team / department / org toggle per
  permission; colors by leave type; holiday underlay.
- Settings `app/settings/timeoff`: policies grid (per employment_type × type), holidays list.

## 6. Tests to write FIRST

Backend:

1. computeDays: spans weekend, holiday-aware, same-day, end<start 422.
2. Balance instantiation from policy by employment_type; idempotent; lazy-create on request.
3. Request guards: overlap 409, insufficient balance 422 (ANNUAL), UNPAID bypasses balance.
4. Approval routing: manager approves report 200; non-manager peer 403; HR always;
   fallback-to-HR when manager_id null (notification target asserted).
5. Approve → used_days; cancel approved → released; reject requires note.
6. Manual balance adjust requires note; audit trail present.
7. Calendar scoping: employee sees own+team only; hr sees all.
   Frontend:
8. Request dialog: day-count preview, insufficient-balance disabled state (MSW validate).
9. Approvals queue actions; calendar renders fixture events by type color.
   E2E: fellow requests 3 days → manager approves from Team view → balance ring updates →
   appears on HR calendar; second overlapping request blocked.

## 7. Acceptance criteria

- [ ] Balances real (policy-driven), visible to employee and HR identically.
- [ ] Approvals flow through manager_id with HR fallback/override; no free-text routing anywhere.
- [ ] Calendar shows approved leave org-wide for HR, team for managers/members.
- [ ] Deel-parity checklist reviewed with HR (request, approve, balance, calendar, history, policies, holidays) — sign-off recorded in PR.
- [ ] Path mismatch resolved (with FND-07 alias coordination).

## 8. Edge cases

- Year boundary requests (Dec→Jan): split days across two balance years proportionally.
- Carry-over: Jan 1 job (cron in notifications module) applies min(remaining, max_carry_over) — include in this spec, test with frozen clock.
- Manager requests own leave → routes to THEIR manager; top-of-tree (no manager) → HR queue.
- Maternity/paternity: policy-driven entitlements, no balance decrement beyond entitled (same mechanism).
- Timezone: dates are DATEs (no tz math).

## 9. Out of scope

Half-days/hours, accrual-per-month schedules (annual grant v1), external calendar sync
(task app integration later), payroll linkage.

## 10. Rollout

Backfill: `ensureBalances` for all active employees for the current year (script), HR
reviews entitlements before announcing. Run Deel in parallel one cycle; compare.

## 11. What shipped

Backend:

- Schema `backend/src/db/schema/hr/leave.ts`: `hr_leave_policies`, `hr_leave_balances`,
  `hr_org_holidays`; `hr_leaves.days` + `.approver_note`. Migrations `0013`, `0014`.
- `hr_leaves.user_id` (legacy hr_users FK) made **nullable** — MOD-06 writes `employee_id`
  only. The column drop itself stays in FND-07's contract phase.
- `leave-days.ts` (pure working-day math) + `leave-core.service.ts` (balances, requests,
  decisions, calendar, policies/holidays, carry-over, backfill). Re-exported from
  `leave.service.ts`, whose legacy hr_users CRUD is untouched.
- `isManagerOf` / `getManagerUserId` in `employee-context.ts` — walks the full manager chain
  (skip-level managers approve), cycle-safe.
- Routes `routes/hr/leave-core.routes.ts`, mounted **before** the `/leave` → `/leaves` 308
  alias in `routes/hr/index.ts`, which would otherwise swallow them.
- Carry-over cron (Jan 1) in the notifications module; `pnpm db:seed:leave` seeds default
  policies + backfills balances.

Frontend (`apps/hr`): balance cards + request dialog with live working-day preview and
insufficient-balance blocking on `app/leave`, approvals queue at `app/leave/approvals`,
policy/holiday settings at `app/settings/leave`.

Tests: 50 backend (unit working-day math, balances, request guards, approval-authority matrix,
calendar scoping, carry-over, and the HTTP surface incl. the alias-collision guard) and 16
frontend. `leave-core.service.ts` and `leave-days.ts` are under the 90% coverage gate.

Deviations from the spec above:

- Approval endpoints gate on `authenticate` alone, not `requirePermission("leave:approve")`:
  authority is a _relationship_ (the requester's manager) that the permission middleware cannot
  express, so the service enforces manager-or-HR and returns 403. A manager who holds no
  `leave:*` permission can still approve their reports — covered by a test.
- Leave settings live at `app/settings/leave`, not `app/settings/timeoff` — the latter already
  renders HR policy _documents_, a different concept.
- Year-boundary splitting (§8) is **not** implemented: a Dec→Jan request draws entirely on the
  start year's balance. Carry-over is implemented and tested.
