# MOD-12: Attendance — DEFERRED

> **Status:** DEFERRED (wave 6+; spec kept so no re-planning is needed when picked up)
> **Track:** B default
> **Depends on:** MOD-01, MOD-06 (leave integration)
> **Blocks:** —
> **Branch:** `feat/mod-12-attendance`

## 1. Goal (when activated)

Lightweight presence tracking: daily check-in/out (web), a monthly attendance sheet per
employee reconciled against approved leave and org holidays, and HR exception reports
(absent without leave). Explicitly NOT a biometric/time-clock system.

## 2. Context & current state

- Mock UI: `apps/hr/src/app/employees/attendance/page.tsx`; archived
  `apps/_archived/main/hr/attendance/`. No backend.
- The user flagged this as "a bit of a stretch for now" — hence deferred. Decision to
  activate belongs to the user + HR (is check-in culture wanted at all?). If HR only needs
  leave-adjusted presence REPORTS, build §4b only and skip check-ins.

## 3. Schema sketch

```ts
export const hr_attendance = pgTable("hr_attendance", {
  id: serial("id").primaryKey(),
  employee_id: /* uuid FK employees */,
  date: date("date").notNull(),
  check_in: timestamp(..., { withTimezone: true }),
  check_out: timestamp(..., { withTimezone: true }),
  source: text("source").notNull().default("self"),   // self|hr_adjusted
  note: text("note"),
  ...timestampFields,
}, (t) => ({ uniq: uniqueIndex("attendance_day").on(t.employee_id, t.date) }));
```

Day status is DERIVED (never stored): present (row) | on_leave (MOD-06 approved) |
holiday (hr_org_holidays) | weekend | absent (working day, no row, no leave).

## 4. API sketch

a) `POST /hr/me/attendance/check-in` / `check-out` (self, today only, idempotent);
b) `GET /hr/attendance/report?month&department` (attendance:manage → add permission to
   catalog at activation): matrix employee × day with derived statuses + absent-without-leave
   list; `GET /hr/me/attendance?month` (self view);
c) `PATCH /hr/attendance/:employeeId/:date` (attendance:manage) — HR adjustment with note.

## 5–6. Frontend & tests (summary — expand at activation)

Employee: check-in widget on /me + my month grid. HR: report grid (statuses color-coded),
exceptions list, adjust dialog. Tests: derivation matrix (leave/holiday/weekend/absent
precedence), idempotent check-in, uniqueness, report correctness against MOD-06 fixtures,
permission sweep. E2E: check-in → report reflects; leave day shows on_leave not absent.

## 7. Acceptance criteria (at activation)

- [ ] Derived-status precedence: leave > holiday > weekend > presence > absent.
- [ ] Report reconciles with MOD-06 with zero double-counting.
- [ ] Self check-in cannot backfill (today only); HR adjustments always noted.

## 8–9. Edge cases / out of scope

Forgot-to-check-out (auto-close at midnight with flag); remote/travel days (note field v1);
out of scope: geolocation, biometric, overtime calculation, payroll linkage.

## 10. Activation checklist

1. Confirm with HR that check-ins are wanted (vs reports-only variant).
2. Add `attendance:*` permissions to seed + auth-and-rbac.md.
3. Expand §5/§6 to full spec detail (one page) before implementation.
