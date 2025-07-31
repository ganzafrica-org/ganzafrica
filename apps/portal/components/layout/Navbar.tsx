"use client";

import { useState, useRef, useEffect } from 'react';
import { Bell, HelpCircle, Menu, User, Settings, LogOut, Info, Check, X } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/components/auth/auth-provider';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { jwtDecode } from 'jwt-decode';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, type Notification } from '@/services/notifications';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface NavbarProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
}

const Navbar = ({ onMenuClick, isSidebarCollapsed }: NavbarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Get auth context
  const { user, logout, isLoading } = useAuth();
  
  // Console log the logged-in user details and token for debugging
  useEffect(() => {
    console.log('Logged-in user details:', user);
    
    // Also check the raw token contents
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        // Use the imported jwtDecode function instead of require
        const decodedToken = jwtDecode(token);
        console.log('Raw token payload:', decodedToken);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.log('No access token found in localStorage');
    }
  }, [user]);

  // Fetch notifications
  const { data: notificationsData, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationService.getNotifications(page, 5),
    enabled: isNotificationsOpen,
  });

  // Fetch unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to mark notification as read');
      console.error('Error marking notification as read:', error);
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to delete notification');
      console.error('Error deleting notification:', error);
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('All notifications marked as read');
    },
    onError: (error: Error) => {
      toast.error('Failed to mark all notifications as read');
      console.error('Error marking all notifications as read:', error);
    },
  });

  // Update WebSocket subscription with proper type
  useEffect(() => {
    if (user) {
      notificationService.initializeWebSocket();
      
      const unsubscribe = notificationService.subscribe((notification: Notification) => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        toast(notification.message, {
          description: notification.title,
          duration: 5000,
        });
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user, queryClient]);

  // Generate initials from the user's full name
  const getInitials = () => {
    if (!user?.name) {
      // If no name is available, take first two letters of email or return default
      if (user?.email) {
        return user.email.substring(0, 2).toUpperCase();
      }
      return "US"; // "User" default
    }

    // Split the name into parts and get the first letter of each part
    const nameParts = user.name.trim().split(/\s+/);

    if (nameParts.length === 1) {
      // If single name, take first two letters
      return (nameParts[0]?.[0] || "") + (nameParts[nameParts.length - 1]?.[0] || "").toUpperCase();
    }

    // Take first letter of first name and first letter of last name
    return (
      (nameParts[0]?.[0] || "") + (nameParts[nameParts.length - 1]?.[0] || "")
    ).toUpperCase();
  };

  const handleMarkAsRead = async (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleDeleteNotification = async (id: number) => {
    deleteNotificationMutation.mutate(id);
  };

  const handleMarkAllAsRead = async () => {
    markAllAsReadMutation.mutate();
  };

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to handle logout with our token-based authentication
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      await logout();
      // Redirect is handled in the auth context's logout function
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // If still loading, return a loading placeholder
  if (isLoading) {
    return (
        <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
          <div>Loading...</div>
        </div>
    );
  }

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
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-sm text-primary-green hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Mark all as read
                        </button>
                      )}
                      <Link
                        href="/notifications"
                        className="text-sm text-primary-green hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      >
                        View All
                      </Link>
                    </div>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {isLoadingNotifications ? (
                      <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        <div className="animate-pulse space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                          ))}
                        </div>
                      </div>
                    ) : notificationsData?.notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      <>
                        {notificationsData?.notifications.map((notification: Notification) => (
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
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/50 p-1"
                                  title="Mark as read"
                                  disabled={markAsReadMutation.isPending}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50 p-1"
                                title="Delete notification"
                                disabled={deleteNotificationMutation.isPending}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {notificationsData?.hasMore && (
                          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                            <button
                              onClick={() => setPage(p => p + 1)}
                              className="text-sm text-center block w-full text-primary-green hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                            >
                              Load more
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {notificationsData?.notifications?.length > 0 && (
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

          {user ? (
              <div className="relative" ref={dropdownRef}>
                <div
                    className="flex items-center space-x-3 cursor-pointer p-1.5 pl-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-primary-green text-white flex items-center justify-center">
                    <span className="text-sm font-medium">{getInitials()}</span>
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-200">{user.name}</span>
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
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary-green text-white flex items-center justify-center">
                            <span className="text-sm font-medium">{getInitials()}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-green hover:text-white group mx-2 rounded-lg transition-colors">
                          <User className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-white" />
                          Profile
                        </Link>
                        <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-green hover:text-white group mx-2 rounded-lg transition-colors">
                          <Settings className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-white" />
                          Settings
                        </Link>
                      </div>

                      <div className="py-1 border-t border-gray-100 dark:border-gray-700">
                        <Link href="/help" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-green hover:text-white group mx-2 rounded-lg transition-colors">
                          <Info className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-white" />
                          Help Center
                        </Link>
                      </div>

                      <div className="py-1 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-green hover:text-white group mx-2 rounded-lg transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-white" />
                          Logout
                        </button>
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