import { User } from '@/components/auth/auth-provider';

/**
 * Check if a user has admin or manager role
 * @param user - User object with role information
 * @returns boolean indicating if user is admin or manager
 */
export function isAdminOrManager(user: User | null): boolean {
  if (!user) return false;
  
  const roleName = user.role_name?.toLowerCase() || '';
  const roleId = user.role_id;
  
  // Check for admin or manager roles by name
  const isAdminOrManagerByName = roleName && (
    roleName.includes('admin') ||
    roleName.includes('manager') ||
    roleName.includes('staff') ||
    roleName.includes('mentor')
  );
  
  // Check for admin or manager roles by ID (assuming admin/manager roles have IDs < 1000)
  const isAdminOrManagerById = roleId && roleId < 1000;
  
  return !!isAdminOrManagerByName || !!isAdminOrManagerById;
}

