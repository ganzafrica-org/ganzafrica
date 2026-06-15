import type { Role, User } from "@/types/api"

export function hasRequiredRole(userRole: Role, allowedRoles: Role[]) {
    return allowedRoles.includes(userRole)
}

export function canManageEmployees(userRole: Role) {
    return userRole === "HR" || userRole === "IT"
}

export function canApproveLeaves(userRole: Role) {
    return userRole === "HR"
}

export function canUpdateEmployeeProfile(targetUser: User, actor: User, keys: string[]) {
    if (actor.role === "HR" || actor.role === "IT") return true
    if (actor.id !== targetUser.id) return false
    return keys.every((key) => key === "phone" || key === "picture")
}
