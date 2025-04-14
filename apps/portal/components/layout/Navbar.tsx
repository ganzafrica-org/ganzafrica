"use client";

import { useState, useRef, useEffect } from 'react';
import { Bell, HelpCircle, Menu, User, Settings, LogOut, Info, Check, X } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/components/auth/auth-provider';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';

interface UserData {
  id: number;
  email: string;
  name: string;
  base_role: string;
  avatar_url?: string;
  email_verified: boolean;
  is_active: boolean;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: string;
  priority: 'normal' | 'high';
}

// Add mock notifications (we'll move this to a proper state management later)
const mockNotifications: Notification[] = [
  {
    id: 1,
    title: "New Article Published",
    message: "Your article 'Getting Started with React' has been published",
    time: "2 hours ago",
    isRead: false,
    type: "article",
    priority: "normal"
  },
  {
    id: 2,
    title: "System Maintenance",
    message: "Scheduled maintenance will occur on Saturday at 2 AM",
    time: "1 day ago",
    isRead: false,
    type: "system",
    priority: "high"
  }
];

interface NavbarProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
  currentUser?: UserData | null;
}

const Navbar = ({ onMenuClick, isSidebarCollapsed, currentUser: propCurrentUser }: NavbarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  
  // Get auth context
  const { user, logout } = useAuth();
  
  // Transform auth user to match UserData interface or use prop if provided
  const currentUser = propCurrentUser || (user ? {
    id: parseInt(user.id),
    email: user.email,
    name: user.name,
    base_role: user.role || '',
    email_verified: true,
    is_active: true
  } : null);

  // Generate initials from the user's full name
  const getInitials = () => {
    if (!currentUser?.name) return 'GU';
    
    // Split the name into parts and get the first letter of each part
    const nameParts = currentUser.name.trim().split(/\s+/);
    
    if (nameParts.length === 1) {
      // If single name, take first two letters or first letter twice
      return (nameParts[0]?.substring(0, 2) ?? '').toUpperCase();
    }
    
    // Take first letter of first name and first letter of last name
    return ((nameParts[0]?.[0] || '') + (nameParts[nameParts.length - 1]?.[0] || '')).toUpperCase();
  };

  // Get user's display name - No longer using "Guest User" fallback
  const getDisplayName = () => {
    return currentUser?.name || '';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  // Round up to the nearest even number
  const displayCount = unreadCount % 2 === 0 ? unreadCount : unreadCount + 1;

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  // Handle logout
  const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setAuthError(null);
    
    try {
      setIsLoggingOut(true);
      await logout();
      
      // Close dropdown
      setIsDropdownOpen(false);
      
      // Redirect to login page after successful logout
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      
      // Check if we have a structured error response
      if (error instanceof Error) {
        setAuthError(error.message);
      } else {
        setAuthError('An error occurred during logout. Please try again.');
      }
      
      // If error is about not being logged in, redirect to login page
      if (typeof error === 'object' && error !== null && 'json' in error) {
        const jsonError = (error as any).json;
        if (jsonError?.code === -32001 && jsonError?.message === "You must be logged in to access this resource") {
          console.log("Session expired, redirecting to login");
          // Clear any local auth state
          localStorage.removeItem('auth_state');
          sessionStorage.removeItem('auth_state');
          
          // Redirect to login
          window.location.href = '/login';
        }
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Check for auth token on mount
  useEffect(() => {
    // Only check auth in production
    if (process.env.NODE_ENV === 'production') {
      const checkAuthStatus = () => {
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key) {
            acc[key] = value || '';
          }
          return acc;
        }, {} as Record<string, string>);
        
        if (!cookies.auth_token && !currentUser) {
          console.log("No auth token found, redirecting to login");
          window.location.href = '/login';
        }
      };
      
      checkAuthStatus();
    }
  }, [currentUser]);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Handle dark mode toggle
  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    localStorage.setItem('darkMode', String(checked));
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
            aria-label={`View notifications (${unreadCount} unread)`}
            title={`View notifications (${unreadCount} unread)`}
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-primary-green text-white text-xs font-medium px-1.5 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-800">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-100 dark:border-gray-700">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold dark:text-white">Notifications</h3>
                <Link 
                  href="/notifications"
                  className="text-sm text-primary-green hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                >
                  View All
                </Link>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div 
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-start justify-between ${
                        !notification.isRead ? 'bg-green-50/50 dark:bg-green-900/10' : ''
                      }`}
                    >
                      <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium dark:text-white">{notification.title}</h4>
                          {!notification.isRead && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full dark:bg-green-900/50 dark:text-green-400">
                              New
                            </span>
                          )}
                          {notification.priority === 'high' && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full dark:bg-red-900/50 dark:text-red-400">
                              High Priority
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">{notification.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/50 p-1"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50 p-1"
                          title="Delete notification"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                  <Link 
                    href="/notifications"
                    className="text-sm text-center block w-full text-primary-green hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    See all notifications
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        
        <button 
          className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
          aria-label="Get help"
        >
          <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200" />
        </button>
        
        {currentUser ? (
          <div className="relative" ref={dropdownRef}>
            <div 
              className="flex items-center space-x-3 cursor-pointer p-1.5 pl-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={toggleDropdown}
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-primary-green text-white flex items-center justify-center">
                {currentUser?.avatar_url ? (
                  <Image
                    src={currentUser.avatar_url}
                    alt={getDisplayName()}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium">{getInitials()}</span>
                )}
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-200">{getDisplayName()}</span>
              <svg 
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-100 dark:border-gray-700">
                {authError && (
                  <div className="px-4 py-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/50 dark:text-red-400 mb-2 rounded mx-2">
                    {authError}
                  </div>
                )}
                
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary-green text-white flex items-center justify-center">
                      {currentUser?.avatar_url ? (
                        <Image
                          src={currentUser.avatar_url}
                          alt={getDisplayName()}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">{getInitials()}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{getDisplayName()}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="py-1">
                  <a href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-green hover:text-white group mx-2 rounded-lg transition-colors">
                    <User className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-white" />
                    Profile
                  </a>
                  <a href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-green hover:text-white group mx-2 rounded-lg transition-colors">
                    <Settings className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-white" />
                    Settings
                  </a>
                </div>
                
                <div className="py-1 border-t border-gray-100 dark:border-gray-700">
                  <a href="/help" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-green hover:text-white group mx-2 rounded-lg transition-colors">
                    <Info className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-white" />
                    Help Center
                  </a>
                </div>
                
                <div className="py-1 border-t border-gray-100 dark:border-gray-700">
                  <div className="px-4 py-2 flex items-center space-x-2">
                    <Checkbox 
                      id="dark-mode" 
                      checked={isDarkMode}
                      onCheckedChange={handleDarkModeToggle}
                    />
                    <label
                      htmlFor="dark-mode"
                      className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      Dark Mode
                    </label>
                  </div>
                </div>
                
                <div className="py-1 border-t border-gray-100 dark:border-gray-700">
                  <a 
                    href="#" 
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-green hover:text-white group mx-2 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-white" />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Navbar;