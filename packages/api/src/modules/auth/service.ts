import { and, eq } from "drizzle-orm";
import { db, withDbTransaction, newId } from "../../db/client";
import {
  users,
  sessions,
  password_reset_tokens,
  verification_tokens,
} from "../../db/schema";
import { hashPassword, verifyPassword } from "./passwords";
import { createToken, verifyToken } from "./paseto";
import {
  SignupInput,
  LoginInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
} from "./schema";
import { AUTH, createLogger } from "../../config";
import * as crypto from "crypto";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../email/service";

const logger = createLogger("auth-service");

/**
 * Create a new user account
 * @param input User registration data
 * @returns The created user ID
 */
/**
 * Create a new user account
 * @param input User registration data
 * @returns The created user ID
 */
export async function createUser(
  input: SignupInput,
): Promise<{ userId: string }> {
  return withDbTransaction(async (txDb) => {
    // Check if email already exists
    const existingUser = await txDb.query.users.findFirst({
      where: eq(users.email, input.email.toLowerCase()),
    });

    if (existingUser) {
      throw new Error("Email already in use");
    }

    // Hash the password
    const hashedPassword = await hashPassword(input.password);

    // Generate a new user ID - convert to number since schema expects numbers
    const userId = newId();

    // Create the user
    await txDb.insert(users).values({
      id: Number(userId),
      email: input.email.toLowerCase(),
      name: input.name,
      password_hash: hashedPassword,
      base_role: "public", // Default role for new signups
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Create email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    await txDb.insert(verification_tokens).values({
      id: Number(newId()),
      user_id: Number(userId),
      type: "email",
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + AUTH.VERIFICATION_TOKEN_EXPIRY * 1000),
      created_at: new Date(),
    });

    // Send verification email
    try {
      await sendVerificationEmail(input.email, verificationToken);
      logger.info("Verification email sent", { email: input.email });
    } catch (error) {
      logger.error("Failed to send verification email", {
        error,
        email: input.email,
      });
      // We continue even if email sending fails
    }

    logger.info("New user created", { userId: userId.toString() });

    return { userId: userId.toString() };
  });
}
/**
 * Authenticate a user by email and password
 * @param input Login credentials
 * @param ipAddress Client IP address
 * @param userAgent Client user agent
 * @returns Session token or null if authentication fails
 */
export async function authenticateUser(
  input: LoginInput & { skipPasswordValidation?: boolean },
  ipAddress: string,
  userAgent: string,
): Promise<{ token: string; user: any } | null> {
  return withDbTransaction(async (txDb) => {
    // Find the user by email
    const user = await txDb.query.users.findFirst({
      where: eq(users.email, input.email.toLowerCase()),
    });

    if (!user) {
      logger.warn("Authentication failed: User not found", {
        email: input.email,
      });
      return null;
    }

    // Check if account is locked
    if (user.account_locked) {
      // Check if lockout period has expired
      if (user.last_failed_attempt) {
        const lockoutExpiry = new Date(
          user.last_failed_attempt.getTime() + AUTH.LOCKOUT_DURATION * 1000,
        );
        if (new Date() > lockoutExpiry) {
          // Unlock the account
          await txDb
            .update(users)
            .set({
              account_locked: false,
              failed_login_attempts: 0,
              updated_at: new Date(),
            })
            .where(eq(users.id, user.id));
        } else {
          logger.warn("Authentication failed: Account locked", {
            userId: user.id,
          });
          throw new Error(
            "Account is temporarily locked due to multiple failed attempts",
          );
        }
      } else {
        logger.warn("Authentication failed: Account locked", {
          userId: user.id,
        });
        throw new Error(
          "Account is locked. Please reset your password or contact support.",
        );
      }
    }

    // Skip password validation if we're completing a 2FA flow
    let passwordValid = input.skipPasswordValidation === true;

    // Otherwise validate the password
    if (!passwordValid) {
      passwordValid = await verifyPassword(input.password, user.password_hash);
    }

    if (!passwordValid) {
      // Update failed login attempts
      const failedAttempts = (user.failed_login_attempts || 0) + 1;
      const updateData: Partial<typeof users.$inferInsert> = {
        failed_login_attempts: failedAttempts,
        last_failed_attempt: new Date(),
        updated_at: new Date(),
      };

      // Lock account if too many failed attempts
      if (failedAttempts >= AUTH.MAX_FAILED_ATTEMPTS) {
        updateData.account_locked = true;
        logger.warn("Account locked due to failed attempts", {
          userId: user.id,
        });
      }

      await txDb.update(users).set(updateData).where(eq(users.id, user.id));

      logger.warn("Authentication failed: Invalid password", {
        userId: user.id,
      });
      return null;
    }

    // Authentication successful - create session and token
    const sessionId = Number(newId());

    // Create PASETO token
    const token = await createToken(
      {
        sub: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.base_role,
        sessionId: sessionId.toString(),
      },
      {
        expiresIn: AUTH.TOKEN_EXPIRY,
        issuer: "ganzafrica-auth",
        audience: "ganzafrica-api",
      },
    );

    // Store session information
    const deviceInfo = {
      userAgent,
      ipAddress,
      // TODO: Additional device fingerprinting will be added here
    };

    await txDb.insert(sessions).values({
      id: sessionId,
      user_id: user.id,
      token_hash: crypto.createHash("sha256").update(token).digest("hex"),
      expires_at: new Date(Date.now() + AUTH.TOKEN_EXPIRY * 1000),
      last_activity: new Date(),
      ip_address: ipAddress,
      user_agent: userAgent,
      device_info: deviceInfo,
      is_valid: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Reset failed login attempts
    await txDb
      .update(users)
      .set({
        failed_login_attempts: 0,
        last_login: new Date(),
        updated_at: new Date(),
      })
      .where(eq(users.id, user.id));

    logger.info("User authenticated successfully", { userId: user.id });

    // Return token and basic user info
    return {
      token,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.base_role,
      },
    };
  });
}

/**
 * Validate a session token
 * @param token The session token to validate
 * @returns The user data if valid
 */
export async function validateSession(token: string): Promise<any> {
  try {
    // Verify the token signature and claims
    const payload = await verifyToken(token, {
      issuer: "ganzafrica-auth",
      audience: "ganzafrica-api",
      clockTolerance: "1m",
    });

    if (!payload.sessionId || !payload.sub) {
      logger.warn("Session validation failed: Missing required claims");
      return null;
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Check if the session exists and is valid
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.token_hash, tokenHash),
    });

    if (!session || !session.is_valid) {
      logger.warn("Session validation failed: Invalid session", {
        sessionId: payload.sessionId,
      });
      return null;
    }

    // Check if session is expired
    if (session.expires_at < new Date()) {
      logger.warn("Session validation failed: Expired session", {
        sessionId: payload.sessionId,
      });
      return null;
    }

    // Update last activity
    await db
      .update(sessions)
      .set({
        last_activity: new Date(),
        updated_at: new Date(),
      })
      .where(eq(sessions.id, session.id));

    // Get fresh user data
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user_id),
    });

    if (!user || !user.is_active) {
      logger.warn("Session validation failed: User inactive", {
        userId: session.user_id,
      });
      return null;
    }

    return {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.base_role,
      // Placeholder for permissions - should be fetched from roles
      permissions: [],
    };
  } catch (error) {
    logger.error("Session validation failed", { error });
    return null;
  }
}

/**
 * Logout a user by invalidating their session
 * @param token The session token to invalidate
 */
export async function logout(token: string): Promise<boolean> {
  try {
    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Invalidate the session
    const result = await db
      .update(sessions)
      .set({
        is_valid: false,
        updated_at: new Date(),
      })
      .where(eq(sessions.token_hash, tokenHash));

    // Number of rows affected
    const affectedCount = result ? 1 : 0;
    return affectedCount > 0;
  } catch (error) {
    logger.error("Logout failed", { error });
    return false;
  }
}

/**
 * Request a password reset
 * @param input Email address
 * @param ipAddress Client IP address
 */
export async function requestPasswordReset(
  input: RequestPasswordResetInput,
  ipAddress: string,
): Promise<boolean> {
  // Find the user by email
  const user = await db.query.users.findFirst({
    where: eq(users.email, input.email.toLowerCase()),
  });

  if (!user) {
    // Return true even if user doesn't exist to prevent email enumeration
    logger.info("Password reset requested for non-existent user", {
      email: input.email,
    });
    return true;
  }

  // Generate a reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Store the reset token
  await db.insert(password_reset_tokens).values({
    id: Number(newId()),
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: new Date(Date.now() + AUTH.PASSWORD_RESET_EXPIRY * 1000),
    used: false,
    ip_address: ipAddress,
    created_at: new Date(),
  });

  // Send password reset email
  try {
    await sendPasswordResetEmail(user.email, resetToken);
    logger.info("Password reset email sent", { userId: user.id });
  } catch (error) {
    logger.error("Failed to send password reset email", {
      error,
      userId: user.id,
    });
    // We continue even if email sending fails
  }

  logger.info("Password reset token created", { userId: user.id });

  return true;
}

/**
 * Reset a password with a token
 * @param input Reset token and new password
 */
export async function resetPassword(
  input: ResetPasswordInput,
): Promise<boolean> {
  return withDbTransaction(async (txDb) => {
    // Hash the token to compare with stored hash
    const tokenHash = crypto
      .createHash("sha256")
      .update(input.token)
      .digest("hex");

    // Find the reset token
    const resetToken = await txDb.query.password_reset_tokens.findFirst({
      where: eq(password_reset_tokens.token_hash, tokenHash),
    });

    if (!resetToken) {
      logger.warn("Password reset failed: Invalid token");
      return false;
    }

    if (resetToken.used) {
      logger.warn("Password reset failed: Token already used", {
        userId: resetToken.user_id,
      });
      return false;
    }

    if (resetToken.expires_at < new Date()) {
      logger.warn("Password reset failed: Token expired", {
        userId: resetToken.user_id,
      });
      return false;
    }

    // Hash the new password
    const hashedPassword = await hashPassword(input.password);

    // Update the user's password
    await txDb
      .update(users)
      .set({
        password_hash: hashedPassword,
        last_password_change: new Date(),
        account_locked: false, // Unlock account if it was locked
        failed_login_attempts: 0,
        updated_at: new Date(),
      })
      .where(eq(users.id, resetToken.user_id));

    // Mark the token as used
    await txDb
      .update(password_reset_tokens)
      .set({
        used: true,
      })
      .where(eq(password_reset_tokens.id, resetToken.id));

    // Invalidate all existing sessions for security
    await txDb
      .update(sessions)
      .set({
        is_valid: false,
        updated_at: new Date(),
      })
      .where(eq(sessions.user_id, resetToken.user_id));

    logger.info("Password reset successful", { userId: resetToken.user_id });

    return true;
  });
}

/**
 * Verify a user's email address
 * @param token Verification token
 */
export async function verifyEmail(token: string): Promise<boolean> {
  return withDbTransaction(async (txDb) => {
    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find the verification token
    const verificationToken = await txDb.query.verification_tokens.findFirst({
      where: eq(verification_tokens.token_hash, tokenHash),
    });

    if (!verificationToken) {
      logger.warn("Email verification failed: Invalid token");
      return false;
    }

    if (verificationToken.used) {
      logger.warn("Email verification failed: Token already used", {
        userId: verificationToken.user_id,
      });
      return false;
    }

    if (verificationToken.expires_at < new Date()) {
      logger.warn("Email verification failed: Token expired", {
        userId: verificationToken.user_id,
      });
      return false;
    }

    // Verify the user's email
    await txDb
      .update(users)
      .set({
        email_verified: true,
        updated_at: new Date(),
      })
      .where(eq(users.id, verificationToken.user_id));

    // Mark the token as used
    await txDb
      .update(verification_tokens)
      .set({
        used: true,
      })
      .where(eq(verification_tokens.id, verificationToken.id));

    logger.info("Email verification successful", {
      userId: verificationToken.user_id,
    });

    return true;
  });
}

/**
 * Resend verification email
 * @param email The email address to resend verification to
 * @returns True if successful
 */
export async function resendVerificationEmail(email: string): Promise<boolean> {
  try {
    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user) {
      logger.warn("Resend verification failed: User not found", { email });
      return false;
    }

    if (user.email_verified) {
      logger.info("Email already verified", { userId: user.id });
      return true;
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // Invalidate old tokens
    await db
      .update(verification_tokens)
      .set({ used: true })
      .where(
        and(
          eq(verification_tokens.user_id, user.id),
          eq(verification_tokens.type, "email"),
          eq(verification_tokens.used, false),
        ),
      );

    // Store the new verification token
    await db.insert(verification_tokens).values({
      id: Number(newId()),
      user_id: user.id,
      type: "email",
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + AUTH.VERIFICATION_TOKEN_EXPIRY * 1000),
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);
    logger.info("Verification email resent", { userId: user.id });

    return true;
  } catch (error) {
    logger.error("Failed to resend verification email", { error, email });
    return false;
  }
}
