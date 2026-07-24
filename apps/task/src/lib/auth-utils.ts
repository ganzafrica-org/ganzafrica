/**
 * Authentication and role utility functions
 */

export interface UserRole {
  id?: number | string;
  name?: string;
  email?: string;
  avatar_url?: string;
  role_name?: string;
  roleName?: string;
  role?: string;
  role_id?: number;
  roleId?: number;
}

/**
 * Check if a user has admin or manager role
 * @param user - User object with role information
 * @returns boolean indicating if user is admin or manager
 */
export function isAdminOrManager(user: UserRole | null): boolean {
  if (!user) return false;

  const roleName = user.role_name || user.roleName || user.role;
  const roleId = user.role_id || user.roleId;

  // Check for admin or manager roles
  const isAdminOrManagerRole =
    roleName &&
    (roleName.toLowerCase().includes("admin") ||
      roleName.toLowerCase().includes("manager") ||
      roleName.toLowerCase().includes("staff") ||
      roleName.toLowerCase().includes("mentor") ||
      (roleId && roleId < 1000)); // Assuming admin/manager roles have IDs < 1000

  return !!isAdminOrManagerRole;
}

/**
 * Check if a user is specifically an admin (not manager)
 * @param user - User object with role information
 * @returns boolean indicating if user is admin
 */
export function isAdmin(user: UserRole | null): boolean {
  if (!user) return false;

  const roleName = user.role_name || user.roleName || user.role;
  const roleId = user.role_id || user.roleId;

  // Check specifically for admin role
  const isAdminRole =
    roleName && (roleName.toLowerCase().includes("admin") || (roleId && roleId < 100)); // Assuming admin roles have IDs < 100

  return !!isAdminRole;
}

/**
 * Check if a user is Alumni
 * @param user - User object with role information
 * @returns boolean indicating if user is Alumni
 */
export function isAlumni(user: UserRole | null): boolean {
  if (!user) return false;

  const roleName = user.role_name || user.roleName || user.role;

  return !!(roleName && roleName.toLowerCase().includes("alumni"));
}

/**
 * Check if a user should be blocked from accessing the platform
 * @param user - User object with role information
 * @returns boolean indicating if user should be blocked
 */
export function shouldBlockUser(user: UserRole | null): boolean {
  return isAlumni(user);
}

// In-memory cache of the current user, populated by fetchUserProfile (from /auth/me over the
// session cookie). Sync callers read this; there is no token/user in localStorage anymore.
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
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        role_name: user.roles?.[0] ?? user.role_name,
        roleName: user.roles?.[0] ?? user.role_name,
        role: user.roles?.[0] ?? user.role_name,
        role_id: user.role_id,
        roleId: user.role_id,
      };
      return cachedUser;
    }
  } catch (error) {}
  return null;
}

/**
 * Check if current user has admin or manager role
 * @returns boolean indicating if current user is admin or manager
 */
export function isCurrentUserAdminOrManager(): boolean {
  const user = getCurrentUserRole();
  return isAdminOrManager(user);
}

/**
 * Check if current user is specifically an admin
 * @returns boolean indicating if current user is admin
 */
export function isCurrentUserAdmin(): boolean {
  const user = getCurrentUserRole();
  return isAdmin(user);
}

/**
 * Check if current user has admin or manager role (async version that fetches fresh data)
 * @returns Promise<boolean> indicating if current user is admin or manager
 */
export async function isCurrentUserAdminOrManagerAsync(): Promise<boolean> {
  const user = await fetchUserProfile();
  return isAdminOrManager(user);
}

/**
 * Check if current user is Alumni
 * @returns boolean indicating if current user is Alumni
 */
export function isCurrentUserAlumni(): boolean {
  const user = getCurrentUserRole();
  return isAlumni(user);
}

/**
 * Check if current user should be blocked from accessing the platform
 * @returns boolean indicating if current user should be blocked
 */
export function shouldBlockCurrentUser(): boolean {
  const user = getCurrentUserRole();
  return shouldBlockUser(user);
}

/**
 * Check if current user can edit/delete a task
 * @param taskCreatorId - ID of the user who created the task
 * @returns boolean indicating if current user can edit/delete the task
 */
export function canEditTask(taskCreatorId: number | string): boolean {
  const user = getCurrentUserRole();

  // If user is admin/manager, they can edit any task
  if (isAdminOrManager(user)) {
    return true;
  }

  // Check if current user is the task creator
  try {
    const currentUserId = user?.id != null ? parseInt(String(user.id)) : 0;
    return currentUserId === parseInt(taskCreatorId.toString());
  } catch (error) {
    return false;
  }
}

/**
 * Check if current user can edit/delete a task (async version)
 * @param taskCreatorId - ID of the user who created the task
 * @returns Promise<boolean> indicating if current user can edit/delete the task
 */
export async function canEditTaskAsync(taskCreatorId: number | string): Promise<boolean> {
  const user = await fetchUserProfile();

  // If user is admin/manager, they can edit any task
  if (isAdminOrManager(user)) {
    return true;
  }

  // Check if current user is the task creator
  try {
    const currentUserId = user?.id != null ? parseInt(String(user.id)) : 0;
    return currentUserId === parseInt(taskCreatorId.toString());
  } catch (error) {
    return false;
  }
}
