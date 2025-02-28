"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "@workspace/ui/components/sonner"
import { TrpcProvider } from "./trpc-provider"
import { AuthProvider } from "@/components/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <TrpcProvider baseUrl={API_URL}>
            <NextThemesProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
                enableColorScheme
            >
                <AuthProvider>
                    {children}
                    <Toaster position="top-right" />
                </AuthProvider>
            </NextThemesProvider>
        </TrpcProvider>
    )
}