"use client"

import { useRequireAuth } from "@/hooks/use-auth"
import { TopNavigation } from "@/components/navigation/site-header"
import React from "react"
import { Loader2 } from "lucide-react"

function AppLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-green-50">
            <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
                <p className="text-sm text-gray-600">Loading GanzAfrica Platform...</p>
            </div>
        </div>
    )
}


export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
    const auth = useRequireAuth()

    if (auth.isLoading) {
        return <AppLoader />
    }

    if (!auth.isAuthenticated) {
        return <AppLoader />
    }


    return (
        <div className="min-h-screen bg-gray-50">
            <TopNavigation />

            <div className="flex flex-col">
                <main className="flex-1 px-2 md:px-1 py-4">
                    {children}
                </main>
            </div>
        </div>
    )
}