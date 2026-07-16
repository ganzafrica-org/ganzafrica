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

/**
 * Get user role information from localStorage
 */
export function getCurrentUserRole(): UserRole | null {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    const userStr = localStorage.getItem("internal_user") || localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        role_name: user.role_name,
        roleName: user.roleName,
        role: user.role,
        role_id: user.role_id,
        roleId: user.roleId,
        email: user.email,
      };
    }
  } catch (error) {
    console.error("Error getting current user role:", error);
  }
  return null;
}

/**
 * Fetch user profile from API
 */
export async function fetchUserProfile(): Promise<UserRole | null> {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      return null;
    }

    const { default: apiClient } = await import("./api-client");

    const response = await apiClient.get("/users/profile/me");
    const profile = response.data.profile;

    if (profile) {
      localStorage.setItem("internal_user", JSON.stringify(profile));
      localStorage.setItem("user", JSON.stringify(profile));

      return {
        role_name: profile.role_name,
        roleName: profile.role_name,
        role: profile.role_name,
        role_id: profile.role_id,
        roleId: profile.role_id,
        email: profile.email,
      };
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
