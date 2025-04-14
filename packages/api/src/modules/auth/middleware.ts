import { TRPCError } from "@trpc/server";
import { middleware, procedure } from "../../trpc/trpc";
import { validateSession } from "./service";
import { UserSession } from "./types";

// Extract auth user from context if available
export async function getAuthUser(ctx: {
  req: Request;
  resHeaders?: Headers;
}): Promise<UserSession | null> {
  try {
    // Extract token from cookies
    const cookieHeader = ctx.req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader
        .split("; ")
        .filter((s) => s)
        .map((c) => {
          const [key, ...value] = c.split("=");
          return [key, value.join("=")];
        }),
    );

    const token = cookies.auth_token;
    if (!token) {
      // Also try from Authorization header
      const authHeader = ctx.req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        return await validateSession(authHeader.substring(7));
      }
      return null;
    }

    return await validateSession(token);
  } catch (error) {
    console.error("Auth middleware error:", error);
    return null;
  }
}

// Middleware to check if user is authenticated
export const isAuth = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Middleware to check if user has specific role
export const hasRole = (role: string | string[]) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access this resource",
      });
    }

    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource",
      });
    }

    return next({
      ctx,
    });
  });

// Protected procedure - requires authentication
export const protectedProcedure = procedure.use(isAuth);

// Role-specific procedure - requires specific role
export const roleProtectedProcedure = (role: string | string[]) =>
  procedure.use(hasRole(role));
