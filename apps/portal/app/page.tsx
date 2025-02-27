"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { useAuth } from "@/lib/auth/auth-context"

export default function DashboardPage() {
    const { user, isLoading, logout } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-pulse h-6 w-6 rounded-full bg-primary"></div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen p-4">
            <header className="flex items-center justify-between mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold">GanzAfrica Portal</h1>
                {user ? (
                    <div className="flex gap-4 items-center">
                        <div className="text-sm">
                            Logged in as <span className="font-medium">{user.name}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={logout}>
                            Logout
                        </Button>
                    </div>
                ) : (
                    <Button asChild size="sm">
                        <Link href="/login">Login</Link>
                    </Button>
                )}
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user ? (
                            <div className="space-y-2">
                                <div>
                                    <div className="text-sm font-medium">Name</div>
                                    <div>{user.name}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium">Email</div>
                                    <div>{user.email}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium">Role</div>
                                    <div className="capitalize">{user.role}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-muted-foreground">Not logged in</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            This is a simple dashboard to demonstrate authentication.
                            The real dashboard will be implemented by the UI team.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}