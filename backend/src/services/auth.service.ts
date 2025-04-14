import * as argon2 from "argon2";
import { V4 } from "paseto";
import { randomBytes } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { db, newId, withDbTransaction } from "@/db/client";
import { env, Logger, constants } from "../config";
import {
  users,
  sessions,
  verification_tokens,
  password_reset_tokens,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.service";
import { AppError } from "@/middlewares";

const logger = new Logger("AuthService");

// Configure argon2 options for password hashing
const argon2Options = {
  // These are the recommended settings for argon2id
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MiB
  timeCost: 3, // 3 iterations
  parallelism: 4, // 4 parallel threads
};

// PASETO symmetric key for token signing/verification
const pasetoKey = Buffer.from(env.PASETO_SECRET, "utf-8");
if (pasetoKey.length < 32) {
  throw new Error("PASETO_SECRET must be at least 32 characters long");
}

/**
 * Hash a password using Argon2
 */
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, argon2Options);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password, argon2Options);
  } catch (error) {
    logger.error("Password verification error", error);
    return false;
  }
}

/**
 * Create a PASETO token
 */
export async function createToken(
  payload: any,
  expiresIn: string = env.ACCESS_TOKEN_EXPIRY,
): Promise<string> {
  try {
    // Convert expiration time to seconds
    const expiresInMs = parseTimeToMs(expiresIn);
    const expirationDate = new Date(Date.now() + expiresInMs);

    // Create the token
    const token = await V4.encrypt(
      {
        ...payload,
        exp: expirationDate,
        jti: uuidv4(), // Add unique token ID
      },
      pasetoKey,
    );

    return token;
  } catch (error) {
    logger.error("Token creation error", error);
    throw new AppError("Failed to create authentication token", 500);
  }
}

/**
 * Verify and decode a PASETO token
 */
export async function verifyToken(token: string): Promise<any> {
  try {
    const decoded = await V4.decrypt(token, pasetoKey);
    return decoded;
  } catch (error) {
    logger.error("Token verification error", error);
    throw new AppError("Invalid or expired token", 401);
  }
}

/**
 * Create session and generate access/refresh tokens
 */
export async function createSession(
  userId: bigint,
  ipAddress: string,
  userAgent: string,
) {
  // Generate tokens
  const accessToken = await createToken(
    {
      id: userId.toString(),
      type: constants.TOKEN_TYPES.ACCESS,
    },
    env.ACCESS_TOKEN_EXPIRY,
  );

  const refreshToken = await createToken(
    {
      id: userId.toString(),
      type: constants.TOKEN_TYPES.REFRESH,
    },
    env.REFRESH_TOKEN_EXPIRY,
  );

  // Hash the refresh token for storage
  const refreshTokenHash = await argon2.hash(refreshToken, argon2Options);

  // Save session to database
  const sessionId = newId();

  await db.insert(sessions).values({
    id: sessionId,
    user_id: userId,
    token_hash: await argon2.hash(accessToken, argon2Options),
    refresh_token_hash: refreshTokenHash,
    expires_at: new Date(Date.now() + parseTimeToMs(env.REFRESH_TOKEN_EXPIRY)),
    last_activity: new Date(),
    ip_address: ipAddress,
    user_agent: userAgent,
    device_info: {}, // Could be populated with device detection
    is_valid: true,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return {
    accessToken,
    refreshToken,
  };
}

/**
 * Invalidate a user session
 */
export async function invalidateSession(
  tokenOrSessionId: string,
  isToken: boolean = true,
) {
  try {
    if (isToken) {
      const decoded = await verifyToken(tokenOrSessionId);
      // Find and invalidate the session
      const userSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.user_id, BigInt(decoded.id)));

      // Mark each session as invalid
      for (const session of userSessions) {
        await db
          .update(sessions)
          .set({ is_valid: false, updated_at: new Date() })
          .where(eq(sessions.id, session.id));
      }
    } else {
      // Directly invalidate by session ID
      await db
        .update(sessions)
        .set({ is_valid: false, updated_at: new Date() })
        .where(eq(sessions.id, BigInt(tokenOrSessionId)));
    }

    return true;
  } catch (error) {
    logger.error("Session invalidation error", error);
    return false;
  }
}

/**
 * Create and send email verification token
 */
export async function sendVerification(userId: bigint, email: string) {
  try {
    // Generate verification token
    const token = randomBytes(32).toString("hex");
    const tokenHash = await argon2.hash(token, argon2Options);
    const expiresAt = new Date(Date.now() + parseTimeToMs("24h"));

    // Save token to database
    await db.insert(verification_tokens).values({
      id: newId(),
      user_id: userId,
      type: "email",
      token_hash: tokenHash,
      expires_at: expiresAt,
      used: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Send email with verification link
    await sendVerificationEmail(email, {
      token,
      expiresAt,
    });

    return true;
  } catch (error) {
    logger.error("Verification token creation error", error);
    throw new AppError("Failed to send verification email", 500);
  }
}

/**
 * Create and send password reset token
 */
export async function sendPasswordReset(
  userId: bigint,
  email: string,
  ipAddress: string,
) {
  try {
    // Generate password reset token
    const token = randomBytes(32).toString("hex");
    const tokenHash = await argon2.hash(token, argon2Options);
    const expiresAt = new Date(Date.now() + parseTimeToMs("1h"));

    // Save token to database
    await db.insert(password_reset_tokens).values({
      id: newId(),
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      used: false,
      ip_address: ipAddress,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Send email with reset link
    await sendPasswordResetEmail(email, {
      token,
      expiresAt,
    });

    return true;
  } catch (error) {
    logger.error("Password reset token creation error", error);
    throw new AppError("Failed to send password reset email", 500);
  }
}

/**
 * Verify an email verification token
 */
export async function verifyEmailToken(token: string, userId: bigint) {
  return await withDbTransaction(async (txDb) => {
    // Find the token
    const tokens = await txDb
      .select()
      .from(verification_tokens)
      .where(
        and(
          eq(verification_tokens.user_id, userId),
          eq(verification_tokens.type, "email"),
          eq(verification_tokens.used, false),
        ),
      );

    if (!tokens.length) {
      throw new AppError("Invalid verification token", 400);
    }

    // Check if any token hash matches
    let validToken = null;
    for (const dbToken of tokens) {
      if (await argon2.verify(dbToken.token_hash, token)) {
        validToken = dbToken;
        break;
      }
    }

    if (!validToken) {
      throw new AppError("Invalid verification token", 400);
    }

    // Check expiration
    if (validToken.expires_at < new Date()) {
      throw new AppError("Verification token has expired", 400);
    }

    // Mark token as used
    await txDb
      .update(verification_tokens)
      .set({ used: true, updated_at: new Date() })
      .where(eq(verification_tokens.id, validToken.id));

    // Mark user email as verified
    await txDb
      .update(users)
      .set({ email_verified: true, updated_at: new Date() })
      .where(eq(users.id, userId));

    return true;
  });
}

/**
 * Verify a password reset token
 */
export async function verifyPasswordResetToken(token: string, userId: bigint) {
  // Find the token
  const tokens = await db
    .select()
    .from(password_reset_tokens)
    .where(
      and(
        eq(password_reset_tokens.user_id, userId),
        eq(password_reset_tokens.used, false),
      ),
    );

  if (!tokens.length) {
    throw new AppError("Invalid password reset token", 400);
  }

  // Check if any token hash matches
  let validToken = null;
  for (const dbToken of tokens) {
    if (await argon2.verify(dbToken.token_hash, token)) {
      validToken = dbToken;
      break;
    }
  }

  if (!validToken) {
    throw new AppError("Invalid password reset token", 400);
  }

  // Check expiration
  if (validToken.expires_at < new Date()) {
    throw new AppError("Password reset token has expired", 400);
  }

  return validToken;
}

/**
 * Reset password using a token
 */
export async function resetPassword(
  token: string,
  userId: bigint,
  newPassword: string,
) {
  return await withDbTransaction(async (txDb) => {
    // Verify token
    const validToken = await verifyPasswordResetToken(token, userId);

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    await txDb
      .update(users)
      .set({
        password_hash: passwordHash,
        last_password_change: new Date(),
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    // Mark token as used
    await txDb
      .update(password_reset_tokens)
      .set({ used: true, updated_at: new Date() })
      .where(eq(password_reset_tokens.id, validToken.id));

    // Invalidate all user sessions
    await txDb
      .update(sessions)
      .set({ is_valid: false, updated_at: new Date() })
      .where(eq(sessions.user_id, userId));

    return true;
  });
}

/**
 * Helper to parse time string like '7d', '24h', '30m' to milliseconds
 */
function parseTimeToMs(timeStr: string): number {
  const match = timeStr.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(
      `Invalid time format: ${timeStr}. Expected format: 30s, 15m, 24h, 7d`,
    );
  }

  const [, value, unit] = match;
  const num = parseInt(value, 10);

  switch (unit) {
    case "s":
      return num * 1000;
    case "m":
      return num * 60 * 1000;
    case "h":
      return num * 60 * 60 * 1000;
    case "d":
      return num * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unknown time unit: ${unit}`);
  }
}
