"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, User, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";

interface NavbarProps {
  onMenuClick: () => void;
  onMobileMenuClick?: () => void;
  isSidebarCollapsed: boolean;
}

const Navbar = ({ onMenuClick, onMobileMenuClick }: NavbarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, logout, isLoading } = useAuth();

  const getInitials = () => {
    if (!user?.name) {
      if (user?.email) return user.email.substring(0, 2).toUpperCase();
      return "US";
    }

    const parts = user.name.trim().split(" ");
    return parts.length === 1
      ? parts[0].substring(0, 2).toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (isLoading) {
    return (
      <div className="h-16 bg-white dark:bg-gray-800 border-b flex items-center px-6 shadow-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-16 bg-white dark:bg-gray-800 border-b flex items-center justify-between px-6 shadow-sm sticky top-0 z-50">
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Desktop Sidebar Toggle */}
        <button
          onClick={onMenuClick}
          className="hidden md:block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Mobile Sidebar Toggle */}
        <button
          onClick={onMobileMenuClick}
          className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Internal Portal</h1>
      </div>

      {/* Right */}
      <div className="flex items-center space-x-2">
        {user && (
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center space-x-3 cursor-pointer p-1.5 pl-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              onClick={toggleDropdown}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-[#045F3C] flex items-center justify-center text-white">
                <span className="text-sm font-medium">{getInitials()}</span>
              </div>

              {/* Name - Hidden on Mobile */}
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.name || user.email}
              </span>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  {user.role_name && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {user.role_name}
                    </p>
                  )}
                </div>

                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
