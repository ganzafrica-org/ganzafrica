'use client';

import { LoginForm } from '@/components/auth';

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/30 px-4">
            <div className="w-full max-w-md">
                <LoginForm />
            </div>
        </div>
    );
}