# COLLEAGUE-02: Documents & Policies Finalization

> **Spec:** [MOD-05-documents](../specs/modules/MOD-05-documents.md) — read fully first.
> **Depends on:** FND-02 (for your migration). Start backend audit/UI immediately.
> **Branch:** `feat/mod-05-documents` off `dev`
> **Estimated size:** L

## What you are building

Documents and policies to completion: enforced per-document access rules (the `access`
jsonb becomes real), PRIVATE storage for employee documents with 5-minute presigned
downloads (fixing a real privacy bug — uploads are currently public-read), document
versioning, policy publish + per-version employee acknowledgements ("read and understood"),
and the employee-facing filtered lists.

## Where things are

- Schema: `backend/src/db/schema/hr/document.ts`, `hr/policy.ts` (exist);
  new `hr_policy_acknowledgements` table — definition in MOD-05 §3.
- ACL shape is FROZEN in MOD-05 §3: `{roles?, employee_ids?, departments?}`, any-clause-match,
  null = hr/admin only, contract-linked docs always readable by that employee. Put the type
  in `backend/src/types/hr.ts`.
- **Privacy fix**: `backend/src/middlewares/upload.ts` line ~95 uses `acl: 'public-read'` —
  extract a `privateUpload` variant (ACL private) for documents; downloads go through a new
  `services/storage.service.ts:getPresignedDownload(key, 300)` (copy the presign pattern from
  `services/hr/pdf.service.ts:554`, but with the 5-min expiry).
- Existing v0.1 routes: `/hr/document` (singular) — keep the mount, add missing endpoints;
  plural rename happens centrally in FND-07.
- Frontend: `apps/hr/src/app/documents/`, `app/settings/policies/` (+`[id]`), services/hooks.

## Steps

1. Migration: `hr_policy_acknowledgements` (MOD-05 §3) via the new drizzle workflow.
2. Storage: `privateUpload` middleware + `getPresignedDownload` service; new document
   uploads → private; `GET /hr/documents/:id/download` → ACL check → 302 presigned +
   `downloads` increment.
3. ACL enforcement: one `canReadDocument(userOrEmployee, doc)` service function used by
   BOTH the list filter and the download check — single source of truth.
4. Versioning: PATCH with a new file bumps `version`, appends the old key to the
   `versions` jsonb history (MOD-05 §4).
5. Policies: publish flow (DRAFT→PUBLISHED bumps version, deactivates predecessor),
   acknowledge endpoint (idempotent, per-version), acknowledgements report (who's missing —
   LEFT JOIN active employees).
6. Tests FIRST per MOD-05 §6 (the ACL matrix test #1 is the heart of the ticket — table-driven).
7. Frontend: documents table + upload sheet with the access builder (roles/employees/
   departments multi-selects producing exactly the frozen ACL shape); policy editor +
   publish confirm + ack tracking table; employee policy reader with the sticky acknowledge
   button; delete mocks; fix paths.
8. One-off script listing pre-existing public-ACL document keys for HR review (MOD-05 §8) —
   include it, don't run against prod without the user.

## Tests to write first

MOD-05 §6 items 1–8. Mock S3 must assert the `ACL: "private"` param on uploads (test 2).

## Acceptance criteria

MOD-05 §7 — all five boxes. Plus: PR includes the ACL matrix test output and screenshots of
the access builder + ack tracking.

## Coordination warnings

- LCM-01's `document_upload` onboarding task will call your upload + link via `link_ref` —
  keep the upload endpoint contract per spec §4.
- MOD-03 consumes `policyService.pendingAckCount(employeeId)` — export it with that exact name.
- FND-07 renames `/hr/document`→`/hr/documents` centrally — don't rename yourself.
