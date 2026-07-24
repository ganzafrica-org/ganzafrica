/**
 * Generalized single-use secure link tokens (REC-05). One audited mechanism for token-authed
 * flows (offer acceptance now; sign requests / invites later). The RAW token is returned once and
 * NEVER stored or logged — only its sha256 hash is persisted, matching the FND-01 payslip pattern.
 */
import crypto from "crypto";
import { and, eq, isNull, gt, sql } from "drizzle-orm";
import { db } from "../db/client";
import { secure_link_tokens } from "../db/schema/recruitment/offers";

export type LinkKind = "offer" | "sign_request" | "invite";

function hash(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/** Mint a token for (kind, subjectId), valid until `expiresAt`. Returns the raw token once. */
export async function mintLink(
  kind: LinkKind,
  subjectId: number,
  expiresAt: Date,
): Promise<string> {
  const raw = crypto.randomBytes(32).toString("hex");
  await db.insert(secure_link_tokens).values({
    kind,
    subject_id: subjectId,
    token_hash: hash(raw),
    expires_at: expiresAt,
  });
  return raw;
}

export type RedeemState = "valid" | "expired" | "revoked" | "used" | "not_found";

export interface RedeemResult {
  state: RedeemState;
  tokenId?: number;
  subjectId?: number;
  kind?: LinkKind;
}

/** Look up a token by raw value without consuming it (read path). */
export async function peekLink(kind: LinkKind, raw: string): Promise<RedeemResult> {
  const [row] = await db
    .select()
    .from(secure_link_tokens)
    .where(and(eq(secure_link_tokens.kind, kind), eq(secure_link_tokens.token_hash, hash(raw))))
    .limit(1);
  if (!row) return { state: "not_found" };
  if (row.revoked_at) return { state: "revoked", tokenId: row.id, subjectId: row.subject_id, kind };
  if (row.used_at) return { state: "used", tokenId: row.id, subjectId: row.subject_id, kind };
  if (row.expires_at.getTime() <= Date.now())
    return { state: "expired", tokenId: row.id, subjectId: row.subject_id, kind };
  return { state: "valid", tokenId: row.id, subjectId: row.subject_id, kind };
}

/**
 * Atomically consume a token: flip used_at only if still unused/unrevoked/unexpired. Returns the
 * subject id on success, or a non-valid state. The conditional UPDATE is the race guard — exactly
 * one caller can win a concurrent double-submit.
 */
export async function consumeLink(kind: LinkKind, raw: string): Promise<RedeemResult> {
  const tokenHash = hash(raw);
  const updated = await db
    .update(secure_link_tokens)
    .set({ used_at: new Date() })
    .where(
      and(
        eq(secure_link_tokens.kind, kind),
        eq(secure_link_tokens.token_hash, tokenHash),
        isNull(secure_link_tokens.used_at),
        isNull(secure_link_tokens.revoked_at),
        gt(secure_link_tokens.expires_at, sql`now()`),
      ),
    )
    .returning();

  if (updated.length === 1) {
    return { state: "valid", tokenId: updated[0].id, subjectId: updated[0].subject_id, kind };
  }
  // Didn't win — report why (already used / expired / revoked / missing).
  return peekLink(kind, raw);
}

/** Revoke all active tokens for a subject (e.g. on offer withdraw or resend). Returns count. */
export async function revokeLinks(kind: LinkKind, subjectId: number): Promise<number> {
  const revoked = await db
    .update(secure_link_tokens)
    .set({ revoked_at: new Date() })
    .where(
      and(
        eq(secure_link_tokens.kind, kind),
        eq(secure_link_tokens.subject_id, subjectId),
        isNull(secure_link_tokens.revoked_at),
        isNull(secure_link_tokens.used_at),
      ),
    )
    .returning();
  return revoked.length;
}
