"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Leaf, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const success = await login({ email, password });
            if (success) {
                // Redirect based on role - will be handled by middleware
                router.push('/dashboard');
            } else {
                setError('Invalid email or password');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const demoAccounts = [
        { role: 'Admin', email: 'admin@ganzafrica.org', password: 'password' },
        { role: 'HR Staff', email: 'hr@ganzafrica.org', password: 'password' },
        { role: 'Employee', email: 'employee@ganzafrica.org', password: 'password' },
        { role: 'Fellow', email: 'fellow@ganzafrica.org', password: 'password' },
        { role: 'Alumni', email: 'alumni@ganzafrica.org', password: 'password' },
    ];

    const fillDemoCredentials = (email: string, password: string) => {
        setEmail(email);
        setPassword(password);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Logo and Header */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-full">
                            <Leaf className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">GanzAfrica</h1>
                    <p className="text-sm text-gray-600">HR & Alumni Platform</p>
                </div>

                {/* Login Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sign In</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@ganzafrica.org"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        <div className="mt-4 text-center">
                            <Link
                                href="/applicant-check"
                                className="text-sm text-green-600 hover:text-green-700"
                            >
                                Check Application Status
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Demo Accounts */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-blue-900">
                            Demo Accounts (Click to fill)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {demoAccounts.map((account) => (
                            <Button
                                key={account.role}
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-xs border-blue-200 hover:bg-blue-100"
                                onClick={() => fillDemoCredentials(account.email, account.password)}
                                disabled={isLoading}
                            >
                                <span className="font-medium">{account.role}:</span>
                                <span className="ml-1 text-gray-600">{account.email}</span>
                            </Button>
                        ))}
                    </CardContent>
                </Card>

                <div className="text-center text-xs text-gray-500">
                    <p>© 2024 GanzAfrica. All rights reserved.</p>
                    <p className="mt-1">Empowering youth in agriculture and environment sectors</p>
                </div>
            </div>
        </div>
    );
}