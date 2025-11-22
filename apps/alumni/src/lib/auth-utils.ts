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

/**
 * Get user role information from localStorage
 */
export function getCurrentUserRole(): UserRole | null {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    const userStr =
      localStorage.getItem("alumni_user") || localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        role_name: user.role_name,
        roleName: user.roleName,
        role: user.role,
        role_id: user.role_id,
        roleId: user.roleId,
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
      localStorage.setItem("alumni_user", JSON.stringify(profile));
      localStorage.setItem("user", JSON.stringify(profile));

      return {
        role_name: profile.role_name,
        roleName: profile.role_name,
        role: profile.role_name,
        role_id: profile.role_id,
        roleId: profile.role_id,
      };
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
