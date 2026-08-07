import type { User } from "@/types/api";

// RBAC role names as returned by GET /auth/me's `roles` array (lowercase — "hr", "admin",
// "director", "finance", "program_manager", "staff", "fellow", "analyst", "mentor", "alumni",
// "employee"). The old singular `user.role` field ("HR" | "IT" | "EMPLOYEE") belonged to the
// retired hr_users model and /auth/me never actually returns it — checks against it always
// silently failed.
export function hasRequiredRole(userRoles: string[], allowedRoles: string[]) {
  return allowedRoles.some((r) => userRoles.includes(r));
}

export function canManageEmployees(userRoles: string[]) {
  return userRoles.includes("hr") || userRoles.includes("admin");
}

export function canApproveLeaves(userRoles: string[]) {
  return userRoles.includes("hr") || userRoles.includes("admin");
}

export function canUpdateEmployeeProfile(
  targetUser: User,
  actor: User,
  actorRoles: string[],
  keys: string[],
) {
  if (actorRoles.includes("hr") || actorRoles.includes("admin")) return true;
  if (actor.id !== targetUser.id) return false;
  return keys.every((key) => key === "phone" || key === "picture");
}
