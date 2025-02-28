'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { requestPasswordResetSchema } from '@workspace/api/src/modules/auth/schema';
import type { RequestPasswordResetInput } from '@workspace/api/src/modules/auth/schema';

export function ForgotPasswordForm() {
    const { requestPasswordReset } = useAuthContext();
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    // Forgot password form
    const form = useForm<RequestPasswordResetInput>({
        resolver: zodResolver(requestPasswordResetSchema),
        defaultValues: {
            email: '',
        },
    });

    // Handle forgot password submission
    const onSubmit = async (data: RequestPasswordResetInput) => {
        const response = await requestPasswordReset(data.email);

        if (response.success) {
            setIsSubmitted(true);
        }
    };

    // If the request has been submitted, show a success message
    if (isSubmitted) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Check Your Email</CardTitle>
                    <CardDescription>
                        We've sent password reset instructions to your email address.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">
                        Please check your inbox and follow the link to reset your password.
                        If you don't see the email, check your spam folder.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button asChild variant="outline">
                        <Link href="/login">Return to login</Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Forgot Password</CardTitle>
                <CardDescription>
                    Enter your email and we'll send you a link to reset your password
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
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
                        <Button type="submit" className="w-full">
                            Send Reset Link
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