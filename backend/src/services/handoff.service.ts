import crypto from "crypto";
import { db } from "../db/client";
import { auth_handoff_codes } from "../db/schema";
import { sql } from "drizzle-orm";

const CODE_TTL_MS = 60_000;

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function createHandoffCode(userId: number, targetApp: string): Promise<string> {
  const code = crypto.randomBytes(16).toString("base64url");
  await db.insert(auth_handoff_codes).values({
    code_hash: sha256(code),
    user_id: userId,
    target_app: targetApp,
    expires_at: new Date(Date.now() + CODE_TTL_MS),
  });
  return code;
}

/**
 * Atomically consume a handoff code. The single UPDATE ... WHERE used_at IS NULL guarantees
 * exactly one caller wins under concurrency. Returns the user_id, or null if invalid/used/expired.
 */
export async function redeemHandoffCode(code: string): Promise<number | null> {
  const rows = await db.execute(sql`
    UPDATE auth_handoff_codes
    SET used_at = now()
    WHERE code_hash = ${sha256(code)} AND used_at IS NULL AND expires_at > now()
    RETURNING user_id
  `);
  const row = rows.rows[0] as { user_id: number } | undefined;
  return row ? row.user_id : null;
}
