import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, procedure, publicProcedure } from "../trpc";
import {
  signupSchema,
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  setupTotpSchema,
  resendVerificationEmail,
} from "../../modules/auth";
import {
  createUser,
  authenticateUser,
  logout,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} from "../../modules/auth";
import {
  setupTotp,
  verifyAndActivateTotp,
  validateTempToken,
  createTempToken,
} from "../../modules/auth";
import { AUTH } from "../../config";
import { protectedProcedure } from "../../modules/auth";
import { users } from "../../db/schema";
import { db } from "../../db/client";
import { eq } from "drizzle-orm";
import { createLogger } from "../../config";

const logger = createLogger("auth-router");

// Standardized response type
type AuthResponse<T = null> = {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
};

export const authRouter = router({
  /**
   * Register a new user
   */
  signup: publicProcedure
    .input(signupSchema)
    .mutation(async ({ input }): Promise<AuthResponse<{ userId: string }>> => {
      try {
        const result = await createUser(input);

        return {
          success: true,
          message:
            "Account created successfully. Please check your email to verify your account.",
          data: {
            userId: result.userId,
          },
        };
      } catch (error: unknown) {
        // Type-guard for error
        if (error instanceof Error) {
          if (error.message === "Email already in use") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "This email is already registered",
            });
          }
        }

        logger.error("Signup error", { error, email: input.email });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create account. Please try again later.",
          cause: error,
        });
      }
    }),

  /**
   * Login with email and password
   */
  login: publicProcedure.input(loginSchema).mutation(
    async ({
      input,
      ctx,
    }): Promise<
      AuthResponse<{
        user?: { id: string; name: string; email: string; role: string };
        requiresTwoFactor?: boolean;
        twoFactorMethod?: string;
        tempToken?: string;
      }>
    > => {
      try {
        // Get client information
        const userAgent = ctx.req.headers.get("user-agent") || "unknown";
        const ip =
          ctx.req.headers.get("x-forwarded-for") ||
          ctx.req.headers.get("cf-connecting-ip") ||
          "unknown";

        const result = await authenticateUser(input, ip, userAgent);

        if (!result) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        // Check if 2FA is enabled for this user
        const user = await db.query.users.findFirst({
          where: eq(users.id, Number(result.user.id)),
        });

        if (user?.two_factor_enabled) {
          // User has 2FA enabled, create a temporary token for the 2FA flow
          const tempToken = await createTempToken(user.id);

          return {
            success: false,
            message: "Additional verification required",
            data: {
              requiresTwoFactor: true,
              twoFactorMethod:
                user.two_factor_method?.toString() || "authenticator",
              tempToken,
            },
          };
        }

                // Set HTTP-only cookie with the PASETO token
                ctx.resHeaders.append('Set-Cookie', `auth_token=${result.token}; HttpOnly; Path=/; Max-Age=${AUTH.TOKEN_EXPIRY}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);

        return {
          success: true,
          message: "Login successful",
          data: {
            user: {
              id: result.user.id,
              name: result.user.name,
              email: result.user.email,
              role: result.user.role,
            },
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          // Forward tRPC errors
          throw error;
        }

        logger.error("Login error", { error, email: input.email });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred during login. Please try again.",
          cause: error,
        });
      }
    },
  ),

  /**
   * Verify two-factor authentication
   */
  verifyTwoFactor: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, "Temporary token is required"),
        code: z.string().min(1, "Verification code is required"),
      }),
    )
    .mutation(
      async ({
        input,
        ctx,
      }): Promise<
        AuthResponse<{
          user?: { id: string; name: string; email: string; role: string };
        }>
      > => {
        try {
          // Validate the temporary token
          const userId = await validateTempToken(input.token);

          if (!userId) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Invalid or expired verification session",
            });
          }

          // Get the user
          const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
          });

          if (!user) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "User not found",
            });
          }

          // Verify the code based on the user's 2FA method
          const isValid = await verifyAndActivateTotp(userId, input.code);

          if (!isValid) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Invalid verification code",
            });
          }

          // Create authentication token
          const userAgent = ctx.req.headers.get("user-agent") || "unknown";
          const ip =
            ctx.req.headers.get("x-forwarded-for") ||
            ctx.req.headers.get("cf-connecting-ip") ||
            "unknown";

          const result = await authenticateUser(
            {
              email: user.email,
              password: "", // This will be ignored as we're bypassing password validation
              skipPasswordValidation: true, // Special flag to bypass password validation when 2FA is verified
            },
            ip,
            userAgent,
          );

          if (!result) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to complete authentication",
            });
          }

                // Set the authentication cookie
                ctx.resHeaders.append('Set-Cookie', `auth_token=${result.token}; HttpOnly; Path=/; Max-Age=${AUTH.TOKEN_EXPIRY}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);

          return {
            success: true,
            message: "Verification successful",
            data: {
              user: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                role: result.user.role,
              },
            },
          };
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }

          logger.error("Two-factor verification error", { error });
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An error occurred during verification. Please try again.",
            cause: error,
          });
        }
      },
    ),

  /**
   * Logout the current user
   */
  logout: protectedProcedure.mutation(
    async ({ ctx }): Promise<AuthResponse> => {
      try {
        // Extract token from auth header or cookie
        const authHeader = ctx.req.headers.get("authorization");
        const token = authHeader?.startsWith("Bearer ")
          ? authHeader.substring(7)
          : undefined;

        // If no token in header, try cookie
        const cookieHeader = ctx.req.headers.get("cookie") || "";
        const cookies = Object.fromEntries(
          cookieHeader
            .split("; ")
            .filter(Boolean)
            .map((c) => {
              const [key, ...value] = c.split("=");
              return [key, value.join("=")];
            }),
        );

        const cookieToken = cookies.auth_token;

        const tokenToInvalidate = token || cookieToken;

        if (!tokenToInvalidate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No active session found",
          });
        }

        await logout(tokenToInvalidate);

        // Clear cookie
        ctx.resHeaders.append(
          "Set-Cookie",
          "auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict",
        );

        return {
          success: true,
          message: "Logged out successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logger.error("Logout error", { error });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred during logout. Please try again.",
          cause: error,
        });
      }
    },
  ),

  /**
   * Get current user information
   */
  me: protectedProcedure.query(
    ({
      ctx,
    }): AuthResponse<{
      user: {
        id: string;
        name: string;
        email: string;
        role: string;
        permissions?: string[];
      };
    }> => {
      return {
        success: true,
        message: "User information retrieved successfully",
        data: {
          user: ctx.user,
        },
      };
    },
  ),

  /**
   * Request password reset
   */
  requestPasswordReset: publicProcedure
    .input(requestPasswordResetSchema)
    .mutation(async ({ input, ctx }): Promise<AuthResponse> => {
      try {
        const ip =
          ctx.req.headers.get("x-forwarded-for") ||
          ctx.req.headers.get("cf-connecting-ip") ||
          "unknown";

        await requestPasswordReset(input, ip);

        // Always return success to prevent email enumeration
        return {
          success: true,
          message:
            "If your email is registered, you will receive reset instructions shortly.",
        };
      } catch (error) {
        // Log but don't expose the error
        logger.error("Password reset request error", {
          error,
          email: input.email,
        });

        // Still return success to prevent email enumeration
        return {
          success: true,
          message:
            "If your email is registered, you will receive reset instructions shortly.",
        };
      }
    }),

  /**
   * Reset password with token
   */
  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input }): Promise<AuthResponse> => {
      try {
        const success = await resetPassword(input);

        if (!success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired reset token",
          });
        }

        return {
          success: true,
          message:
            "Password has been reset successfully. You can now log in with your new password.",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logger.error("Password reset error", { error });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "An error occurred while resetting your password. Please try again.",
          cause: error,
        });
      }
    }),

  /**
   * Verify email address
   */
  verifyEmail: publicProcedure
    .input(verifyEmailSchema)
    .mutation(async ({ input }): Promise<AuthResponse> => {
      try {
        const success = await verifyEmail(input.token);

        if (!success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired verification token",
          });
        }

        return {
          success: true,
          message:
            "Email verified successfully. You can now log in to your account.",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logger.error("Email verification error", { error });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "An error occurred while verifying your email. Please try again.",
          cause: error,
        });
      }
    }),

  /**
   * Resend verification email
   */
  resendVerificationEmail: publicProcedure
    .input(z.object({ email: z.string().email("Invalid email address") }))
    .mutation(async ({ input }): Promise<AuthResponse> => {
      try {
        await resendVerificationEmail(input.email);

        // Always return success to prevent email enumeration
        return {
          success: true,
          message:
            "If your email is registered and not verified, a new verification link has been sent.",
        };
      } catch (error) {
        // Log but don't expose the error
        logger.error("Resend verification email error", {
          error,
          email: input.email,
        });

        // Still return success to prevent email enumeration
        return {
          success: true,
          message:
            "If your email is registered and not verified, a new verification link has been sent.",
        };
      }
    }),
  /**
   * Setup two-factor authentication
   */
  setupTwoFactor: protectedProcedure.mutation(
    async ({
      ctx,
    }): Promise<
      AuthResponse<{
        qrCodeUrl: string;
        secret: string;
      }>
    > => {
      try {
        const userId = Number(ctx.user.id);

        // Check if user already has 2FA set up
        const user = await db.query.users.findFirst({
          where: eq(users.id, userId),
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        if (user.two_factor_enabled) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Two-factor authentication is already enabled",
          });
        }

        // Set up 2FA
        const { secret, url } = await setupTotp(userId, user.email);

        return {
          success: true,
          message: "Two-factor authentication setup initiated",
          data: {
            qrCodeUrl: url,
            secret,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logger.error("2FA setup error", { error, userId: ctx.user.id });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "An error occurred while setting up two-factor authentication. Please try again.",
          cause: error,
        });
      }
    },
  ),

  /**
   * Verify and activate two-factor authentication
   */
  verifyTwoFactorSetup: protectedProcedure
    .input(setupTotpSchema)
    .mutation(async ({ ctx, input }): Promise<AuthResponse> => {
      try {
        const userId = Number(ctx.user.id);

        // Verify the TOTP code
        const isValid = await verifyAndActivateTotp(userId, input.totpCode);

        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid verification code",
          });
        }

        // Update user to enable 2FA
        await db
          .update(users)
          .set({
            two_factor_enabled: true,
            two_factor_method: "authenticator",
            updated_at: new Date(),
          })
          .where(eq(users.id, userId));

        return {
          success: true,
          message: "Two-factor authentication enabled successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logger.error("2FA verification error", { error, userId: ctx.user.id });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "An error occurred while verifying two-factor authentication. Please try again.",
          cause: error,
        });
      }
    }),

  /**
   * Disable two-factor authentication
   */
  disableTwoFactor: protectedProcedure.mutation(
    async ({ ctx }): Promise<AuthResponse> => {
      try {
        const userId = Number(ctx.user.id);

        // Update user to disable 2FA
        await db
          .update(users)
          .set({
            two_factor_enabled: false,
            two_factor_method: null,
            updated_at: new Date(),
          })
          .where(eq(users.id, userId));

        return {
          success: true,
          message: "Two-factor authentication disabled successfully",
        };
      } catch (error) {
        logger.error("2FA disable error", { error, userId: ctx.user.id });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "An error occurred while disabling two-factor authentication. Please try again.",
          cause: error,
        });
      }
    },
  ),
});
