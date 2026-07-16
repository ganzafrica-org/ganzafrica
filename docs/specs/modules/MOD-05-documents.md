# MOD-05: Documents & Policies Finalization

> **Status:** Ready
> **Track:** B (ticket COLLEAGUE-02)
> **Depends on:** — (schema exists)
> **Blocks:** LCM-01 document_upload task kind, MOD-03 acknowledgements card
> **Branch:** `feat/mod-05-documents`

## 1. Goal

Documents and policies become complete: upload/version/categorize, per-document access
rules actually enforced, private storage with short-lived download links, policy publishing
with employee acknowledgement tracking ("read and understood"), and the employee-facing
"my documents / policies to acknowledge" slice.

## 2. Context & current state

- Schema: `hr_documents` (document_name, category, version, file_path, file_size, downloads,
  status PUBLISHED/DRAFT, `access jsonb` ACL, contract_id FK, created_by_id) and
  `hr_policies` (title, content, category, policy_category enum, version, file_path,
  downloads, is_active, status, created_by_id) — backend/src/db/schema/hr/{document,policy}.ts.
- Backend `/hr/document` (singular!) + `/hr/policies` routes exist v0.1 — audit vs §4.
  Path normalization to `/hr/documents` happens in FND-07; Track B: implement new endpoints
  under the CURRENT mount and add the plural alias early if trivial.
- Frontend: `app/documents/`, `app/settings/policies/` (+`[id]`) pages partially wired;
  services path mismatches.
- **Storage privacy bug to fix here:** uploads via `middlewares/upload.ts` default
  `acl: 'public-read'`. Employee documents (contracts, IDs) MUST be private: extract a
  `privateUpload` middleware variant (ACL private) and serve via 5-min presigned GET
  (reuse `generateSignedPayslipUrl` pattern — generalize into
  `services/storage.service.ts:getPresignedDownload(key, 300)`).

## 3. Schema changes

```ts
// hr_policy_acknowledgements — new
export const hr_policy_acknowledgements = pgTable("hr_policy_acknowledgements", {
  id: serial("id").primaryKey(),
  policy_id: /* FK hr_policies, cascade */,
  employee_id: /* uuid FK employees */,
  policy_version: integer("policy_version").notNull(), // ack is per version
  acknowledged_at: timestamp(..., { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({ uniq: uniqueIndex("policy_ack_once").on(t.policy_id, t.employee_id, t.policy_version) }));
```

`access jsonb` shape FROZEN here (type in `backend/src/types/hr.ts`):
`{ roles?: string[]; employee_ids?: string[]; departments?: string[] }` — a reader passes if
ANY clause matches (or access is null ⇒ hr/admin only). Documents tied to `contract_id` are
additionally always readable by that contract's employee.

## 4. API (audit existing, complete to this surface)

| Endpoint | Permission | Behavior |
|---|---|---|
| `GET /hr/documents?category&employee&search&page` | documents:manage OR filtered-to-accessible for others | list; non-managers get only rows their ACL admits |
| `POST /hr/documents` (multipart) | documents:manage | privateUpload; body: name, category, access, optional contract_id/employee link |
| `PATCH /hr/documents/:id` | documents:manage | metadata + access edits; new file ⇒ version+1 (old key kept — simple version history array or rows? keep columns: previous versions recorded in a `versions jsonb` append [key, version, uploaded_at]) |
| `GET /hr/documents/:id/download` | ACL check | presigned 302 (like FND-01) + increments downloads |
| `DELETE /hr/documents/:id` | documents:manage | soft: status→ARCHIVED (add enum value) — hard delete never (audit) |
| `GET /hr/me/documents` | authenticate | ACL-admitted + own-contract docs (MOD-03) |
| Policies: CRUD `/hr/policies` | policies:manage | publish flow: DRAFT→PUBLISHED bumps version, resets is_active on predecessor |
| `GET /hr/policies?active` | policies:read (everyone) | published list + my-ack status |
| `POST /hr/policies/:id/acknowledge` | authenticate | insert ack for current version; repeat → 200 idempotent |
| `GET /hr/policies/:id/acknowledgements` | policies:manage | who acked which version, who's missing (LEFT JOIN active employees) |

## 5. Frontend

- `app/documents/page.tsx`: table (name, category, version, size, downloads, access summary
  chips), upload sheet (file + metadata + access builder: roles multi-select, employee
  search multi, departments multi), row actions download/edit/archive. Non-manage users see
  their filtered list (same page, fewer affordances).
- Policies (`app/settings/policies` for manage; `app/policies` employee-facing list):
  policy editor (existing rich text/content field), publish w/ confirm ("re-acknowledgement
  will be required"), ack tracking table (per version, missing-list exportable CSV via
  client-side download). Employee view: policy reader page with a sticky
  "I have read and understood" button → ack; badge Acknowledged/Required per row.
- MOD-03 hooks: pending-acknowledgements count = active published policies minus my acks
  (server computes in /hr/me/summary — provide the query here as
  `policyService.pendingAckCount(employeeId)`).

## 6. Tests to write FIRST

Backend:
1. ACL matrix: role clause / employee_ids clause / departments clause / null-ACL(hr only) /
   contract-owner override — table-driven read attempts (200 vs 403), list filtering matches.
2. Download: presigned 302, `X-Amz-Expires=300`, downloads incremented; private ACL on
   upload verified (mock S3 asserts ACL param).
3. Versioning: new file bumps version, old key preserved in versions history.
4. Policy publish resets predecessor; ack is version-scoped (ack v1, publish v2 → pending again).
5. Ack idempotency + acknowledgements report includes missing employees.
6. Soft delete hides from lists but keys remain (audit).
Frontend:
7. Access builder produces the frozen ACL shape; upload flow (MSW multipart).
8. Employee policy reader: ack button flow, badge flips.
E2E: HR uploads a private doc ACL'd to fellows → fellow downloads it, staff can't see it →
HR publishes policy v2 → fellow re-acknowledges; report shows complete.

## 7. Acceptance criteria

- [ ] Employee documents stored PRIVATE; every download via expiring links (no public URLs in DB for new uploads).
- [ ] ACL enforcement server-side proven by the matrix test.
- [ ] Policy acknowledgement per-version works end-to-end with the missing report.
- [ ] Mock data gone; paths fixed.
- [ ] LCM-01 `document_upload` kind has its endpoint contract (upload + link to task via link_ref) noted and working.

## 8. Edge cases

- Legacy public files uploaded before this spec: one-off script lists hr_documents keys with
  public ACL for HR review (flip to private + re-link) — include script, run supervised.
- Huge files: keep middleware limit (verify, likely 10–20MB) with clear 422.
- Ack from someone hired after policy publish: they're "missing" — correct (must ack).
- Departed employees excluded from missing lists (status exited).

## 9. Out of scope

Full document e-signing, folder trees, OCR/search-in-file, retention policies.

## 10. Rollout

Independent. Run the legacy-ACL review script before announcing to HR.
