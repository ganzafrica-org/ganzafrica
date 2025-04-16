"use client";

import { ResetPasswordForm } from "@/components/auth";
import { Logo } from "@/components/ui/logo";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <div className="mb-8 flex flex-col items-center">
        <Logo className="h-12 w-auto" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Reset Your Password
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          Create a new secure password for your account
        </p>
      </div>
      <div className="w-full max-w-md">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
