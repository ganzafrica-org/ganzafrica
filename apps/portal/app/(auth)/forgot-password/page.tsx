'use client';

import { ForgotPasswordForm } from '@/components/auth';
import { Logo } from '@/components/ui/logo';

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
            <div className="mb-8 flex flex-col items-center">
                <Logo className="h-12 w-auto" />
                <h1 className="mt-4 text-2xl font-bold tracking-tight">
                    Forgot Password
                </h1>
                <p className="mt-2 text-center text-muted-foreground">
                    Enter your email address and we'll send you a link to reset your password
                </p>
            </div>
            <div className="w-full max-w-md">
                <ForgotPasswordForm />
            </div>
        </div>
    );
}