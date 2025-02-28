'use client';

import { SignupForm } from '@/components/auth';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';

export default function SignupPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
            <div className="mb-8 flex flex-col items-center">
                <Logo className="h-12 w-auto" />
                <h1 className="mt-4 text-2xl font-bold tracking-tight">
                    Create your GanzAfrica account
                </h1>
                <p className="mt-2 text-center text-muted-foreground">
                    Join the community of fellows, alumni, and partners working on sustainable land management in Rwanda
                </p>
            </div>
            <div className="w-full max-w-md">
                <SignupForm />
            </div>
        </div>
    );
}