"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@workspace/ui"
import { toast } from "sonner"
import { authApi } from "@/lib/api/auth"

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [token, setToken] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [resetComplete, setResetComplete] = useState(false)

    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const tokenParam = searchParams.get("token")
        if (tokenParam) {
            setToken(tokenParam)
        } else {
            toast.error("Invalid or missing reset token")
        }
    }, [searchParams])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setIsLoading(true)

        try {