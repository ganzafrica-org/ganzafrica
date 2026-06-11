import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Sign in | PsalmHR",
    description: "Sign in to your PsalmHR account",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full">
            {children}
        </div>
    )
}
