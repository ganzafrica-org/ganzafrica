'use client';

import { LoginForm } from '@/components/auth';
import {Logo} from "@/components/ui/logo";

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/30 px-4">
            <div className="w-full max-w-md">
                <Logo className="w-24 h-24 mx-auto" />
                <LoginForm />
            </div>
        </div>
    );
}