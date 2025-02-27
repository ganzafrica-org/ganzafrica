"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@workspace/ui/components/card"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth/auth-context"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [twoFactorRequired, setTwoFactorRequired] = useState(false)
    const [twoFactorCode, setTwoFactorCode] = useState("")
    const [tempToken, setTempToken] = useState("")

    const router = useRouter()
    const { login, verifyTwoFactor } = useAuth()

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await login(email, password)

            if (result.success) {
                router.push("/")
            } else if (result.requiresTwoFactor) {
                setTwoFactorRequired(true)
                setTempToken(result.tempToken || "")
            } else {
                toast.error("Invalid email or password")
            }
        } catch (error) {
            toast.error("Failed to log in")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleTwoFactorVerification(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await verifyTwoFactor(tempToken, twoFactorCode)

            if (result.success) {
                router.push("/")
            } else {
                toast.error("Invalid verification code")
            }
        } catch (error) {
            toast.error("Failed to verify code")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Login</CardTitle>
                    <CardDescription>
                        Enter your email and password to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!twoFactorRequired ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">Email</label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Logging in..." : "Login"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleTwoFactorVerification} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="twoFactorCode" className="text-sm font-medium">Verification Code</label>
                                <Input
                                    id="twoFactorCode"
                                    type="text"
                                    placeholder="Enter your verification code"
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Verifying..." : "Verify"}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-center">
                        Don't have an account?{" "}
                        <Link
                            href="/register"
                            className="text-primary hover:underline"
                        >
                            Register
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}