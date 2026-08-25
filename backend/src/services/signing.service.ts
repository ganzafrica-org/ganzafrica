/**
 * Document signing (DOC-signing). One engine for internal signers (employees via session) and
 * external signers (anyone via an emailed secure token). Signing captures a cryptographic audit
 * trail — the document hash + signer identity + timestamp + IP — which is the signature.
 */
import crypto from "crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { AppError } from "../middlewares";
import { env } from "../config";
import { users, roles, user_roles } from "../db/schema";
import {
  signature_templates,
  signature_template_fields,
  signature_requests,
  signature_events,
  type SignatureRequest,
} from "../db/schema/signing";
import { mintLink, consumeLink, peekLink, revokeLinks } from "./secure-links.service";
import { activateViaSignature } from "./hr/contract.service";
import { getPresignedDownload } from "./storage.service";

const DEFAULT_SIGN_TTL_DAYS = 30;
// Inline preview needs to outlast a quick glance — the signer may read the document before
// filling anything in. Mirrors document.service.ts's VIEW_URL_EXPIRY_SECONDS.
const DOCUMENT_VIEW_URL_EXPIRY_SECONDS = 60 * 15;

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// --- Templates ---

export async function createTemplate(
  input: { name: string; description?: string; file_key?: string | null },
  createdBy: number,
) {
  const [row] = await db
    .insert(signature_templates)
    .values({
      name: input.name,
      description: input.description ?? null,
      file_key: input.file_key ?? null,
      created_by: createdBy,
    })
    .returning();
  return row;
}

export async function listTemplates() {
  return db
    .select()
    .from(signature_templates)
    .where(eq(signature_templates.is_active, true))
    .orderBy(desc(signature_templates.id));
}

export async function getTemplate(templateId: number) {
  const [tpl] = await db
    .select()
    .from(signature_templates)
    .where(eq(signature_templates.id, templateId))
    .limit(1);
  if (!tpl) throw new AppError("Template not found", 404);
  const fields = await db
    .select()
    .from(signature_template_fields)
    .where(eq(signature_template_fields.template_id, templateId))
    .orderBy(signature_template_fields.sort_order, signature_template_fields.id);
  return { template: tpl, fields };
}

/**
 * Fields belonging to ONE signer's position in a multi-party sequence. `signer_index` (0-based,
 * set at template-authoring time — see addField) and `sequence_no` (1-based, a request's position
 * in the signer sequence) refer to the same slot, so `signer_index = sequence_no - 1`. Returning
 * the full unfiltered template field list to every signer let each party see — and be required to
 * fill in — the other party's fields in one form/one POST, which is what let one signature look
 * like it completed both.
 */
async function fieldsForSigner(templateId: number, sequenceNo: number) {
  return db
    .select()
    .from(signature_template_fields)
    .where(
      and(
        eq(signature_template_fields.template_id, templateId),
        eq(signature_template_fields.signer_index, sequenceNo - 1),
      ),
    )
    .orderBy(signature_template_fields.sort_order, signature_template_fields.id);
}

export async function addField(
  templateId: number,
  input: {
    key: string;
    label: string;
    type: string;
    required?: boolean;
    signer_index?: number;
    sort_order?: number;
  },
) {
  await getTemplate(templateId); // 404 guard
  const [row] = await db
    .insert(signature_template_fields)
    .values({
      template_id: templateId,
      key: input.key,
      label: input.label,
      type: input.type,
      required: input.required ?? true,
      signer_index: input.signer_index ?? 0,
      sort_order: input.sort_order ?? 0,
    })
    .returning();
  return row;
}

export async function removeField(fieldId: number) {
  await db.delete(signature_template_fields).where(eq(signature_template_fields.id, fieldId));
  return { deleted: true };
}

// --- Signing requests ---

export type CreateRequestInput = {
  template_id: number;
  subject: string;
  signer_type: "internal" | "external";
  signer_user_id?: number | null;
  signer_email?: string | null;
  signer_name?: string | null;
  ref_kind?: string | null;
  ref_id?: string | null;
  /** Position in a multi-signer sequence sharing (ref_kind, ref_id, template_id). Default 1. */
  sequence_no?: number;
  expires_at?: string | null;
};

export async function createRequest(
  input: CreateRequestInput,
  createdBy: number,
): Promise<SignatureRequest> {
  await getTemplate(input.template_id); // 404 guard

  if (input.signer_type === "internal") {
    if (!input.signer_user_id) throw new AppError("Internal signer requires signer_user_id", 422);
    const [u] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, input.signer_user_id))
      .limit(1);
    if (!u) throw new AppError("Signer user not found", 404);
    input.signer_email = input.signer_email ?? u.email;
    input.signer_name = input.signer_name ?? u.name;
  } else {
    if (!input.signer_email) throw new AppError("External signer requires signer_email", 422);
  }

  const [row] = await db
    .insert(signature_requests)
    .values({
      template_id: input.template_id,
      subject: input.subject,
      signer_type: input.signer_type,
      signer_user_id: input.signer_user_id ?? null,
      signer_email: input.signer_email ?? null,
      signer_name: input.signer_name ?? null,
      ref_kind: input.ref_kind ?? null,
      ref_id: input.ref_id ?? null,
      sequence_no: input.sequence_no ?? 1,
      created_by: createdBy,
    })
    .returning();
  return row;
}

export async function getTemplateByName(name: string) {
  const [tpl] = await db
    .select()
    .from(signature_templates)
    .where(and(eq(signature_templates.name, name), eq(signature_templates.is_active, true)))
    .limit(1);
  return tpl ?? null;
}

/**
 * Creates one signature_request per signer, in order, all sharing (ref_kind, ref_id,
 * template_id). Only the first is sent immediately; the rest stay 'draft' until their turn —
 * completeSequenceStep advances the chain as each signer finishes.
 */
export async function createSequentialRequests(
  input: {
    template_id: number;
    subject: string;
    ref_kind: string;
    ref_id: string;
    signerUserIds: number[];
  },
  createdBy: number,
): Promise<SignatureRequest[]> {
  if (input.signerUserIds.length === 0) {
    throw new AppError("At least one signer is required", 422);
  }

  const created: SignatureRequest[] = [];
  for (let i = 0; i < input.signerUserIds.length; i++) {
    const req = await createRequest(
      {
        template_id: input.template_id,
        subject: input.subject,
        signer_type: "internal",
        signer_user_id: input.signerUserIds[i],
        ref_kind: input.ref_kind,
        ref_id: input.ref_id,
        sequence_no: i + 1,
      },
      createdBy,
    );
    created.push(req);
  }

  await sendRequest(created[0].id);
  return created;
}

/** Every request sharing (ref_kind, ref_id, template_id), in sequence order, freshly read. */
async function getSequenceSiblings(
  refKind: string,
  refId: string,
  templateId: number,
): Promise<SignatureRequest[]> {
  return db
    .select()
    .from(signature_requests)
    .where(
      and(
        eq(signature_requests.ref_kind, refKind),
        eq(signature_requests.ref_id, refId),
        eq(signature_requests.template_id, templateId),
      ),
    )
    .orderBy(signature_requests.sequence_no);
}

/**
 * Internal-signer-only: called after a signature transaction commits (so this reads the
 * just-signed state fresh). Sends the next signer in the sequence if one is still draft, and —
 * once every signer in the sequence has signed — dispatches by ref_kind. Never called from the
 * external/token signing path (signExternal) — sequential multi-party signing is an
 * internal-signer feature for this ticket; external requests are always a lone signer
 * (sequence_no=1, no siblings), so this would be a no-op for them anyway, but the guardrail is
 * "don't touch that path" so it's simply never wired there.
 */
async function completeSequenceStep(requestId: number): Promise<void> {
  const signedReq = await getRequest(requestId);
  if (!signedReq.ref_kind || !signedReq.ref_id) return; // not part of a sequence

  const siblings = await getSequenceSiblings(
    signedReq.ref_kind,
    signedReq.ref_id,
    signedReq.template_id,
  );
  if (siblings.length <= 1) return; // not part of a sequence

  const nextDraft = siblings.find((s) => s.status === "draft");
  if (nextDraft) {
    await sendRequest(nextDraft.id);
    return;
  }

  const allSigned = siblings.every((s) => s.status === "signed");
  if (!allSigned) return; // someone declined/voided/expired — not a clean full execution

  if (signedReq.ref_kind === "contract") {
    // Deliberate cross-module call, not an event bus: this is the only place a contract's full
    // signature sequence completes, and the contract needs to know. See contract.service.ts's
    // activateViaSignature for why this bypasses the manual employment_agreement_url guard.
    await activateViaSignature(signedReq.ref_id, signedReq.signed_file_key);
  }
}

export interface SentRequest {
  request: SignatureRequest;
  /** For external signers: the raw token + link. Internal signers sign in-app, so link is null. */
  token: string | null;
  link: string | null;
}

/** Send a draft request. External → mint a sign_request token + link. Internal → just mark sent. */
export async function sendRequest(requestId: number): Promise<SentRequest> {
  const req = await getRequest(requestId);
  if (req.status !== "draft") throw new AppError("Only draft requests can be sent", 409);

  const expiresAt = req.expires_at ?? new Date(Date.now() + DEFAULT_SIGN_TTL_DAYS * 86400_000);
  let token: string | null = null;
  let link: string | null = null;

  if (req.signer_type === "external") {
    token = await mintLink("sign_request", req.id, expiresAt);
    link = `${env.WEBSITE_URL.replace(/\/$/, "")}/sign/${token}`;
  }

  const [updated] = await db
    .update(signature_requests)
    .set({ status: "sent", sent_at: new Date(), expires_at: expiresAt, updated_at: new Date() })
    .where(eq(signature_requests.id, requestId))
    .returning();
  return { request: updated, token, link };
}

export async function voidRequest(requestId: number) {
  const req = await getRequest(requestId);
  if (["signed", "voided"].includes(req.status))
    throw new AppError(`Cannot void a ${req.status} request`, 409);
  await revokeLinks("sign_request", requestId);
  const [updated] = await db
    .update(signature_requests)
    .set({ status: "voided", updated_at: new Date() })
    .where(eq(signature_requests.id, requestId))
    .returning();
  return updated;
}

export async function getRequest(requestId: number): Promise<SignatureRequest> {
  const [row] = await db
    .select()
    .from(signature_requests)
    .where(eq(signature_requests.id, requestId))
    .limit(1);
  if (!row) throw new AppError("Signature request not found", 404);
  return row;
}

// --- Signing (the act) ---

/** Compute the tamper-evident hash bound into the signature audit trail. */
function documentHash(
  templateFileKey: string | null,
  fieldValues: Record<string, unknown>,
): string {
  return crypto
    .createHash("sha256")
    .update(`${templateFileKey ?? ""}::${JSON.stringify(fieldValues)}`)
    .digest("hex");
}

async function completeSigning(
  tx: Tx,
  req: SignatureRequest,
  fieldValues: Record<string, unknown>,
  identity: string,
  ip?: string,
  userAgent?: string,
) {
  const { template } = await getTemplateTx(tx, req.template_id);
  const hash = documentHash(template.file_key, fieldValues);

  // The signed copy: reuse the base document (a real renderer would burn fields into a new PDF).
  const signedKey = template.file_key ? `${template.file_key}` : `signed/request-${req.id}.json`;

  await tx.insert(signature_events).values({
    request_id: req.id,
    event: "signed",
    field_values: fieldValues,
    document_hash: hash,
    signer_identity: identity,
    ip_address: ip ?? null,
    user_agent: userAgent ?? null,
  });
  await tx
    .update(signature_requests)
    .set({
      status: "signed",
      signed_file_key: signedKey,
      completed_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(signature_requests.id, req.id));
}

async function getTemplateTx(tx: Tx, templateId: number) {
  const [tpl] = await tx
    .select()
    .from(signature_templates)
    .where(eq(signature_templates.id, templateId))
    .limit(1);
  if (!tpl) throw new AppError("Template not found", 404);
  return { template: tpl };
}

/** Internal signer signs in-app (their session is the identity). */
export async function signInternal(
  requestId: number,
  userId: number,
  fieldValues: Record<string, unknown>,
  ctx: { ip?: string; userAgent?: string } = {},
): Promise<{ signed: true }> {
  await db.transaction(async (tx) => {
    const [req] = await tx
      .select()
      .from(signature_requests)
      .where(eq(signature_requests.id, requestId))
      .limit(1);
    if (!req) throw new AppError("Signature request not found", 404);
    if (req.signer_type !== "internal" || req.signer_user_id !== userId) {
      throw new AppError("Not your signature request", 403);
    }
    if (req.status !== "sent") throw new AppError(`Request is ${req.status}`, 409);
    await completeSigning(tx, req, fieldValues, `user:${userId}`, ctx.ip, ctx.userAgent);
  });
  // Outside the transaction — advancing the sequence reads the just-committed state.
  await completeSequenceStep(requestId);
  return { signed: true };
}

export type SignViewState = "valid" | "signed" | "expired" | "not_found";

/** External signer read path: token → request summary + fields (does not consume). */
export async function viewByToken(rawToken: string) {
  const peek = await peekLink("sign_request", rawToken);
  if (peek.state === "not_found") return { state: "not_found" as const };
  if (peek.state === "used") return { state: "signed" as const };
  if (peek.state === "expired" || peek.state === "revoked") return { state: "expired" as const };

  const req = await getRequest(peek.subjectId!);
  const fields = await fieldsForSigner(req.template_id, req.sequence_no);
  return {
    state: "valid" as const,
    request: { id: req.id, subject: req.subject, signer_name: req.signer_name },
    fields: fields.map((f) => ({ key: f.key, label: f.label, type: f.type, required: f.required })),
  };
}

/** External signer signs via token: atomic consume, then record the signature. */
export async function signExternal(
  rawToken: string,
  fieldValues: Record<string, unknown>,
  ctx: { ip?: string; userAgent?: string } = {},
): Promise<{ signed: boolean; state?: SignViewState }> {
  const consumed = await consumeLink("sign_request", rawToken);
  if (consumed.state !== "valid") {
    if (consumed.state === "used") return { signed: false, state: "signed" };
    if (consumed.state === "expired" || consumed.state === "revoked")
      return { signed: false, state: "expired" };
    return { signed: false, state: "not_found" };
  }
  return db.transaction(async (tx) => {
    const [req] = await tx
      .select()
      .from(signature_requests)
      .where(eq(signature_requests.id, consumed.subjectId!))
      .limit(1);
    if (!req) throw new AppError("Signature request not found", 404);
    await completeSigning(tx, req, fieldValues, `email:${req.signer_email}`, ctx.ip, ctx.userAgent);
    return { signed: true };
  });
}

// --- Signer's document access ---

/**
 * Requests addressed to a user (their "documents to sign" / signed history), each with the
 * template's fields so the in-app signer can render and complete them — mirrors the external
 * viewByToken read path.
 */
export async function listForSigner(userId: number) {
  const requests = await db
    .select()
    .from(signature_requests)
    .where(eq(signature_requests.signer_user_id, userId))
    .orderBy(desc(signature_requests.id));

  return Promise.all(
    requests.map(async (req) => {
      const fields = await fieldsForSigner(req.template_id, req.sequence_no);
      return {
        ...req,
        fields: fields.map((f) => ({
          key: f.key,
          label: f.label,
          type: f.type,
          required: f.required,
        })),
      };
    }),
  );
}

/**
 * The base document a request's template is signing — what the signer should read before filling
 * in fields. `file_key` is nullable (a fields-only template has no document to preview).
 */
async function requestDocumentUrl(templateId: number): Promise<string | null> {
  const [tpl] = await db
    .select({ file_key: signature_templates.file_key })
    .from(signature_templates)
    .where(eq(signature_templates.id, templateId))
    .limit(1);
  if (!tpl?.file_key) return null;
  return getPresignedDownload(tpl.file_key, DOCUMENT_VIEW_URL_EXPIRY_SECONDS);
}

/** Internal signer: the document behind one of their own requests (HR/admin may view any). */
export async function getRequestDocumentUrl(
  requestId: number,
  viewerUserId: number,
): Promise<{ url: string | null }> {
  const req = await getRequest(requestId);
  if (req.signer_user_id !== viewerUserId && !(await hasAnyRole(viewerUserId, ["hr", "admin"]))) {
    throw new AppError("You cannot view this document", 403);
  }
  return { url: await requestDocumentUrl(req.template_id) };
}

/** External signer: the document behind a token, without consuming it (mirrors viewByToken). */
export async function getTokenDocumentUrl(
  rawToken: string,
): Promise<{ state: SignViewState; url?: string | null }> {
  const peek = await peekLink("sign_request", rawToken);
  if (peek.state === "not_found") return { state: "not_found" };
  if (peek.state === "used") return { state: "signed" };
  if (peek.state === "expired" || peek.state === "revoked") return { state: "expired" };

  const req = await getRequest(peek.subjectId!);
  return { state: "valid", url: await requestDocumentUrl(req.template_id) };
}

/** The full audit trail for a request (HR / signer view). */
export async function getAuditTrail(requestId: number) {
  await getRequest(requestId);
  return db
    .select()
    .from(signature_events)
    .where(eq(signature_events.request_id, requestId))
    .orderBy(signature_events.created_at);
}

/**
 * The full signer sequence for a reference (e.g. a contract), in order — what
 * ContractSigningStatus renders as "whose turn" / fully executed. Ownership (self vs.
 * signing:manage) is the caller's job, same convention as employees-core.service.ts.
 */
export async function listByRef(refKind: string, refId: string) {
  const rows = await db
    .select()
    .from(signature_requests)
    .where(and(eq(signature_requests.ref_kind, refKind), eq(signature_requests.ref_id, refId)))
    .orderBy(signature_requests.template_id, signature_requests.sequence_no);
  if (!rows.length) return [];

  return rows.map((r) => ({
    id: r.id,
    sequence_no: r.sequence_no,
    signer_user_id: r.signer_user_id,
    signer_name: r.signer_name,
    status: r.status,
    completed_at: r.completed_at,
  }));
}

async function hasAnyRole(userId: number, names: string[]): Promise<boolean> {
  const rows = await db
    .select({ name: roles.name })
    .from(user_roles)
    .innerJoin(roles, eq(user_roles.role_id, roles.id))
    .where(eq(user_roles.user_id, userId));
  return rows.some((r) => names.includes(r.name));
}

/**
 * Ownership-checked read: HR/admin see any sequence; anyone else only their own (they're one of
 * the signers) — same "own row or manage" convention as employees-core.service.ts.
 */
export async function listByRefForViewer(viewerUserId: number, refKind: string, refId: string) {
  const sequence = await listByRef(refKind, refId);
  const isSigner = sequence.some((s) => s.signer_user_id === viewerUserId);
  if (!isSigner && !(await hasAnyRole(viewerUserId, ["hr", "admin"]))) {
    throw new AppError("You cannot view this signature sequence", 403);
  }
  return sequence;
}

export { documentHash };
