# LCM-01: Onboarding (templates, checklists, per-step assignees, role-scoped views)

> **Status:** Ready
> **Track:** A
> **Depends on:** REC-05 (hire trigger), FND-05 (employees/RBAC), FND-07 (hr routes on requirePermission)
> **Blocks:** LCM-02 (same pattern)
> **Branch:** `feat/lcm-01-onboarding`

## 1. Goal

Accepted offer → an onboarding checklist is instantiated from a template: tasks with due
dates, each assignable to a person (HR, IT, the manager, finance, or the onboardee), some
staff-only (invisible to the onboardee), some blocking. The onboardee sees THEIR view
(own tasks + overall progress); HR/assignees see everything. Completion flips the employee
to `active` — contract signed, leave set up, assets issued, all tracked as steps.

## 2. Context & current state

- Nothing exists: no onboarding tables; `apps/hr/src/components/sections/employee/on-boarding.tsx`
  is fully commented out; archived demo at `apps/_archived/main/hr/onboarding/` (mock UI —
  harvest layout ideas).
- Trigger: REC-05's `onboarding.hooks.onHired(employeeId, offer)` seam + its
  `onboarding_pending` backfill list.
- Draft contract from REC-05 (`hr_contracts` status — check `contractStatusEnum` values for a
  draft-like value; add `'DRAFT'` to the enum if absent, via migration).
- Leave setup: MOD-06 owns balances; the onboarding "set up leave" task links there.

## 3. Schema changes (shared with LCM-02 — the `type` column does the splitting)

```ts
// backend/src/db/schema/hr/processes.ts
export const process_templates = pgTable("process_templates", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),                    // 'onboarding' | 'offboarding'
  name: text("name").notNull(),                    // e.g. "Fellow onboarding", "Staff onboarding"
  employment_types: jsonb("employment_types").$type<string[]>(), // null = any; else auto-pick match
  is_active: boolean("is_active").notNull().default(true),
  created_by: integer("created_by").notNull().references(() => users.id),
  ...timestampFields,
});

export const process_template_tasks = pgTable("process_template_tasks", {
  id: serial("id").primaryKey(),
  template_id: integer("template_id").notNull()
    .references(() => process_templates.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  sort_order: integer("sort_order").notNull(),
  default_assignee: text("default_assignee").notNull(), // 'hr'|'it'|'manager'|'finance'|'employee'
  visibility: text("visibility").notNull().default("all"), // 'all' | 'staff_only'
  due_offset_days: integer("due_offset_days"),     // from instance start
  is_blocking: boolean("is_blocking").notNull().default(false),
  kind: text("kind").notNull().default("checklist"),
    // 'checklist' | 'contract_signing' | 'document_upload' | 'asset_assignment' | 'leave_setup'
    // kind drives a widget on the task card + a completion side-effect hook (see §4)
  ...timestampFields,
});

export const process_instances = pgTable("process_instances", {
  id: serial("id").primaryKey(),
  template_id: integer("template_id").references(() => process_templates.id),
  type: text("type").notNull(),
  employee_id: uuid("employee_id").notNull().references(() => employees.id),
  status: text("status").notNull().default("in_progress"), // in_progress|completed|cancelled
  started_at: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  due_date: date("due_date"),
  completed_at: timestamp("completed_at", { withTimezone: true }),
  // offboarding-only columns (used by LCM-02, nullable here):
  offboarding_reason: text("offboarding_reason"),
  last_working_day: date("last_working_day"),
  grant_alumni: boolean("grant_alumni").notNull().default(false),
  ...timestampFields,
});

export const process_tasks = pgTable("process_tasks", {   // snapshot copy at instantiation
  id: serial("id").primaryKey(),
  instance_id: integer("instance_id").notNull()
    .references(() => process_instances.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  sort_order: integer("sort_order").notNull(),
  assignee_user_id: integer("assignee_user_id").references(() => users.id), // resolved; reassignable
  visibility: text("visibility").notNull().default("all"),
  is_blocking: boolean("is_blocking").notNull().default(false),
  kind: text("kind").notNull().default("checklist"),
  status: text("status").notNull().default("pending"),     // pending|done|skipped
  due_date: date("due_date"),
  completed_at: timestamp("completed_at", { withTimezone: true }),
  completed_by: integer("completed_by").references(() => users.id),
  notes: text("notes"),
  link_ref: jsonb("link_ref"),   // kind-specific: {contract_id} | {document_id} | {asset_id}
  ...timestampFields,
});
```

## 4. API & services

`backend/src/services/hr/process.service.ts` (type-agnostic — LCM-02 reuses):
- `instantiateProcess(type, employeeId, opts)` — picks template (matching `employment_types`,
  else the active default), snapshots tasks, resolves assignees: `hr` → all users with hr
  role? NO — the instance has a single `owner` per assignee-class resolved at creation:
  hr → the triggering HR user (or first hr-role user for automated hires), `manager` →
  `employees.manager_id`→user (null manager → falls back to hr owner + flag in response),
  `employee` → the onboardee's user, `it`/`finance` → first user with that role (reassignable).
  Due dates = started_at + offset.
- `completeTask(taskId, actorUserId, notes?)` — allowed for the task's assignee, hr, admin.
  Kind side-effect hooks on completion: `contract_signing` → require `link_ref.contract_id`
  contract status ACTIVE (the completing HR confirms the signed agreement URL is on the
  contract — MOD-01's contract tab); `leave_setup` → verify a leave balance row exists
  (MOD-06 API) else 422 with instruction; others = plain checklist.
- `completeInstance(instanceId)` — auto-invoked when the last blocking task completes
  (non-blocking may remain; they stay actionable): onboarding → `employees.status='active'`;
  emits notification (existing `modules/hr/notifications`); LCM-02 overrides the hook.
- REC-05 seam: `onboarding.hooks.onHired` → `instantiateProcess("onboarding", …)`.
  Backfill script for `onboarding_pending` offers (run once at deploy).

Routes (`routes/hr/processes.routes.ts`):
| Endpoint | Auth | Behavior |
|---|---|---|
| CRUD `/hr/process-templates` (+ nested tasks) | `requirePermission("onboarding:manage")` (shared perm w/ offboarding: name it `processes:manage` in the seed — update auth-and-rbac.md accordingly) | template builder backend; deactivate not delete once used |
| `POST /hr/employees/:id/processes` `{type, template_id?}` | processes:manage | manual instantiation (hires predating REC-05) |
| `GET /hr/processes?type&status&employee_id` | processes:manage | list w/ progress % (done blocking / total blocking) |
| `GET /hr/processes/:id` | processes:manage OR any task assignee OR the subject employee | **response filtered:** subject employee sees only `visibility='all'` tasks + progress computed over visible tasks; assignees see their tasks + all-visible; managers see their reports' instances |
| `GET /hr/me/tasks` | authenticate | tasks assigned to me across instances (drives "my onboarding duties" widget) |
| `POST /hr/process-tasks/:id/complete` / `/skip` `{notes?}` | assignee/hr/admin | skip requires notes; blocking tasks cannot be skipped except by hr with notes |
| `PATCH /hr/process-tasks/:id` `{assignee_user_id?, due_date?}` | processes:manage | reassign/reschedule |

## 5. Frontend (apps/hr)

- **HR views:** `app/onboarding/page.tsx` — instances table (employee, template, progress bar,
  overdue badge, started/due). Detail `app/onboarding/[id]` — task checklist grouped by
  status, each: title, assignee avatar (reassign via select for processes:manage), due date,
  blocking chip, staff-only chip (eye-off icon), kind widget (contract task links to the
  employee's contract tab; asset task links to assets), complete/skip buttons per
  permission. Template builder `app/settings/onboarding-templates` — CRUD + task list editor
  (mirrors form-builder interaction style from REC-01).
- **Onboardee view:** `app/onboarding/me` (auto-redirect target from dashboard banner while
  `employees.status='onboarding'`): welcome header, progress ring over VISIBLE tasks, own
  action cards ("Sign your contract", "Upload your ID" → document_upload kind uses MOD-05
  upload), read-only rows for others' visible tasks ("IT is preparing your laptop — in
  progress"). Never renders staff_only anything (server already filters — the client just
  renders).
- Uncomment/replace `components/sections/employee/on-boarding.tsx` with the new implementation
  or delete it in favor of the pages above (delete; note in PR).
- Notifications: task assigned / task overdue / instance completed via existing
  `hr_notifications` types (add enum values if missing — check `schema/hr/notification.ts` 16 types).

## 6. Tests to write FIRST

1. Instantiation: template match by employment_type; assignee resolution incl. null-manager
   fallback; due-date offsets; snapshot immunity (template edited after → instance unchanged).
2. Visibility: subject employee GET → staff_only absent, progress over visible only;
   HR GET → all; a random other employee → 403.
3. Completion rules: non-assignee non-hr complete → 403; blocking skip by assignee → 403,
   by hr with notes → ok; last blocking done → instance completed + employee active +
   notification emitted.
4. Kind hooks: contract_signing without ACTIVE contract → 422; leave_setup without balance → 422.
5. `GET /hr/me/tasks` returns exactly my open tasks across instances.
6. REC-05 integration: accept offer → instance exists with template tasks (runs with the
   REC-05 e2e); backfill script idempotent.
7. Frontend: onboardee page renders progress/cards from MSW; staff chip absent for onboardee
   fixtures; HR detail reassigns (mutation payload).
8. E2E: hire (REC-05 flow) → login as onboardee (invite path) → see checklist → complete own
   task → login as HR → complete remaining blocking → employee badge flips active.

## 7. Acceptance criteria

- [ ] Offer acceptance auto-creates the right template's instance with resolved assignees & due dates.
- [ ] Onboardee and HR demonstrably see different views of the same instance (e2e asserts both).
- [ ] Blocking-gate completion flips employee to active; leave/contract kinds enforce their side-conditions.
- [ ] Templates editable without affecting in-flight instances.
- [ ] All §6 green.

## 8. Edge cases

- Employee with no manager: instantiation succeeds, manager tasks fall to HR owner, response
  flags `unresolved_assignees` for the UI to surface.
- Cancelled hire mid-onboarding: `POST cancel` (add: processes:manage) → instance cancelled,
  employee → exited? NO — HR decides; cancel only stops the checklist (employee status handled
  via MOD-01 edit or LCM-02).
- Multiple active instances per employee: blocked (409) for same type.
- Overdue: nightly cron (existing notifications module) emits overdue notifications; no auto-escalation.

## 9. Out of scope

Offboarding specifics (LCM-02); e-signature; document templates; probation reviews (MOD-09 later).

## 10. Rollout

Deploy with one seeded "Default onboarding" template (seed script) so REC-05 hires never hit
a template-less state. Manual instantiation covers existing recent hires.
