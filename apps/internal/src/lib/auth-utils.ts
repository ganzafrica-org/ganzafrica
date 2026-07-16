/**
 * Authentication and role utility functions for Internal app
 */

export interface UserRole {
  role_name?: string;
  roleName?: string;
  role?: string;
  role_id?: number;
  roleId?: number;
  email?: string;
}

/**
 * Check if a user's email is authorized for internal app access
 */
export function isEmailAuthorized(user: UserRole | null): boolean {
  if (!user || !user.email) return false;

  const authorizedEmails =
    process.env.NEXT_PUBLIC_INTERNAL_AUTHORIZED_EMAILS?.split(",").map((e) => e.trim()) || [];

  return authorizedEmails.includes(user.email);
}

/**
 * Check if a user has admin or manager role
 */
export function isAdminOrManager(user: UserRole | null): boolean {
  if (!user) return false;

  const roleName = user.role_name || user.roleName || user.role;
  const roleId = user.role_id || user.roleId;

  const isAdminOrManagerRole =
    roleName &&
    (roleName.toLowerCase().includes("admin") ||
      roleName.toLowerCase().includes("manager") ||
      roleName.toLowerCase().includes("staff") ||
      (roleId && roleId < 1000));

  return !!isAdminOrManagerRole;
}

// In-memory cache of the current user, populated by fetchUserProfile from /auth/me (cookie).
let cachedUser: UserRole | null = null;

export function getCurrentUserRole(): UserRole | null {
  return cachedUser;
}

/**
 * Fetch the current user from /auth/me (cookie session) and cache it for sync callers.
 */
export async function fetchUserProfile(): Promise<UserRole | null> {
  if (typeof window === "undefined") return null;
  try {
    const { default: apiClient } = await import("./api-client");
    const response = await apiClient.get("/auth/me");
    const user = response.data.user;
    if (user) {
      cachedUser = {
        role_name: user.roles?.[0] ?? user.role_name,
        roleName: user.roles?.[0] ?? user.role_name,
        role: user.roles?.[0] ?? user.role_name,
        role_id: user.role_id,
        roleId: user.role_id,
        email: user.email,
      };
      return cachedUser;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
  return null;
}

/**
 * Check if current user is authorized for internal app
 */
export function isCurrentUserAuthorized(): boolean {
  const user = getCurrentUserRole();
  return isEmailAuthorized(user);
}
