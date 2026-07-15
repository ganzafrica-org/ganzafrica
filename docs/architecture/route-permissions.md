# Route → Permission Mapping

Target middleware chain for every route group under `backend/src/routes/`. Applied incrementally:
FND-05 wires the non-HR admin/payroll routes to `requirePermission`; HR routes keep
`authenticateHr` until the FND-07 cutover. See `auth-and-rbac.md` for the permission catalog.

| Mount (`/api/…`)                                                                       | Auth                      | Permission                               | Status               |
| -------------------------------------------------------------------------------------- | ------------------------- | ---------------------------------------- | -------------------- |
| `/auth`                                                                                | public / self             | — (login, refresh, logout)               | done                 |
| `/payslips`                                                                            | public (token)            | — (signed token in path, rate-limited)   | done (FND-01)        |
| `/payroll`                                                                             | authenticate              | `payroll:manage`                         | **applied (FND-05)** |
| `/users`                                                                               | authenticate              | `employees:manage` (admin)               | FND-05 follow-up     |
| `/roles`                                                                               | authenticate              | admin only                               | FND-05 follow-up     |
| `/reports`                                                                             | authenticate              | `reports:read`                           | FND-05 follow-up     |
| `/opportunities`, `/applications`                                                      | mixed                     | public read / `recruitment:manage` write | REC-02               |
| `/projects`, `/tasks`, `/task-teams`                                                   | authenticate              | project/task perms (out of FND-05 scope) | later                |
| `/alumni`, `/mentorship`, `/achievements`, `/resources`, `/jobs`, `/events`            | mixed                     | `alumni:access` / public                 | later                |
| `/news`, `/faqs`, `/partners`, `/testimonials`, `/categories`, `/team-types`, `/teams` | public read / admin write | content admin                            | later                |
| `/contacts`, `/newsletter`                                                             | public                    | —                                        | —                    |
| `/uploads`                                                                             | authenticate              | per-feature                              | —                    |
| `/portal-data`, `/google-calendar`                                                     | authenticate              | —                                        | —                    |
| `/hr/*` (employees, assets, leave, document, policies, helpdesk, contracts)            | **`authenticateHr`**      | keeps hr enum guards                     | **FND-07**           |

## FND-05 scope

Only `/payroll` is switched to `requirePermission("payroll:manage")` in the schema-slice/full
FND-05 work (it's the highest-value, lowest-risk cutover and already had a real audience gate via
the internal app email allowlist). `/users`, `/roles`, `/reports` are the next non-HR routes to
convert; the HR router waits for FND-07 when `authenticateHr` is removed and every `/hr/*` route
gets `authenticate` + its `requirePermission`.

Rule (auth-and-rbac.md §7): new endpoints declare `requirePermission(...)` — never bare
`authenticate`. Ownership ("own row", "their reports") is enforced in services, not middleware.
