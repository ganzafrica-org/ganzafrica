"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  HelpCircle,
  Menu,
  User,
  Settings,
  LogOut,
  Info,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/components/auth/auth-provider";

interface UserData {
  id: number;
  email: string;
  name: string;
  base_role: string;
  avatar_url?: string;
  email_verified: boolean;
  is_active: boolean;
}

interface NavbarProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
  currentUser?: UserData | null;
}

const Navbar = ({
  onMenuClick,
  isSidebarCollapsed,
  currentUser: propCurrentUser,
}: NavbarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get auth context
  const { user, logout } = useAuth();

  // Transform auth user to match UserData interface or use prop if provided
  const currentUser =
    propCurrentUser ||
    (user
      ? {
          id: parseInt(user.id),
          email: user.email,
          name: user.name,
          base_role: user.role || "",
          email_verified: true,
          is_active: true,
        }
      : null);

  // Generate initials from the user's full name
  const getInitials = () => {
    if (!currentUser?.name) return "GU";

    // Split the name into parts and get the first letter of each part
    const nameParts = currentUser.name.trim().split(/\s+/);

    if (nameParts.length === 1) {
      // If single name, take first two letters or first letter twice
      return (nameParts[0]?.substring(0, 2) ?? "").toUpperCase();
    }

    // Take first letter of first name and first letter of last name
    return (
      (nameParts[0]?.[0] || "") + (nameParts[nameParts.length - 1]?.[0] || "")
    ).toUpperCase();
  };

  // Get user's display name - No longer using "Guest User" fallback
  const getDisplayName = () => {
    return currentUser?.name || "";
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
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);

      // Check if we have a structured error response
      if (error instanceof Error) {
        setAuthError(error.message);
      } else {
        setAuthError("An error occurred during logout. Please try again.");
      }

      // If error is about not being logged in, redirect to login page
      if (typeof error === "object" && error !== null && "json" in error) {
        const jsonError = (error as any).json;
        if (
          jsonError?.code === -32001 &&
          jsonError?.message === "You must be logged in to access this resource"
        ) {
          console.log("Session expired, redirecting to login");
          // Clear any local auth state
          localStorage.removeItem("auth_state");
          sessionStorage.removeItem("auth_state");

          // Redirect to login
          window.location.href = "/login";
        }
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Check for auth token on mount
  useEffect(() => {
    // Check if we have a valid auth token (could be in a cookie, local storage, etc.)
    const checkAuthStatus = () => {
      const cookies = document.cookie.split(";").reduce(
        (acc, cookie) => {
          const [key, value] = cookie.trim().split("=");
          if (key) {
            acc[key] = value || "";
          }
          return acc;
        },
        {} as Record<string, string>,
      );

      if (!cookies.auth_token && !currentUser) {
        console.log("No auth token found, redirecting to login");
        window.location.href = "/login";
      }
    };

    checkAuthStatus();
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>

        <div className="flex items-center">
          <h1 className="font-h5">Dashboard</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-full">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
        </button>

        <button className="p-2 hover:bg-gray-100 rounded-full">
          <HelpCircle className="w-5 h-5 text-gray-600" />
        </button>

        {currentUser ? (
          // Only show user profile dropdown if logged in
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center space-x-2 cursor-pointer p-1 pl-2 hover:bg-gray-100 rounded-lg"
              onClick={toggleDropdown}
            >
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-primary-green text-white flex items-center justify-center">
                {currentUser?.avatar_url ? (
                  <Image
                    src={currentUser.avatar_url}
                    alt={getDisplayName()}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-sm font-bold">{getInitials()}</span>
                )}
              </div>
              <span className="font-medium-paragraph text-gray-800">
                {getDisplayName()}
              </span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-200">
                {authError && (
                  <div className="px-4 py-2 text-sm text-red-600 bg-red-50 mb-2 rounded mx-2">
                    {authError}
                  </div>
                )}

                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary-green text-white flex items-center justify-center">
                      {currentUser?.avatar_url ? (
                        <Image
                          src={currentUser.avatar_url}
                          alt={getDisplayName()}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-bold">
                          {getInitials()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium-paragraph text-gray-800">
                        {getDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentUser?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 font-regular-paragraph text-gray-700 hover:bg-primary-green hover:text-white group mx-2 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4 mr-3 text-gray-500 group-hover:text-white" />
                    Profile
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 font-regular-paragraph text-gray-700 hover:bg-primary-green hover:text-white group mx-2 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3 text-gray-500 group-hover:text-white" />
                    Settings
                  </a>
                </div>

                <div className="py-1 border-t border-gray-100">
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 font-regular-paragraph text-gray-700 hover:bg-primary-green hover:text-white group mx-2 rounded-lg transition-colors"
                  >
                    <Info className="w-4 h-4 mr-3 text-gray-500 group-hover:text-white" />
                    Help Center
                  </a>
                </div>

                <div className="py-1 border-t border-gray-100">
                  <a
                    href="#"
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 font-regular-paragraph text-gray-700 hover:bg-primary-green hover:text-white group mx-2 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3 text-gray-500 group-hover:text-white" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
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
