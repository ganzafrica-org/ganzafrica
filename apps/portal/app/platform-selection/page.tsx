"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from '@workspace/ui/components/dialog';
import { LogOut, Users, CheckSquare, ArrowRight, Shield, User, Globe } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { isAdminOrManager } from '@/lib/auth-utils';

export default function PlatformSelectionPage(): React.JSX.Element {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const [modalAvatarError, setModalAvatarError] = useState(false);


    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            toast.error('Please log in first');
            router.push('/login');
            return;
        }

        // Fetch user profile from API to get complete role information
        const fetchUserProfile = async () => {
            try {
                const response = await apiClient.get('/users/profile/me');
                if (response.data && response.data.profile) {
                    const profile = response.data.profile;
                    setUser({
                        id: profile.id,
                        name: profile.name,
                        email: profile.email,
                        role_id: profile.role_id,
                        role_name: profile.role_name,
                        avatar_url: profile.avatar_url,
                        email_verified: profile.email_verified
                    });
                    // Also update localStorage with fresh data
                    localStorage.setItem('user', JSON.stringify(profile));
                    setIsLoading(false);
                    return;
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }

            // Fallback: Get user data from localStorage (stored during login)
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
        };

        fetchUserProfile();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        router.push('/login');
    };

    const handlePlatformSelect = (platform: 'portal' | 'task' | 'website') => {
        if (platform === 'portal') {
            // Check if user is admin or manager before allowing portal access
            if (!isAdminOrManager(user)) {
                toast.error("You are not authenticated to access this platform. Only administrators and managers can access the portal.");
                router.push('/unauthorized');
                return;
            }
            router.push('/dashboard');
        } else if (platform === 'task') {
            // Pass authentication data to task management app
            const token = localStorage.getItem('accessToken');
            const userData = localStorage.getItem('user');
            
            // Use environment variable for task app URL, fallback to localhost for development
            const taskAppUrl = process.env.NEXT_PUBLIC_TASK_URL || 'http://localhost:3003';
            const taskManagementUrl = new URL(`${taskAppUrl}/auth-callback`);
            if (token) {
                taskManagementUrl.searchParams.set('token', token);
            }
            if (userData) {
                taskManagementUrl.searchParams.set('user', encodeURIComponent(userData));
            }
            
            // Redirect to task management app auth callback page
            window.location.href = taskManagementUrl.toString();
        } else if (platform === 'website') {
            // Use environment variable for website URL, fallback to localhost for development
            const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
            
            // Show a helpful message before redirecting
            toast.info('Redirecting to website...');
            
            // Small delay to let user see the message
            setTimeout(() => {
                window.location.href = websiteUrl;
            }, 300);
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
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
            {/* Main Container - Centered */}
            <div className="bg-white p-4 sm:p-6 lg:p-8 w-full max-w-7xl relative">
                {/* Header - Centered */}
                <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">
                        Welcome back, <span className="text-blue-600">{user?.name || 'User'}</span>
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-5 lg:mb-6">Choose your platform to continue</p>
                </div>

                {/* User Profile and Logout - Top Right */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 lg:top-8 lg:right-8 flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => {
                            setIsProfileModalOpen(true);
                            setModalAvatarError(false);
                        }}
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-2 cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ 
                            backgroundColor: '#045F3C', // Portal sidebar green
                            border: '2px solid rgba(4, 95, 60, 0.3)' // Lighter version of sidebar green
                        }}
                    >
                        {user?.avatar_url && !avatarError ? (
                            <img 
                                src={user.avatar_url.startsWith('http') 
                                    ? user.avatar_url 
                                    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}${user.avatar_url}`
                                } 
                                alt={user.name || 'Profile'} 
                                className="w-full h-full object-cover"
                                onError={() => setAvatarError(true)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                    </button>
                    <Button 
                        variant="outline" 
                        onClick={handleLogout}
                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                    >
                        <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>

                {/* Profile Modal */}
                <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profile Information
                            </DialogTitle>
                            <DialogDescription>
                                Your account details
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="flex items-center justify-center mb-4">
                                <div 
                                    className="w-20 h-20 rounded-full overflow-hidden"
                                    style={{ 
                                        border: '2px solid rgba(4, 95, 60, 0.3)', // Lighter version of sidebar green (#045F3C)
                                        backgroundColor: '#045F3C' // Portal sidebar green
                                    }}
                                >
                                    {user?.avatar_url && !modalAvatarError ? (
                                        <img 
                                            src={user.avatar_url.startsWith('http') 
                                                ? user.avatar_url 
                                                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}${user.avatar_url}`
                                            } 
                                            alt={user.name || 'Profile'} 
                                            className="w-full h-full object-cover"
                                            onError={() => setModalAvatarError(true)}
                                        />
                                    ) : (
                                        <div 
                                            className="w-full h-full flex items-center justify-center text-white text-2xl font-semibold"
                                            style={{ backgroundColor: '#045F3C' }}
                                        >
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Name</label>
                                    <p className="text-base font-semibold text-gray-900 mt-1">{user?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="text-base font-semibold text-gray-900 mt-1">{user?.email || 'N/A'}</p>
                                </div>
                                {user?.role_name && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Role</label>
                                        <p className="text-base font-semibold text-gray-900 mt-1">
                                            <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                                                {user.role_name}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Platform Cards - Centered */}
                <div className="flex justify-center">
                    <div className={`grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 w-full ${isAdminOrManager(user) ? 'max-w-7xl md:grid-cols-2 lg:grid-cols-3' : 'max-w-4xl md:grid-cols-2'}`}>
                    {/* Portal Platform - Only visible to Admin and Manager */}
                    {isAdminOrManager(user) && (
                    <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary-green">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto mb-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-green to-[#045F3C] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Users className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                            </div>
                            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Portal</CardTitle>
                            <CardDescription className="text-gray-600 text-sm sm:text-base">
                                Access your organization's main portal with projects, teams, and content management
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-primary-green rounded-full"></div>
                                    <span>Project Management</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-primary-green rounded-full"></div>
                                    <span>Team Collaboration</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-primary-green rounded-full"></div>
                                    <span>Content & News Management</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-primary-green rounded-full"></div>
                                    <span>Partnership & Opportunities</span>
                                </div>
                            </div>
                            <Button 
                                onClick={() => handlePlatformSelect('portal')}
                                className="w-full bg-primary-green hover:bg-[#045F3C] text-white group-hover:bg-[#045F3C] transition-colors duration-300 text-sm sm:text-base"
                            >
                                Access Portal
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </Button>
                        </CardContent>
                    </Card>
                    )}

                    {/* Website Platform */}
                    <Card className="group hover:shadow-xl transition-all duration-300 border-2" style={{ borderColor: '#e5e7eb' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f8ba1d'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}>
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto mb-4 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#f8ba1d' }}>
                                <Globe className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                            </div>
                            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Website</CardTitle>
                            <CardDescription className="text-gray-600 text-sm sm:text-base">
                                Visit the public-facing website to explore programs, news, and opportunities
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f8ba1d' }}></div>
                                    <span>Public Content & News</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f8ba1d' }}></div>
                                    <span>Programs & Opportunities</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f8ba1d' }}></div>
                                    <span>About & Contact Information</span>
                                </div>
                            </div>
                            <Button 
                                onClick={() => handlePlatformSelect('website')}
                                className="w-full text-white transition-colors duration-300 text-sm sm:text-base"
                                style={{ backgroundColor: '#f8ba1d' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d99f19'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8ba1d'}
                            >
                                Visit Website
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Task Management Platform */}
                    <Card className="group hover:shadow-xl transition-all duration-300 border-2" style={{ borderColor: '#e5e7eb' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#076297'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}>
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto mb-4 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#076297' }}>
                                <CheckSquare className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                            </div>
                            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Task Management</CardTitle>
                            <CardDescription className="text-gray-600 text-sm sm:text-base">
                                Manage tasks, track progress, and collaborate with your team using Kanban boards
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#076297' }}></div>
                                    <span>Kanban Board Management</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#076297' }}></div>
                                    <span>Task Assignment & Tracking</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#076297' }}></div>
                                    <span>Team Collaboration</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#076297' }}></div>
                                    <span>Progress Reports & Analytics</span>
                                </div>
                            </div>
                            <Button 
                                onClick={() => handlePlatformSelect('task')}
                                className="w-full text-white transition-colors duration-300 text-sm sm:text-base"
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
