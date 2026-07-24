# REC-01: Application Form Builder + Pre-Submission Eligibility Rules

> **Status:** Ready
> **Track:** A
> **Depends on:** FND-02
> **Blocks:** REC-02, REC-04
> **Branch:** `feat/rec-01-form-eligibility`

## 1. Goal

HR composes an application form per opportunity (standard fields always present + custom
fields), and defines **eligibility rules evaluated BEFORE submission**: an applicant who
fails one gets an immediate on-screen outcome and **no application row is ever created** —
no wasted candidate time, no wasted HR screening. Rule hits are counted (anonymized) for
funnel analytics.

## 2. Context & current state

- `backend/src/db/schema/opportunities.ts`: `opportunities` already has
  `eligibility_criteria jsonb` (loose, unenforced — lines 36–42) and `custom_questions jsonb`
  (lines 45–53). `applications` has fixed columns (first_name … data_processing_consent,
  `custom_answers jsonb`, `educationLevelEnum education_level`).
- Public form lives in apps/web (application pages) + archived richer version
  `apps/_archived/apply/[jobId]/page.tsx`. Portal has application views under
  `apps/portal/app/(main)/applications/`, `opportunities/`.
- **Guardrail:** the live public submission (`POST` via `routes/application`/`routes/opportunity` —
  read both to find the exact handler) must keep working for opportunities that predate this
  spec. Write the characterization test FIRST (README guardrails).

## 3. Schema changes (additive only)

```ts
// backend/src/db/schema/recruitment/forms.ts
export const opportunity_forms = pgTable(
  "opportunity_forms",
  {
    id: serial("id").primaryKey(),
    opportunity_id: integer("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    version: integer("version").notNull().default(1), // bump on publish; applications pin the version
    status: text("status").notNull().default("draft"), // 'draft' | 'published' | 'archived'
    definition: jsonb("definition").$type<FormDefinition>().notNull(),
    created_by: integer("created_by")
      .notNull()
      .references(() => users.id),
    ...timestampFields,
  },
  (t) => ({
    oppVersionIdx: uniqueIndex("opportunity_forms_opp_version").on(t.opportunity_id, t.version),
  }),
);

export const eligibility_rules = pgTable("eligibility_rules", {
  id: serial("id").primaryKey(),
  opportunity_id: integer("opportunity_id")
    .notNull()
    .references(() => opportunities.id, { onDelete: "cascade" }),
  field_key: text("field_key").notNull(), // standard field name or custom field key
  operator: text("operator").notNull(), // 'eq'|'neq'|'gt'|'gte'|'lt'|'lte'|'in'|'not_in'|'contains'|'is_true'|'is_false'
  value: jsonb("value"), // comparison operand (null for is_true/is_false)
  // derived-field support: 'age' is computed from date_of_birth at evaluation time
  reject_message: text("reject_message").notNull(), // shown to the applicant, e.g. "This role requires a valid work permit for Rwanda."
  is_active: boolean("is_active").notNull().default(true),
  sort_order: integer("sort_order").notNull().default(0),
  hit_count: integer("hit_count").notNull().default(0), // anonymized counter (funnel)
  ...timestampFields,
});
```

Also (same migration): `ALTER TABLE applications ADD COLUMN form_version integer;`
`ADD COLUMN date_of_birth date; ADD COLUMN country_of_residence text; ADD COLUMN
country_of_work text; ADD COLUMN has_work_permit boolean;` — nullable (old rows), the new
form always fills them.

`FormDefinition` type (in `backend/src/types/recruitment.ts`, shared to frontend via the
API):

```ts
type FormField = {
  key: string; // unique within form, snake_case
  label: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "multiselect"
    | "number"
    | "date"
    | "file"
    | "boolean"
    | "country";
  required: boolean;
  options?: string[]; // select/multiselect
  max_length?: number;
  order: number;
  section: string; // grouping header on the form
};
type FormDefinition = {
  standard: {
    // rendered first, ALWAYS present, not removable in the builder
    // fixed keys: first_name, last_name, email, phone, date_of_birth,
    // country_of_residence, country_of_work,
    // has_work_permit (conditional: shown iff residence != work)
  };
  custom: FormField[];
};
```

Standard-field keys usable in rules: `age` (derived), `country_of_residence`,
`country_of_work`, `has_work_permit`, plus any custom field key (e.g. `degree`).

## 4. API

Rule engine `backend/src/services/recruitment/eligibility.service.ts`:

- `evaluate(rules, answers): { eligible: true } | { eligible: false, failed: {field_key, reject_message}[] }`
  — pure function; `age` derived from `date_of_birth` (UTC, floor of year diff); missing
  value for a rule's field = NOT a failure at check time (checked only when the field has a
  value client-side; at final submit all required fields exist so all rules evaluate);
  unknown operator/malformed rule → log + skip (a broken rule must never block OR auto-fail anyone).
- `recordHits(ruleIds)` — single SQL `UPDATE ... SET hit_count = hit_count + 1 WHERE id IN (...)`.

| Endpoint                                            | Auth                                    | Behavior                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /opportunities/:id/form`                       | public                                  | Latest PUBLISHED form definition + the ACTIVE rules' `{field_key, operator, value}` (client pre-check needs them; reject_messages included). 404 if none published                                                                                                                                             |
| `POST /opportunities/:id/eligibility-check`         | public, rate-limited 20/min/IP          | Body `{answers: Record<string,unknown>}` → runs `evaluate` server-side; if fail: `recordHits`, `200 {eligible:false, failed:[...]}`; if pass `200 {eligible:true}`. **No application row either way.**                                                                                                         |
| `POST /opportunities/:id/apply`                     | public (existing handler, extended)     | NEW pre-insert step: run `evaluate` with full answers; fail → `422 {eligible:false, failed}` + recordHits (defense in depth — the UI already stopped them). Pass → existing insert + `form_version` + new standard columns. Old opportunities without forms/rules: skip both, existing behavior byte-identical |
| `GET/PUT /hr/opportunities/:id/form`                | requirePermission("recruitment:manage") | Read/write DRAFT definition; `PUT /hr/opportunities/:id/form/publish` → bump version, status published, archive predecessor                                                                                                                                                                                    |
| `GET/POST/PATCH/DELETE /hr/opportunities/:id/rules` | recruitment:manage                      | Rule CRUD; PATCH toggles is_active; DELETE only when hit_count=0 else deactivate                                                                                                                                                                                                                               |

## 5. Frontend

**Public form (apps/web** — new dynamic form renderer replacing/augmenting the current apply
page; harvest layout from `apps/_archived/apply/[jobId]/page.tsx`):

- Renders standard section then custom sections by `order`; `has_work_permit` appears with
  animation when residence ≠ work country.
- **Live eligibility UX:** on blur/change of any rule-referenced field, evaluate CLIENT-side
  (same pure logic, shipped rules); on failure show an inline blocking panel: the
  `reject_message`, "You can still review your answers." — Continue/Submit disabled. On final
  submit, call `eligibility-check` first (server truth), then `apply`.
- File fields upload via the existing public upload route (CV pattern — `cv_url` flow).
- States: loading skeleton, deadline-passed (from `application_deadline`), submit success
  page with application reference, server-422 rendering identical to client-side rejection.

**Form builder (apps/hr** — `app/employees/recruitment/` area, detailed UI in REC-03; this
spec delivers the builder component itself):
`components/recruitment/form-builder.tsx` — section list, add/edit/reorder custom fields
(drag via existing dnd lib in hr app if present, else simple up/down buttons), standard
fields shown locked, rule editor table (field dropdown = standard rule keys + custom keys,
operator dropdown, value input typed by field type, reject message, active toggle), publish
button with version confirm dialog.

## 6. Tests to write FIRST

Backend:

1. **Characterization (FIRST OF ALL):** existing public apply POST for a pre-spec opportunity —
   snapshot request/response/row; must pass unchanged at the end.
2. `evaluate()` unit table: every operator; age derivation (boundary: birthday today);
   permit rule fires only when countries differ (rule value semantics); malformed rule skipped.
3. eligibility-check: failing answers → 200 eligible:false + hit_count incremented once per
   failing rule; passing → eligible:true, no counters.
4. apply with failing answers → 422, **no applications row** (count unchanged).
5. apply with passing answers → row has form_version + standard columns.
6. Form versioning: publish v2 → GET returns v2; in-flight application submitted against v1
   still accepted (form_version recorded as submitted).
7. Rule CRUD permissions: anonymous 401, staff 403, hr 200.
   Frontend (web, vitest+MSW): renderer shows conditional permit field; failing blur shows the
   panel and disables submit; 422 from server renders the same panel.
   E2E: full public apply happy path; instant-reject path (age rule) — panel appears, no
   application created (assert via seeded admin API).

## 7. Acceptance criteria

- [ ] HR publishes a form with an `age > 30 → reject` and a `has_work_permit is_false → reject` rule; a failing applicant is blocked in-browser AND server-side; counters increment; no row exists.
- [ ] Old opportunities keep the legacy fixed form untouched (characterization green).
- [ ] Rules with hits cannot be hard-deleted.
- [ ] Reject panel copy comes from `reject_message` verbatim.
- [ ] All §6 green.

## 8. Edge cases

- Applicant changes answers after a pass then submits — server re-checks at apply (always authoritative).
- Timezone: DOB is a date; age uses UTC date math only.
- Two published forms racing: publish is transactional (archive old + insert new); GET takes max(version) where published.
- Rules referencing a deleted custom field: builder blocks field deletion while an active rule references it.
- Screen readers: reject panel gets `role="alert"`.

## 9. Out of scope

Pipeline stages/post-submission screening (REC-02 — same engine, different trigger); funnel
view/start/submit events (REC-04); HR pipeline UI (REC-03).

## 10. Rollout

Deploy backend first (inert until a form is published). Pilot on one real opportunity with
HR watching counters before making the builder the default posting path.
