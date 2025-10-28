"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { LogOut, Users, CheckSquare, ArrowRight, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function PlatformSelectionPage(): React.JSX.Element {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            toast.error('Please log in first');
            router.push('/login');
            return;
        }

        // Get user data from localStorage (stored during login)
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing user data:', error);
                // If parsing fails, try to get user from token
                try {
                    const { jwtDecode } = require('jwt-decode');
                    const decoded = jwtDecode(token);
                    setUser({
                        id: decoded.id,
                        name: decoded.name,
                        email: decoded.email,
                        role_id: decoded.role_id,
                        role_name: decoded.role_name,
                        avatar_url: decoded.avatar_url,
                        email_verified: decoded.email_verified
                    });
                } catch (tokenError) {
                    console.error('Error decoding token:', tokenError);
                    setUser({
                        name: 'User',
                        email: 'user@ganzafrica.org',
                        role: 'user'
                    });
                }
            }
        } else {
            // If no user data in localStorage, try to get from token
            try {
                const { jwtDecode } = require('jwt-decode');
                const decoded = jwtDecode(token);
                setUser({
                    id: decoded.id,
                    name: decoded.name,
                    email: decoded.email,
                    role_id: decoded.role_id,
                    role_name: decoded.role_name,
                    avatar_url: decoded.avatar_url,
                    email_verified: decoded.email_verified
                });
            } catch (error) {
                console.error('Error decoding token:', error);
                setUser({
                    name: 'User',
                    email: 'user@ganzafrica.org',
                    role: 'user'
                });
            }
        }
        
        setIsLoading(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        router.push('/login');
    };

    const handlePlatformSelect = (platform: 'portal' | 'task') => {
        if (platform === 'portal') {
            router.push('/dashboard');
        } else {
            // Pass authentication data to task management app
            const token = localStorage.getItem('accessToken');
            const userData = localStorage.getItem('user');
            
            // Create URL with authentication parameters
            const taskManagementUrl = new URL('http://localhost:3003/board');
            if (token) {
                taskManagementUrl.searchParams.set('token', token);
            }
            if (userData) {
                taskManagementUrl.searchParams.set('user', encodeURIComponent(userData));
            }
            
            // Redirect to task management app board page with authentication
            window.location.href = taskManagementUrl.toString();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            {/* Main Container - Centered */}
            <div className="bg-white p-8 w-full max-w-6xl">
                {/* Header - Centered */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Welcome back, <span className="text-blue-600">{user?.name || 'User'}</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-6">Choose your platform to continue</p>
                    {user?.email && (
                        <p className="text-sm text-gray-500">
                            Logged in as: <span className="font-medium">{user.email}</span>
                            {user?.role_name && (
                                <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs">
                                    {user.role_name}
                                </span>
                            )}
                        </p>
                    )}
                </div>

                {/* User Profile and Logout - Top Right */}
                <div className="absolute top-8 right-8 flex items-center gap-3">
                    {user?.avatar_url ? (
                        <img 
                            src={user.avatar_url} 
                            alt={user.name} 
                            className="w-10 h-10 rounded-full border-2 border-gray-200"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    )}
                    <Button 
                        variant="outline" 
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>

                {/* Platform Cards - Centered */}
                <div className="flex justify-center">
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
                    {/* Portal Platform */}
                    <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-200">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Users className="h-10 w-10 text-white" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900">Portal</CardTitle>
                            <CardDescription className="text-gray-600">
                                Access your organization's main portal with projects, teams, and content management
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Project Management</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Team Collaboration</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Content & News Management</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Partnership & Opportunities</span>
                                </div>
                            </div>
                            <Button 
                                onClick={() => handlePlatformSelect('portal')}
                                className="w-full bg-green-600 hover:bg-green-700 text-white group-hover:bg-green-700 transition-colors duration-300"
                            >
                                Access Portal
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Task Management Platform */}
                    <Card className="group hover:shadow-xl transition-all duration-300 border-2" style={{ borderColor: '#e5e7eb' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#076297'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}>
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto mb-4 w-20 h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#076297' }}>
                                <CheckSquare className="h-10 w-10 text-white" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900">Task Management</CardTitle>
                            <CardDescription className="text-gray-600">
                                Manage tasks, track progress, and collaborate with your team using Kanban boards
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#076297' }}></div>
                                    <span>Kanban Board Management</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#076297' }}></div>
                                    <span>Task Assignment & Tracking</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#076297' }}></div>
                                    <span>Team Collaboration</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#076297' }}></div>
                                    <span>Progress Reports & Analytics</span>
                                </div>
                            </div>
                            <Button 
                                onClick={() => handlePlatformSelect('task')}
                                className="w-full text-white transition-colors duration-300"
                                style={{ backgroundColor: '#076297' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#065a7a'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#076297'}
                            >
                                Access Task Management
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </Button>
                        </CardContent>
                    </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
