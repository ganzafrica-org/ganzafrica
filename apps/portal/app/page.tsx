'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@workspace/ui/components/button"
import { Logo } from "@/components/ui/logo"

export default function Page() {
    const router = useRouter()

    return (
        <div className="flex flex-col items-center justify-center min-h-svh">
            <div className="flex flex-col items-center justify-center gap-6 mb-8">
                <Logo className="text-4xl" />
                <h1 className="text-2xl font-bold">Portal</h1>
                <p className="text-center text-muted-foreground max-w-md">
                    Welcome to the GanzAfrica portal. Please log in to access
                    the dashboard and tools.
                </p>
            </div>
            <div className="flex gap-4">
                <Button
                    size="lg"
                    onClick={() => router.push('/login')}
                >
                    Login
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push('/signup')}
                >
                    Create Account
                </Button>
            </div>
        </div>
    )
}