"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "@workspace/ui/components/sonner"
import { TrpcProvider } from "./trpc-provider"
import { AuthProvider } from "@/lib/auth/auth-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <TrpcProvider baseUrl={API_URL}>
            <AuthProvider>
                <NextThemesProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                    enableColorScheme
                >
                    {children}
                    <Toaster position="top-right" />
                </NextThemesProvider>
            </AuthProvider>
        </TrpcProvider>
    )
}