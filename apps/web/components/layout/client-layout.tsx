"use client";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { TranslationProvider } from "@/context/translation";
import { useLayoutEffect, useState } from 'react';

export default function ClientLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    const [hideLayout, setHideLayout] = useState(false);

    useLayoutEffect(() => {
        // Check if we're on a not-found page by looking for the data attribute
        const checkNotFound = () => {
            const notFoundElement = document.querySelector('[data-not-found="true"]');
            setHideLayout(!!notFoundElement);
        };

        // Check immediately
        checkNotFound();

        // Also use MutationObserver to catch it if it renders after
        const observer = new MutationObserver(checkNotFound);
        observer.observe(document.body, { childList: true, subtree: true });

        // Fallback check after a short delay
        const timeoutId = setTimeout(checkNotFound, 0);

        return () => {
            observer.disconnect();
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
        >
            <TranslationProvider sourceLanguage="en">
                    <div className="relative flex min-h-screen flex-col">
                        {!hideLayout && <Header />}
                        <div className="flex-1">{children}</div>
                        {!hideLayout && <Footer />}
                    </div>
            </TranslationProvider>
        </NextThemesProvider>
    );
}