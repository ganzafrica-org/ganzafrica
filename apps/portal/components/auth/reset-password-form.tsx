'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@workspace/ui/components/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@workspace/ui/components/card';

import { useAuthContext } from './auth-provider';
import { resetPasswordSchema } from '@workspace/api/src/modules/auth/schema';
import type { ResetPasswordInput } from '@workspace/api/src/modules/auth/schema';

export function ResetPasswordForm() {
    const { resetPassword } = useAuthContext();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';

    // Reset password form
    const form = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            token,
            password: '',
            confirmPassword: '',
        },
    });

    // Handle reset password submission
    const onSubmit = async (data: ResetPasswordInput) => {
        const response = await resetPassword(data);

        if (response.success) {
            // After successful password reset, redirect to login
            router.push('/login');
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription>
                    Enter your new password to reset your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="••••••••" type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="••••••••" type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">
                            Reset Password
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Remember your password?{' '}
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Log in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}