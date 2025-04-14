import * as OTPAuth from "otpauth";
import * as crypto from "crypto";
import { AUTH, createLogger } from "../../config";
import { sendOtpEmail } from "../email/service";
import { db, newId } from "../../db/client";
import {
  two_factor_credentials,
  two_factor_temp_tokens,
  users,
} from "../../db/schema";
import { eq } from "drizzle-orm";

const logger = createLogger("totp");

/**
 * Generate a new TOTP secret
 * @returns Base32 encoded secret and a URL for QR code
 */
export function generateTotpSecret(
  email: string,
  issuer: string = "GanzAfrica",
): { secret: string; url: string } {
  try {
    // Generate a secure random secret
    const secret = OTPAuth.Secret.fromHex(
      crypto.randomBytes(20).toString("hex"),
    );

    // Create a new TOTP instance
    const totp = new OTPAuth.TOTP({
      issuer,
      label: email,
      secret,
      digits: 6,
      period: 30,
      algorithm: "SHA1",
    });

    // Get the URL for QR code generation
    const url = totp.toString();

    return {
      secret: secret.base32,
      url,
    };
  } catch (error) {
    logger.error("TOTP secret generation failed", { error });
    throw new Error("Failed to generate TOTP secret");
  }
}

/**
 * Verify a TOTP code against a secret
 * @param secret Base32 encoded secret
 * @param token The TOTP code to verify
 * @returns True if the token is valid
 */
export function verifyTotpToken(secret: string, token: string): boolean {
  try {
    // Create a TOTP instance with the user's secret
    const totp = new OTPAuth.TOTP({
      issuer: "GanzAfrica",
      label: "user",
      secret: OTPAuth.Secret.fromBase32(secret),
      digits: 6,
      period: 30,
      algorithm: "SHA1",
    });

    // Allow a window of 1 period before and after for clock drift
    const delta = totp.validate({ token, window: 1 });

    return delta !== null;
  } catch (error) {
    logger.error("TOTP verification failed", { error });
    return false;
  }
}

/**
 * Generate a one-time email verification code
 * @returns A 6-digit numeric code
 */
export function generateEmailOtp(): string {
  // Generate a 6-digit code
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Create and store a temporary token for 2FA
 * @param userId The user ID
 * @returns The temporary token
 */
export async function createTempToken(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await db.insert(two_factor_temp_tokens).values({
    id: Number(newId()),
    user_id: userId,
    token_hash: tokenHash,
    expires_at: new Date(Date.now() + AUTH.OTP_EXPIRY * 1000),
    used: false,
    created_at: new Date(),
  });

  return token;
}

/**
 * Validate a temporary token for 2FA
 * @param token The token to validate
 * @returns The user ID if valid, null otherwise
 */
export async function validateTempToken(token: string): Promise<number | null> {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const tempToken = await db.query.two_factor_temp_tokens.findFirst({
    where: eq(two_factor_temp_tokens.token_hash, tokenHash),
  });

  if (!tempToken || tempToken.used || tempToken.expires_at < new Date()) {
    return null;
  }

  // Mark as used
  await db
    .update(two_factor_temp_tokens)
    .set({ used: true })
    .where(eq(two_factor_temp_tokens.id, tempToken.id));

  return tempToken.user_id;
}

/**
 * Setup TOTP for a user
 * @param userId The user ID
 * @param email The user's email
 * @returns The TOTP secret and QR code URL
 */
export async function setupTotp(
  userId: number,
  email: string,
): Promise<{ secret: string; url: string }> {
  // Generate new TOTP secret
  const { secret, url } = generateTotpSecret(email);

  // Store the TOTP credential
  await db.insert(two_factor_credentials).values({
    id: Number(newId()),
    user_id: userId,
    method: "authenticator",
    secret,
    verified: false,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return { secret, url };
}

/**
 * Verify and activate TOTP for a user
 * @param userId The user ID
 * @param token The TOTP code to verify
 * @returns True if verified successfully
 */
export async function verifyAndActivateTotp(
  userId: number,
  token: string,
): Promise<boolean> {
  // Get the user's TOTP credential
  const credential = await db.query.two_factor_credentials.findFirst({
    where: eq(two_factor_credentials.user_id, userId),
  });

  if (
    !credential ||
    credential.method !== "authenticator" ||
    !credential.secret
  ) {
    return false;
  }

  // Verify the token
  const isValid = verifyTotpToken(credential.secret, token);

  if (isValid) {
    // Mark as verified
    await db
      .update(two_factor_credentials)
      .set({
        verified: true,
        updated_at: new Date(),
      })
      .where(eq(two_factor_credentials.id, credential.id));

    // Update user to enable 2FA
    // TODO: This should be done outside this function to keep it focused

    await db
      .update(users)
      .set({
        two_factor_enabled: true,
        two_factor_method: "authenticator",
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));
  }

  return isValid;
}

/**
 * Send email OTP and create temporary token
 * @param userId User ID
 * @param email User email
 * @returns Temporary token if successful
 */
export async function sendEmailOtpAndCreateToken(
  userId: number,
  email: string,
): Promise<string | null> {
  const otp = generateEmailOtp();

  try {
    // Store OTP credential
    await db.insert(two_factor_credentials).values({
      id: Number(newId()),
      user_id: userId,
      method: "email_otp",
      secret: otp, // Store the OTP (will be one-time use)
      verified: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    // Create temporary token
    return await createTempToken(userId);
  } catch (error) {
    logger.error("Failed to send email OTP", { error, userId });
    return null;
  }
}

/**
 * Verify email OTP
 * @param userId User ID
 * @param otp The OTP code
 * @returns True if valid
 */
export async function verifyEmailOtp(
  userId: number,
  otp: string,
): Promise<boolean> {
  const credential = await db.query.two_factor_credentials.findFirst({
    where: eq(two_factor_credentials.user_id, userId),
    orderBy: (fields, operators) => [operators.desc(fields.created_at)],
  });

  if (
    !credential ||
    credential.method !== "email_otp" ||
    credential.secret !== otp
  ) {
    return false;
  }

  // Mark as verified and used
  await db
    .update(two_factor_credentials)
    .set({
      verified: true,
      secret: null, // Clear the OTP after use
      updated_at: new Date(),
    })
    .where(eq(two_factor_credentials.id, credential.id));

  return true;
}
