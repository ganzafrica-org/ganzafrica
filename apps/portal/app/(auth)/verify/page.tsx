'use client';

import { VerifyEmail } from '@/components/auth';
import { Logo } from '@/components/ui/logo';

export default function VerifyEmailPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
            <div className="mb-8 flex flex-col items-center">
                <Logo className="h-12 w-auto" />
                <h1 className="mt-4 text-2xl font-bold tracking-tight">
                    Email Verification
                </h1>
            </div>
            <div className="w-full max-w-md">
                <VerifyEmail />
            </div>
        </div>
    );
}