/**
 * Authentication and role utility functions for Alumni app
 */

export interface UserRole {
  role_name?: string;
  roleName?: string;
  role?: string;
  role_id?: number;
  roleId?: number;
}

/**
 * Check if a user has alumni role
 */
export function isAlumni(user: UserRole | null): boolean {
  if (!user) return false;

  const roleName = user.role_name || user.roleName || user.role;

  return !!(roleName && roleName.toLowerCase().includes("alumni"));
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
      };
      return cachedUser;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
  return null;
}

/**
 * Check if current user is alumni
 */
export function isCurrentUserAlumni(): boolean {
  const user = getCurrentUserRole();
  return isAlumni(user);
}
