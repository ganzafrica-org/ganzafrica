# GanzAfrica Platform — Plans, Specs & Tickets

Everything needed to take the monorepo from its current state to: one identity/SSO, a full
HR suite (Deel replacement), a working recruitment→onboarding pipeline, clean migrations,
aligned dependency versions, and containerized CI/CD deploys.

- **Specs** (`specs/`) are implementation-ready: schemas, endpoints, UI, tests-first lists,
  acceptance criteria. An agent implements a spec without making design decisions.
- **Tickets** (`tickets/`) are slices cut from specs at assignment time.
- **Architecture docs** (`architecture/`) are the shared target-state source of truth.
- Work happens on `feat/<id>-<slug>` branches off `dev`. Never commit to `dev` directly.
- Templates: [SPEC_TEMPLATE](templates/SPEC_TEMPLATE.md) · [TICKET_TEMPLATE](templates/TICKET_TEMPLATE.md)

## Architecture

| Doc                                                           | Contents                                                  |
| ------------------------------------------------------------- | --------------------------------------------------------- |
| [auth-and-rbac.md](architecture/auth-and-rbac.md)             | Roles, permission catalog, alumni rule, app access matrix |
| [sso-flow.md](architecture/sso-flow.md)                       | Handoff-code flow, cookie matrix dev/prod, rollout order  |
| [deployment.md](architecture/deployment.md)                   | Docker/GHCR/Actions topology, droplet runbook, rollback   |
| [database-migrations.md](architecture/database-migrations.md) | Drizzle workflow, forbidden practices                     |
| [testing-strategy.md](architecture/testing-strategy.md)       | TDD conventions, tools, CI gates                          |

## Implementation order — waves & parallel tracks

Dependencies: FND-02 blocks every schema change · FND-03/04 precede risky refactors ·
the `employees` schema slice (in FND-05) unblocks MOD-01/02/06 and LCM-01 ·
FND-05→06→07 in order · REC-01→02→(03,04)→05 · REC-05 blocks LCM-01 · LCM-01 blocks LCM-02 ·
MOD-11 last of the modules · MOD-12 deferred.

| Wave | Track A (default: user)                                 | Track B (default: colleague)           |
| ---- | ------------------------------------------------------- | -------------------------------------- |
| 0    | FND-03 → FND-04 → FND-02                                | (reads specs; current work)            |
| 1    | FND-01 (ship) · employees schema slice of FND-05        | MOD-04 assets · MOD-05 documents       |
| 2    | FND-05 → FND-06 → FND-07                                | MOD-01 employees → MOD-02 org chart    |
| 3    | REC-01 → REC-02 → REC-03 / REC-04                       | MOD-03 self-service · MOD-06 leave     |
| 4    | REC-05 → LCM-01 → LCM-02                                | MOD-08 helpdesk · MOD-07 payroll-in-hr |
| 5    | FND-08 · FND-09 · FND-10 (interleaved from wave 2)      | MOD-09 performance · MOD-10 events     |
| 6    | MOD-11 dashboard (whoever is free) · delete `_archived` | MOD-12 attendance (deferred)           |

Assignments are defaults, not contracts — whoever frees up first takes the next unblocked spec.

## Spec index & status

### Foundations

| ID     | Spec                                                                                    | Depends on     | Status |
| ------ | --------------------------------------------------------------------------------------- | -------------- | ------ |
| FND-01 | [Payslip access tokens](specs/foundations/FND-01-payslip-access-tokens.md)              | FND-02         | Ready  |
| FND-02 | [Drizzle re-baseline](specs/foundations/FND-02-drizzle-rebaseline.md)                   | —              | Ready  |
| FND-03 | [Monorepo phase-0 foundations](specs/foundations/FND-03-monorepo-phase0-foundations.md) | —              | Ready  |
| FND-04 | [CI + test infrastructure](specs/foundations/FND-04-ci-and-test-infrastructure.md)      | FND-03         | Ready  |
| FND-05 | [Auth consolidation + RBAC](specs/foundations/FND-05-auth-consolidation-rbac.md)        | FND-02, FND-04 | Ready  |
| FND-06 | [SSO handoff + cookies](specs/foundations/FND-06-sso-handoff-and-cookies.md)            | FND-05         | Ready  |
| FND-07 | [HR joins SSO + hr_users retirement](specs/foundations/FND-07-hr-sso-join.md)           | FND-06         | Ready  |
| FND-08 | [Docker CD + droplet](specs/foundations/FND-08-docker-cd-droplet.md)                    | FND-04, FND-10 | Ready  |
| FND-09 | [Version alignment waves](specs/foundations/FND-09-version-alignment-waves.md)          | FND-04         | Ready  |
| FND-10 | [Backend build modernization](specs/foundations/FND-10-backend-build-modernization.md)  | FND-03         | Ready  |

### Recruitment

| ID     | Spec                                                                                         | Depends on     | Status |
| ------ | -------------------------------------------------------------------------------------------- | -------------- | ------ |
| REC-01 | [Form builder + eligibility rules](specs/recruitment/REC-01-form-builder-and-eligibility.md) | FND-02         | Ready  |
| REC-02 | [Pipeline backend](specs/recruitment/REC-02-pipeline-backend.md)                             | REC-01, FND-05 | Ready  |
| REC-03 | [Recruitment HR UI](specs/recruitment/REC-03-recruitment-hr-ui.md)                           | REC-02         | Ready  |
| REC-04 | [Funnel analytics](specs/recruitment/REC-04-funnel-analytics.md)                             | REC-01         | Ready  |
| REC-05 | [Offers + hire conversion](specs/recruitment/REC-05-offers-and-hire-conversion.md)           | REC-02, FND-05 | Ready  |

### Lifecycle

| ID     | Spec                                                                          | Depends on     | Status |
| ------ | ----------------------------------------------------------------------------- | -------------- | ------ |
| LCM-01 | [Onboarding](specs/lifecycle/LCM-01-onboarding.md)                            | REC-05, FND-05 | Ready  |
| LCM-02 | [Offboarding + alumni rule](specs/lifecycle/LCM-02-offboarding-and-alumni.md) | LCM-01         | Ready  |

### Modules (HR suite — parity+ with the `_archived` demo)

| ID     | Spec                                                                               | Depends on                | Status   |
| ------ | ---------------------------------------------------------------------------------- | ------------------------- | -------- |
| MOD-01 | [Employees core](specs/modules/MOD-01-employees-core.md)                           | FND-05 schema slice       | Ready    |
| MOD-02 | [Org hierarchy + chart](specs/modules/MOD-02-org-hierarchy-and-chart.md)           | MOD-01                    | Ready    |
| MOD-03 | [Employee self-service views](specs/modules/MOD-03-employee-self-service-views.md) | MOD-01, FND-05            | Ready    |
| MOD-04 | [Assets](specs/modules/MOD-04-assets.md)                                           | —                         | Ready    |
| MOD-05 | [Documents](specs/modules/MOD-05-documents.md)                                     | —                         | Ready    |
| MOD-06 | [Leave](specs/modules/MOD-06-leave.md)                                             | MOD-02                    | Ready    |
| MOD-07 | [Payroll in HR app](specs/modules/MOD-07-payroll-in-hr.md)                         | FND-07, FND-01            | Ready    |
| MOD-08 | [Helpdesk](specs/modules/MOD-08-helpdesk.md)                                       | —                         | Ready    |
| MOD-09 | [Performance + feedback](specs/modules/MOD-09-performance-and-feedback.md)         | MOD-02                    | Ready    |
| MOD-10 | [Events](specs/modules/MOD-10-events.md)                                           | FND-05                    | Ready    |
| MOD-11 | [Dashboard](specs/modules/MOD-11-dashboard.md)                                     | MOD-01..09 (data sources) | Ready    |
| MOD-12 | [Attendance](specs/modules/MOD-12-attendance.md)                                   | MOD-01                    | DEFERRED |

### Tickets (first batch — Track B)

| ID           | Ticket                                                         | From spec |
| ------------ | -------------------------------------------------------------- | --------- |
| COLLEAGUE-01 | [Assets finalization](tickets/COLLEAGUE-01-assets.md)          | MOD-04    |
| COLLEAGUE-02 | [Documents finalization](tickets/COLLEAGUE-02-documents.md)    | MOD-05    |
| COLLEAGUE-03 | [Employees core](tickets/COLLEAGUE-03-employees-core.md)       | MOD-01    |
| COLLEAGUE-04 | [Org hierarchy + chart](tickets/COLLEAGUE-04-org-hierarchy.md) | MOD-02    |

## Cross-cutting guardrails

- Public application flow: additive-only schema changes; characterization test before REC work;
  screening rules run post-insert and can never fail a submission; eligibility rules are
  server-authoritative.
- `payrolls` stays keyed to `users` — never rekeyed (pay history). Service rule: payroll
  target must have an `employees` row going forward.
- Auth cutover day (FND-07): one middleware import per HR route file changes — coordinate
  the swap with Track B; merge freeze on `backend/src/routes/hr/**` that day.
- Committed `.env` secrets are burned — rotation checklist in FND-03 §7; JWT secret rotates
  with the FND-06 cutover.
- All UI work uses `@workspace/ui` for NEW components; local shadcn copies migrate on touch
  (FND-09 §5).
