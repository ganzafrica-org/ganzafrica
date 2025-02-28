'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@workspace/ui/components/input-otp';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@workspace/ui/components/card';

import { useAuthContext } from './auth-provider';
import type { LoginInput, VerifyTotpInput } from '@workspace/api/src/modules/auth/schema';
import { loginSchema, verifyTotpSchema } from '@workspace/api/src/modules/auth/schema';

export function LoginForm() {
    const { login, verifyTwoFactor, requiresTwoFactor, tempToken, twoFactorMethod } = useAuthContext();
    const router = useRouter();

    // Regular login form
    const loginForm = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // 2FA verification form
    const totpForm = useForm<VerifyTotpInput>({
        resolver: zodResolver(verifyTotpSchema),
        defaultValues: {
            totpCode: '',
            token: tempToken || '',
        },
    });

    // When tempToken changes, update the form
    React.useEffect(() => {
        if (tempToken) {
            totpForm.setValue('token', tempToken);
        }
    }, [tempToken, totpForm]);

    // Handle login submission
    const onLoginSubmit = async (data: LoginInput) => {
        const response = await login(data);

        if (response.success && !requiresTwoFactor) {
            router.push('/dashboard');
        }
    };

    // Handle 2FA verification submission
    const onTotpSubmit = async (data: VerifyTotpInput) => {
        const response = await verifyTwoFactor(data.token, data.totpCode);

        if (response.success) {
            router.push('/dashboard');
        }
    };

    // Render 2FA verification form if required
    if (requiresTwoFactor) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>
                        Enter the verification code from your {twoFactorMethod === 'authenticator' ? 'authenticator app' : 'email'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...totpForm}>
                        <form onSubmit={totpForm.handleSubmit(onTotpSubmit)} className="space-y-6">
                            <FormField
                                control={totpForm.control}
                                name="totpCode"
                                render={({ field }) => (
                                    <FormItem className="mx-auto flex flex-col items-center space-y-2">
                                        <FormControl>
                                            <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                    <InputOTPSlot index={3} />
                                                    <InputOTPSlot index={4} />
                                                    <InputOTPSlot index={5} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">
                                Verify
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        );
    }

    // Render login form
    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Welcome back! Please log in to your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                            control={loginForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="email@example.com" type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="••••••••" type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <Button type="submit" className="w-full">
                            Log in
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-blue-600 hover:underline">
                        Sign up
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}