import crypto from "crypto";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { payslip_access_tokens } from "../../db/schema/payslip-tokens";
import { payrolls } from "../../db/schema/payroll";
import env from "../../config/env";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/**
 * Mint a new access token for a payroll's payslip. Revokes any previously-issued unrevoked
 * tokens for the same payroll in the same transaction (re-sending a payslip invalidates old
 * links). Returns the RAW token — it is never stored or logged; only its sha256 hash is kept.
 */
export async function mintPayslipToken(payrollId: number): Promise<string> {
  const raw = crypto.randomBytes(32).toString("base64url");
  const token_hash = hashToken(raw);
  const expires_at = new Date(Date.now() + ONE_YEAR_MS);

  await db.transaction(async (tx) => {
    await tx
      .update(payslip_access_tokens)
      .set({ revoked_at: new Date() })
      .where(
        and(
          eq(payslip_access_tokens.payroll_id, payrollId),
          isNull(payslip_access_tokens.revoked_at),
        ),
      );
    await tx
      .insert(payslip_access_tokens)
      .values({ payroll_id: payrollId, token_hash, expires_at });
  });

  return raw;
}

/** Full public URL for the emailed payslip link. */
export function buildPayslipLink(token: string): string {
  return `${env.API_BASE_URL.replace(/\/$/, "")}/api/payslips/view/${token}`;
}

/** Convenience: mint a token and return the ready-to-email link. */
export async function mintAndBuildLink(payrollId: number): Promise<string> {
  const token = await mintPayslipToken(payrollId);
  return buildPayslipLink(token);
}

export type RedeemResult =
  | { ok: true; payslipKey: string }
  | { ok: false; reason: "not_found" | "expired" | "revoked" };

/**
 * Validate a raw token and return the payslip's storage key. Bumps access_count /
 * last_accessed_at atomically on success. All time comparisons happen in SQL (now()).
 */
export async function redeemPayslipToken(rawToken: string): Promise<RedeemResult> {
  const token_hash = hashToken(rawToken);

  const rows = await db
    .select({
      id: payslip_access_tokens.id,
      revoked_at: payslip_access_tokens.revoked_at,
      expired: sql<boolean>`${payslip_access_tokens.expires_at} <= now()`,
      payslipKey: payrolls.payslip_file_key,
    })
    .from(payslip_access_tokens)
    .innerJoin(payrolls, eq(payrolls.id, payslip_access_tokens.payroll_id))
    .where(eq(payslip_access_tokens.token_hash, token_hash))
    .limit(1);

  const row = rows[0];
  if (!row) return { ok: false, reason: "not_found" };
  if (row.revoked_at) return { ok: false, reason: "revoked" };
  if (row.expired) return { ok: false, reason: "expired" };
  if (!row.payslipKey) return { ok: false, reason: "not_found" };

  await db
    .update(payslip_access_tokens)
    .set({
      access_count: sql`${payslip_access_tokens.access_count} + 1`,
      last_accessed_at: new Date(),
    })
    .where(eq(payslip_access_tokens.id, row.id));

  return { ok: true, payslipKey: row.payslipKey };
}

/** Revoke all unrevoked tokens for a payroll. Returns how many were revoked. */
export async function revokeTokensForPayroll(payrollId: number): Promise<number> {
  const revoked = await db
    .update(payslip_access_tokens)
    .set({ revoked_at: new Date() })
    .where(
      and(
        eq(payslip_access_tokens.payroll_id, payrollId),
        isNull(payslip_access_tokens.revoked_at),
      ),
    )
    .returning({ id: payslip_access_tokens.id });
  return revoked.length;
}
