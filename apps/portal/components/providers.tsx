"use client";

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from "@workspace/ui/components/sonner"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // 1 minute
            retry: 1,
        },
    },
})

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <NextThemesProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
                enableColorScheme
            >
                {children}
                <Toaster 
                    position="top-right"
                    expand={true}
                    richColors
                    closeButton
                />
            </NextThemesProvider>
        </QueryClientProvider>
    )
}
