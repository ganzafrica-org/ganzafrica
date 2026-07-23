/**
 * Document signing (DOC-signing). One engine for internal signers (employees via session) and
 * external signers (anyone via an emailed secure token). Signing captures a cryptographic audit
 * trail — the document hash + signer identity + timestamp + IP — which is the signature.
 */
import crypto from "crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { AppError } from "../middlewares";
import { env } from "../config";
import { users } from "../db/schema";
import {
  signature_templates,
  signature_template_fields,
  signature_requests,
  signature_events,
  type SignatureRequest,
} from "../db/schema/signing";
import { mintLink, consumeLink, peekLink, revokeLinks } from "./secure-links.service";

const DEFAULT_SIGN_TTL_DAYS = 30;

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
  ref_id?: number | null;
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
      created_by: createdBy,
    })
    .returning();
  return row;
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
  return db.transaction(async (tx) => {
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
    return { signed: true };
  });
}

export type SignViewState = "valid" | "signed" | "expired" | "not_found";

/** External signer read path: token → request summary + fields (does not consume). */
export async function viewByToken(rawToken: string) {
  const peek = await peekLink("sign_request", rawToken);
  if (peek.state === "not_found") return { state: "not_found" as const };
  if (peek.state === "used") return { state: "signed" as const };
  if (peek.state === "expired" || peek.state === "revoked") return { state: "expired" as const };

  const req = await getRequest(peek.subjectId!);
  const { fields } = await getTemplate(req.template_id);
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
      const fields = await db
        .select()
        .from(signature_template_fields)
        .where(eq(signature_template_fields.template_id, req.template_id))
        .orderBy(signature_template_fields.sort_order, signature_template_fields.id);
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

/** The full audit trail for a request (HR / signer view). */
export async function getAuditTrail(requestId: number) {
  await getRequest(requestId);
  return db
    .select()
    .from(signature_events)
    .where(eq(signature_events.request_id, requestId))
    .orderBy(signature_events.created_at);
}

export { documentHash };
