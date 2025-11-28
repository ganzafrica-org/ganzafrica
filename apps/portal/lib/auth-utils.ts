import { User } from "@/components/auth/auth-provider";

/**
 * Check if a user has admin or manager role
 * @param user - User object with role information
 * @returns boolean indicating if user is admin or manager
 */
export function isAdminOrManager(user: User | null): boolean {
  if (!user) return false;

  const roleName = user.role_name?.toLowerCase() || "";

  // Check for admin or manager roles by name only (removed hardcoded role_id check)
  const isAdminOrManagerByName =
    roleName &&
    (roleName.includes("admin") ||
      roleName.includes("manager") ||
      roleName.includes("staff") ||
      roleName.includes("mentor"));

  return !!isAdminOrManagerByName;
}
