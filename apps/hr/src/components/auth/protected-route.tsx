"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Role } from "@/types/api"
import { useAuth } from "@/hooks/useAuth"
import { hasRequiredRole } from "@/utils/middleware/auth-guards"

interface ProtectedRouteProps {
    children: React.ReactNode
    roles?: Role[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/hr/login")
            return
        }

        if (roles && user && !hasRequiredRole(user.role as Role, roles)) {
            router.replace("/")
        }
    }, [isAuthenticated, roles, router, user])

    if (!isAuthenticated) return null
    if (roles && user && !hasRequiredRole(user.role as Role, roles)) return null

    return <>{children}</>
}
