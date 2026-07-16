# MOD-08: Helpdesk Finalization

> **Status:** Ready
> **Track:** B default
> **Depends on:** — (schema + v0.1 API exist)
> **Blocks:** MOD-04 report-issue hook, MOD-11
> **Branch:** `feat/mod-08-helpdesk`

## 1. Goal

Helpdesk becomes usable end-to-end: employees raise tickets (IT/HR/facilities categories),
staff triage with statuses/priorities/assignment, threaded comments, and notifications —
replacing ad-hoc email requests.

## 2. Context & current state

- Schema: `hr_helpdesk_tickets` (status, priority — backend/src/db/schema/hr/helpdesk.ts;
  audit exact columns) + notifications module has ticket-related types.
- Backend `/hr/helpdesk` v0.1; frontend has BOTH `app/help-desk/` and `app/helpdesk/` —
  consolidate to `app/helpdesk/`, delete the other.
- Services/hooks: `src/services/helpdesk.service.ts`, `src/hooks/useHelpdesk.ts` (path mismatches).

## 3. Schema changes (additive audit-gaps)

Likely needed (verify against existing table first):
`hr_helpdesk_comments(id, ticket_id FK cascade, author_user_id FK users, body text, created_at)`;
on tickets: `assignee_user_id FK users`, `category text` (IT|HR|FACILITIES|OTHER, CHECK),
`resolved_at`, `closed_at`, `source text default 'manual'` (MOD-04 sets 'asset_issue' +
`asset_id` nullable FK).

## 4. API

| Endpoint | Permission | Behavior |
|---|---|---|
| `POST /hr/helpdesk` `{title, body, category, priority?, asset_id?}` | helpdesk:create (everyone) | OPEN ticket; notify triage (hr/admin per category — IT category → admin-role users) |
| `GET /hr/me/helpdesk` | self | my tickets + statuses |
| `GET /hr/helpdesk?status&category&assignee&priority&page` | helpdesk:manage | triage list |
| `PATCH /hr/helpdesk/:id` `{status, priority, assignee_user_id, category}` | helpdesk:manage | transitions OPEN→IN_PROGRESS→RESOLVED→CLOSED (+ REOPENED from RESOLVED by requester within 14 days); RESOLVED sets resolved_at + notifies requester |
| `POST /hr/helpdesk/:id/comments` | requester or helpdesk:manage | comment + notify counterpart |
| `GET /hr/helpdesk/:id` | requester or helpdesk:manage | detail + thread |

## 5. Frontend

- Employee: raise-ticket dialog (from /me card + helpdesk page), my-tickets list with status
  chips, detail thread with reply box, reopen button on resolved.
- Staff `app/helpdesk`: triage table (filters, priority sort, unassigned highlight), detail
  with assign/status/priority controls + thread. Category → default assignee suggestion.
- Delete the duplicate route dir; fix service paths.

## 6. Tests to write FIRST

1. Status machine incl. requester reopen window (14d boundary).
2. Visibility: requester sees own only; manage sees all; third party 403.
3. Comment notifications to the right counterpart (mock notification service asserts).
4. MOD-04 hook: create with asset_id → source asset_issue, asset link in detail.
5. Frontend: raise flow, thread render, triage assign (MSW).
E2E: employee raises IT ticket → admin assigns + resolves → employee reopens with comment.

## 7. Acceptance criteria

- [ ] One helpdesk route dir; zero mocks; paths fixed.
- [ ] Full lifecycle with notifications in e2e.
- [ ] Asset "report issue" (MOD-04) lands as a linked ticket.
- [ ] Reopen window enforced.

## 8. Edge cases

- Ticket by an employee who then offboards: thread stays for staff; requester access ends (exited).
- Priority escalation is manual only (no SLA timers v1).
- Attachment support: reuse MOD-05 private upload if trivial, else out of scope note in PR.

## 9. Out of scope

SLA/escalation automation, canned responses, satisfaction surveys.

## 10. Rollout

Independent; announce categories to staff after triage roles agreed with HR.
