"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "../navbar"
import { SubNavbar } from "../sub-navbar"

export function ConditionalAppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAuthRoute = pathname?.startsWith("/auth")

    if (isAuthRoute) {
        return <>{children}</>
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#f6f8fb] text-slate-900 dark:bg-slate-950 dark:text-white">
            <Navbar />
            <SubNavbar />
            <main className="mx-auto w-full max-w-[80%] flex-1 overflow-auto">
                {children}
            </main>
        </div>
    )
}
