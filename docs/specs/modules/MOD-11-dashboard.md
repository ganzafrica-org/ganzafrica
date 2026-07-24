# MOD-11: Dashboard (real data for the HR home)

> **Status:** Ready
> **Track:** whoever is free (wave 6)
> **Depends on:** data sources — MOD-01/02/04/05/06/07/08/09/10, REC-02, LCM-01/02 (degrades gracefully for any not yet merged)
> **Blocks:** —
> **Branch:** `feat/mod-11-dashboard`

## 1. Goal

The HR dashboard (`app/dashboard`) and home cards stop lying: every widget renders live
numbers with drill-through links. Role-aware: hr/admin get the org view; managers a team
flavor; employees are routed to /me (MOD-03) instead.

## 2. Context & current state

- Mock today: `apps/hr/src/app/dashboard/`, `app/page.tsx` home cards in
  `components/sections/home-cards/` (Applicants, CurrentProject, EmploymentStatus,
  LeaveSummary, Schedule, SystemAlerts) — all fed from `src/data/*.ts`.
- Every needed metric already has an API from prior specs; this spec is one aggregate
  endpoint + rewiring cards.

## 3. Schema changes

None.

## 4. API

`GET /hr/dashboard` (requirePermission("reports:read") — hr, finance, director; managers get
a `scope=team` variant keyed to their subtree):

```json
{
  "headcount": {"active": 42, "onboarding": 3, "offboarding": 1, "on_leave": 4,
                 "by_department": [...], "by_employment_type": [...]},
  "recruitment": {"open_postings": 2, "applications_this_month": 57,
                   "by_stage": {...}, "offers_pending": 1},
  "leave": {"pending_approvals": 5, "on_leave_today": [...names], "upcoming_7d": 8},
  "assets": {"assigned": 35, "available": 9, "under_maintenance": 2, "flagged": 1},
  "helpdesk": {"open": 4, "unassigned": 2, "avg_open_days": 3.2},
  "payroll": {"last_period": "01.26", "sent": 40, "failed": 1},
  "performance": {"open_cycle": "2026 Mid-Year", "completion_pct": 62},
  "events": {"upcoming": [...next 3]},
  "processes": {"onboarding_active": 3, "offboarding_active": 1, "overdue_tasks": 6},
  "alerts": [{"kind":"contract_expiring","count":2}, {"kind":"email_failed","count":1},
              {"kind":"unresolved_managers","count":3}]
}
```

One service (`services/hr/dashboard.service.ts`) composing COUNT queries; each section
try/caught → `null` on error/missing tables (module not merged yet) — the endpoint never
500s because a source lags. 60s in-memory cache. Alerts pull from: contracts ending <30d,
payroll email_error rows, MOD-02 unresolved table, overdue process tasks.

## 5. Frontend

- Rewire each home card to its `GET /hr/dashboard` slice; delete `src/data/` fixtures used
  by cards (CurrentProject card: no backing module — DELETE the card, note in PR).
- Each stat links to its module page pre-filtered (e.g. pending approvals → leave approvals).
- Null section → card renders "coming soon" quietly (not an error).
- Role gate: employees hitting `/dashboard` → redirect `/me` (MOD-03 nav already hides it).
- Charts (headcount by dept/type, applications by stage): recharts (already a dep in internal;
  add to hr) or the existing chart components in hr — small bar/donut, no dashboards-framework.

## 6. Tests to write FIRST

1. Dashboard service numbers against a rich fixture (each section asserted exactly).
2. Degradation: drop one module's tables in fixture → that section null, 200, others intact.
3. Manager scope: team counts only.
4. Permission: employee → 403 (API) and redirect (UI test).
5. Frontend: cards render from MSW payload incl. null sections; links carry filters.
   E2E: seeded org → dashboard numbers match seed expectations (spot-check 3).

## 7. Acceptance criteria

- [ ] Zero mock imports in dashboard/home cards; deleted card noted.
- [ ] Every number click-throughs to a filtered module view.
- [ ] Endpoint degrades per-section, never 500s.
- [ ] Alerts surface the 4 defined kinds with real counts.

## 8. Edge cases

- Empty org sections render zeros, not skeletons forever.
- Cache staleness after actions: mutations in other modules don't need to bust this cache (60s is fine — note in code).
- Slow queries: each section has its own query — if any exceeds ~200ms on prod data, add the missing index in this PR.

## 9. Out of scope

Custom report builder, exports, historical trend storage (charts read current state only).

## 10. Rollout

Last of the modules; ship whenever ≥ half the sources are live (degradation covers the rest).
