/**
 * Authentication and role utility functions
 */

export interface UserRole {
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
  const isAdminOrManagerRole = roleName && (
    roleName.toLowerCase().includes('admin') ||
    roleName.toLowerCase().includes('manager') ||
    roleName.toLowerCase().includes('staff') ||
    roleName.toLowerCase().includes('mentor') ||
    (roleId && roleId < 1000) // Assuming admin/manager roles have IDs < 1000
  );
  
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
  const isAdminRole = roleName && (
    roleName.toLowerCase().includes('admin') ||
    (roleId && roleId < 100) // Assuming admin roles have IDs < 100
  );
  
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
  
  return !!(roleName && roleName.toLowerCase().includes('alumni'));
}

/**
 * Check if a user should be blocked from accessing the platform
 * @param user - User object with role information
 * @returns boolean indicating if user should be blocked
 */
export function shouldBlockUser(user: UserRole | null): boolean {
  return isAlumni(user);
}

/**
 * Get user role information from localStorage
 * @returns User role information or null if not found
 */
export function getCurrentUserRole(): UserRole | null {
  try {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      return null;
    }
    
    const userStr = localStorage.getItem('task_user') || localStorage.getItem('user');
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
    console.error('Error getting current user role:', error);
  }
  return null;
}

/**
 * Fetch user profile from API
 * @returns Promise<UserRole | null> - User role information or null if not found
 */
export async function fetchUserProfile(): Promise<UserRole | null> {
  try {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      return null;
    }
    
    const token = localStorage.getItem('accessToken') || localStorage.getItem('task_token');
    if (!token) {
      return null;
    }
    
    // Import apiClient dynamically to avoid circular imports
    const { default: apiClient } = await import('./api-client');
    
    const response = await apiClient.get('/users/profile/me');
    const profile = response.data.profile;
    
    if (profile) {
      // Update localStorage with fresh profile data
      localStorage.setItem('task_user', JSON.stringify(profile));
      localStorage.setItem('user', JSON.stringify(profile));
      
      return {
        role_name: profile.role_name,
        roleName: profile.role_name,
        role: profile.role_name,
        role_id: profile.role_id,
        roleId: profile.role_id,
      };
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
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
    const currentUserId = parseInt(localStorage.getItem('task_user_id') || localStorage.getItem('user_id') || '0');
    return currentUserId === parseInt(taskCreatorId.toString());
  } catch (error) {
    console.error('Error checking task edit permissions:', error);
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
    const currentUserId = parseInt(localStorage.getItem('task_user_id') || localStorage.getItem('user_id') || '0');
    return currentUserId === parseInt(taskCreatorId.toString());
  } catch (error) {
    console.error('Error checking task edit permissions:', error);
    return false;
  }
}