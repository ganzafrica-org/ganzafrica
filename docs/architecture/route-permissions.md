# Route → Permission Mapping

Target middleware chain for every route group under `backend/src/routes/`. Applied incrementally:
FND-05 wires the non-HR admin/payroll routes to `requirePermission`; HR routes keep
`authenticateHr` until the FND-07 cutover. See `auth-and-rbac.md` for the permission catalog.

| Mount (`/api/…`)                                                                       | Auth                      | Permission                                                 | Status               |
| -------------------------------------------------------------------------------------- | ------------------------- | ---------------------------------------------------------- | -------------------- |
| `/auth`                                                                                | public / self             | — (login, refresh, logout)                                 | done                 |
| `/payslips`                                                                            | public (token)            | — (signed token in path, rate-limited)                     | done (FND-01)        |
| `/payroll`                                                                             | authenticate              | `payroll:manage`                                           | **applied (FND-05)** |
| `/users`                                                                               | authenticate              | `employees:manage` (admin)                                 | FND-05 follow-up     |
| `/roles`                                                                               | authenticate              | admin only                                                 | FND-05 follow-up     |
| `/reports`                                                                             | authenticate              | `reports:read`                                             | FND-05 follow-up     |
| `/opportunities`, `/applications`                                                      | mixed                     | public read / `recruitment:manage` write                   | REC-02               |
| `/projects`, `/tasks`, `/task-teams`                                                   | authenticate              | project/task perms (out of FND-05 scope)                   | later                |
| `/alumni`, `/mentorship`, `/achievements`, `/resources`, `/jobs`, `/events`            | mixed                     | `alumni:access` / public                                   | later                |
| `/news`, `/faqs`, `/partners`, `/testimonials`, `/categories`, `/team-types`, `/teams` | public read / admin write | content admin                                              | later                |
| `/contacts`, `/newsletter`                                                             | public                    | —                                                          | —                    |
| `/uploads`                                                                             | authenticate              | per-feature                                                | —                    |
| `/portal-data`, `/google-calendar`                                                     | authenticate              | —                                                          | —                    |
| `/hr/employees` (+ nested contracts)                                                   | authenticate              | `employees:manage` (+ `employees_self:read` on /me)        | **done (FND-07)**    |
| `/hr/assets`                                                                           | authenticate              | `assets:read` / `assets:manage`                            | **done (FND-07)**    |
| `/hr/leaves` (308 alias `/hr/leave`, except the MOD-06 paths below)                    | authenticate              | `leave:manage` / `leave:approve` / `leave_self:request`    | **done (FND-07)**    |
| `/hr/me/leave` (+ `/validate`)                                                         | authenticate              | `leave_self:request` to create; read is self-scoped        | **done (MOD-06)**    |
| `/hr/leave/pending-approvals`, `/hr/leave/:id/{approve,reject,cancel}`                 | authenticate              | none — manager-chain or `leave:manage`, checked in service | **done (MOD-06)**    |
| `/hr/leave/calendar`                                                                   | authenticate              | none — scoped to own team, org-wide for `leave:manage`     | **done (MOD-06)**    |
| `/hr/leave-policies`, `/hr/holidays`, `/hr/leave-balances/:id`                         | authenticate              | `leave:manage` (holidays readable by any employee)         | **done (MOD-06)**    |
| `/hr/me/process`, `/hr/me/tasks`                                                       | authenticate              | none — scoped to the caller's own employee row             | **done (LCM-01)**    |
| `/hr/processes/:id`                                                                    | authenticate              | none — subject/assignee/manager/HR, filtered in service    | **done (LCM-01)**    |
| `/hr/process-tasks/:id/{complete,skip}`                                                | authenticate              | none — assignee or HR, checked in service                  | **done (LCM-01)**    |
| `/hr/processes`, `/hr/employees/:id/processes`, `/hr/process-templates`                | authenticate              | `processes:manage`                                         | **done (LCM-01)**    |
| `/hr/documents` (308 alias `/hr/document`)                                             | authenticate              | `documents:manage`                                         | **done (FND-07)**    |
| `/hr/policies`                                                                         | authenticate              | `policies:read` / `policies:manage`                        | **done (FND-07)**    |
| `/hr/helpdesk`                                                                         | authenticate              | `helpdesk:create` / `helpdesk:manage`                      | **done (FND-07)**    |

## FND-05 scope

Only `/payroll` is switched to `requirePermission("payroll:manage")` in the schema-slice/full
FND-05 work (it's the highest-value, lowest-risk cutover and already had a real audience gate via
the internal app email allowlist). `/users`, `/roles`, `/reports` are the next non-HR routes to
convert; the HR router waits for FND-07 when `authenticateHr` is removed and every `/hr/*` route
gets `authenticate` + its `requirePermission`.

Rule (auth-and-rbac.md §7): new endpoints declare `requirePermission(...)` — never bare
`authenticate`. Ownership ("own row", "their reports") is enforced in services, not middleware.
