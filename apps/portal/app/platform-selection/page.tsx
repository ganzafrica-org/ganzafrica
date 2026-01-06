"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import {
  LogOut,
  Users,
  CheckSquare,
  ArrowRight,
  User,
  Globe,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { isAdminOrManager } from "@/lib/auth-utils";

// Helper to check if user is alumni
function isAlumni(user: any): boolean {
  if (!user) return false;
  const roleName = user.role_name?.toLowerCase() || "";
  return roleName.includes("alumni");
}

function PlatformSelectionContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [modalAvatarError, setModalAvatarError] = useState(false);

  // Check for user=alumni param to auto-redirect
  const userTypeParam = searchParams.get("user");

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("accessToken");

    if (!token) {
      toast.error("Please log in first");
      router.push("/login");
      return;
    }

    // Fetch user profile from API to get complete role information
    const fetchUserProfile = async () => {
      // First, try to get user from localStorage for faster initial load
      const cachedUser = localStorage.getItem("user");
      if (cachedUser) {
        try {
          const parsedUser = JSON.parse(cachedUser);
          setUser(parsedUser);
          // Don't redirect yet - wait for fresh API data with role_name
        } catch (error) {
          console.error("Error parsing cached user:", error);
        }
      }

      // Fetch fresh data from API - this has complete user data including role_name
      try {
        const response = await apiClient.get("/users/profile/me");
        if (response.data && response.data.profile) {
          const profile = response.data.profile;
          const userData = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role_id: profile.role_id,
            role_name: profile.role_name,
            avatar_url: profile.avatar_url,
            email_verified: profile.email_verified,
          };
          setUser(userData);
          // Update localStorage with fresh data that includes role_name
          localStorage.setItem("user", JSON.stringify(userData));

          // NOW redirect if user=alumni param is present (after we have role_name)
          if (userTypeParam === "alumni") {
            redirectToAlumni(token, JSON.stringify(userData));
            return;
          }

          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // If API fails but we have cached data, keep using it
        setIsLoading(false);
      }

      // Fallback: Get user data from localStorage (stored during login)
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing user data:", error);
          // If parsing fails, try to get user from token
          try {
            const { jwtDecode } = require("jwt-decode");
            const decoded = jwtDecode(token);
            setUser({
              id: decoded.id,
              name: decoded.name,
              email: decoded.email,
              role_id: decoded.role_id,
              role_name: decoded.role_name,
              avatar_url: decoded.avatar_url,
              email_verified: decoded.email_verified,
            });
          } catch (tokenError) {
            console.error("Error decoding token:", tokenError);
            setUser({
              name: "User",
              email: "user@ganzafrica.org",
              role: "user",
            });
          }
        }
      } else {
        // If no user data in localStorage, try to get from token
        try {
          const { jwtDecode } = require("jwt-decode");
          const decoded = jwtDecode(token);
          setUser({
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            role_id: decoded.role_id,
            role_name: decoded.role_name,
            avatar_url: decoded.avatar_url,
            email_verified: decoded.email_verified,
          });
        } catch (error) {
          console.error("Error decoding token:", error);
          setUser({
            name: "User",
            email: "user@ganzafrica.org",
            role: "user",
          });
        }
      }

      setIsLoading(false);
    };

    fetchUserProfile();
  }, [router, userTypeParam]);

  const redirectToAlumni = (token: string, userData: string) => {
    const alumniAppUrl =
      process.env.NEXT_PUBLIC_ALUMNI_URL || "http://localhost:3004";
    try {
      const alumniUrl = new URL(`${alumniAppUrl}/auth-callback`);
      alumniUrl.searchParams.set("token", token);
      if (userData) {
        alumniUrl.searchParams.set("user", encodeURIComponent(userData));
      }
      toast.info("Redirecting to Alumni Portal...", { duration: 2000 });
      window.location.href = alumniUrl.toString();
    } catch (error) {
      console.error("Error constructing redirect URL:", error);
      toast.error("Failed to redirect. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const handlePlatformSelect = (
    platform: "portal" | "task" | "website" | "alumni",
  ) => {
    if (platform === "portal") {
      // Check if user is admin or manager before allowing portal access
      if (!isAdminOrManager(user)) {
        toast.error(
          "You are not authenticated to access this platform. Only administrators and managers can access the portal.",
        );
        router.push("/unauthorized");
        return;
      }
      router.push("/dashboard");
    } else if (platform === "task") {
      // Pass authentication data to task management app
      const token = localStorage.getItem("accessToken");
      const userData = localStorage.getItem("user");

      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        router.push("/login");
        return;
      }

      // Use environment variable for task app URL, fallback to localhost for development
      const taskAppUrl =
        process.env.NEXT_PUBLIC_TASK_URL || "http://localhost:3003";

      try {
        const taskManagementUrl = new URL(`${taskAppUrl}/auth-callback`);
        if (token) {
          taskManagementUrl.searchParams.set("token", token);
        }
        if (userData) {
          taskManagementUrl.searchParams.set(
            "user",
            encodeURIComponent(userData),
          );
        }

        // Show loading message
        toast.info("Redirecting to Task Management...", { duration: 2000 });

        // Redirect immediately without delay
        window.location.href = taskManagementUrl.toString();
      } catch (error) {
        console.error("Error constructing redirect URL:", error);
        toast.error("Failed to redirect. Please try again.");
      }
    } else if (platform === "alumni") {
      // Pass authentication data to alumni app
      const token = localStorage.getItem("accessToken");
      const userData = localStorage.getItem("user");

      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        router.push("/login");
        return;
      }

      redirectToAlumni(token, userData || "");
    } else if (platform === "website") {
      // Use environment variable for website URL, fallback to localhost for development
      const websiteUrl =
        process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

      // Show a helpful message before redirecting
      toast.info("Redirecting to website...");

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

  // Determine which cards to show
  const showPortal = isAdminOrManager(user);
  // Show Alumni card to both alumni users AND admin/manager users
  const showAlumni = isAlumni(user) || isAdminOrManager(user);
  // Alumni users (not admin/manager) should NOT see Task Management - only Alumni + Website
  const showTask = !isAlumni(user);

  // Calculate grid columns based on visible cards
  let visibleCards = 1; // Website is always visible
  if (showPortal) visibleCards++;
  if (showAlumni) visibleCards++;
  if (showTask) visibleCards++;

  const gridClass =
    visibleCards <= 2
      ? "max-w-4xl md:grid-cols-2"
      : visibleCards === 3
        ? "max-w-6xl md:grid-cols-2 lg:grid-cols-3"
        : "max-w-7xl md:grid-cols-2 lg:grid-cols-4";
  
  // Add class to center 4th card when there are exactly 4 cards in 2-column layout
  const centerFourthCard = visibleCards === 4 ? "center-fourth-card" : "";

  return (
    <div className="min-h-screen flex flex-col relative bg-[#F5F7FA] overflow-y-auto">
      <div className="flex-1 relative flex items-center justify-center overflow-y-auto bg-[#F5F7FA] min-h-screen py-8 md:py-12">
        <div className="hidden md:block absolute bottom-0 left-0 right-0 h-[25vh] min-h-[180px] bg-[#045F3C] z-[1]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 Q50 20 100 0 T100 100 Q50 80 0 100 Z' fill='%23000000' fill-opacity='0.1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}></div>
        
        <div className="w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 relative z-[2] py-2 sm:py-3 md:py-4">
          <div className="fixed top-2 right-2 sm:top-2 sm:right-4 md:top-3 md:right-5 lg:top-3 lg:right-6 flex items-center gap-2 z-[9999] bg-[#F5F7FA] sm:bg-transparent rounded-lg sm:rounded-none p-1 sm:p-0">
            <button
              onClick={() => {
                setIsProfileModalOpen(true);
                setModalAvatarError(false);
              }}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-2 cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
              style={{
                backgroundColor: "#045F3C",
                border: "2px solid rgba(4, 95, 60, 0.3)",
              }}
            >
              {user?.avatar_url && !avatarError ? (
                <img
                  src={
                    user.avatar_url.startsWith("http")
                      ? user.avatar_url
                      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api"}${user.avatar_url}`
                  }
                  alt={user.name || "Profile"}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-shrink-0 whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="inline sm:inline">Logout</span>
            </Button>
          </div>

          {/* Header - Centered - Below Profile/Logout */}
          <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16 xl:mb-20 mt-12 sm:mt-16 md:mt-20 lg:mt-24 xl:mt-28">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight px-2 sm:px-4" style={{ color: '#1e293b' }}>
              Choose the platform to continue
            </h1>
          </div>

          {/* Profile Modal */}
          <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
            <DialogContent className="w-[90%] max-w-[90%] sm:max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </DialogTitle>
                  <DialogDescription>Your account details</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className="w-20 h-20 rounded-full overflow-hidden"
                      style={{
                        border: "2px solid rgba(4, 95, 60, 0.3)",
                        backgroundColor: "#045F3C",
                      }}
                    >
                      {user?.avatar_url && !modalAvatarError ? (
                        <img
                          src={
                            user.avatar_url.startsWith("http")
                              ? user.avatar_url
                              : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api"}${user.avatar_url}`
                          }
                          alt={user.name || "Profile"}
                          className="w-full h-full object-cover"
                          onError={() => setModalAvatarError(true)}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white text-2xl font-semibold"
                          style={{ backgroundColor: "#045F3C" }}
                        >
                          {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Name
                      </label>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {user?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {user?.email || "N/A"}
                      </p>
                    </div>
                    {user?.role_name && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Role
                        </label>
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
          <div className="flex justify-center w-full px-3 sm:px-4 md:px-6 lg:px-0 relative z-[3]">
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-10 w-full max-w-7xl relative z-[3]`}
            >
            {/* Portal Platform - Only visible to Admin and Manager */}
            {showPortal && (
              <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full relative overflow-visible pt-10 pb-6 px-4 sm:px-6">
                {/* Large circular icon extending beyond card */}
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg z-10" style={{ backgroundColor: "#045F3C" }}>
                  <Users className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-9 lg:w-9 text-white" />
                </div>
                <div className="text-center flex flex-col flex-grow">
                  <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 mt-2" style={{ color: '#1e293b' }}>
                    Portal
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-sm lg:text-base leading-relaxed mb-4 sm:mb-6 flex-grow">
                    Access your organization's main portal with projects, teams, and content management.
                  </p>
                  <div className="mt-auto">
                    <button
                      onClick={() => handlePlatformSelect("portal")}
                      className="text-[#045F3C] font-medium hover:text-[#03452f] transition-colors duration-300 flex items-center gap-1 justify-center group text-sm sm:text-base"
                    >
                      Connect to Portal <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Alumni Platform - Only visible to Alumni users */}
            {showAlumni && (
              <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full relative overflow-visible pt-10 pb-6 px-4 sm:px-6">
                {/* Large circular icon extending beyond card */}
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg z-10" style={{ backgroundColor: "#045F3C" }}>
                  <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-9 lg:w-9 text-white" />
                </div>
                <div className="text-center flex flex-col flex-grow">
                  <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 mt-2" style={{ color: '#1e293b' }}>
                    Alumni Network
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-sm lg:text-base leading-relaxed mb-4 sm:mb-6 flex-grow">
                    Connect with fellow alumni, find mentors, and explore career opportunities. Build your professional network.
                  </p>
                  <div className="mt-auto">
                    <button
                      onClick={() => handlePlatformSelect("alumni")}
                      className="text-[#045F3C] font-medium hover:text-[#03452f] transition-colors duration-300 flex items-center gap-1 justify-center group text-sm sm:text-base"
                    >
                      Connect to Alumni Network <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Website Platform */}
            <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full relative overflow-visible pt-10 pb-6 px-4 sm:px-6">
              {/* Large circular icon extending beyond card */}
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg z-10" style={{ backgroundColor: "#045F3C" }}>
                <Globe className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-9 lg:w-9 text-white" />
              </div>
              <div className="text-center flex flex-col flex-grow">
                <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 mt-2" style={{ color: '#1e293b' }}>
                  Website
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm md:text-sm lg:text-base leading-relaxed mb-4 sm:mb-6 flex-grow">
                  Visit the public-facing website to explore programs, news, and opportunities. Discover what we offer.
                </p>
                <div className="mt-auto">
                  <button
                    onClick={() => handlePlatformSelect("website")}
                    className="text-[#045F3C] font-medium hover:text-[#03452f] transition-colors duration-300 flex items-center gap-1 justify-center group text-sm sm:text-base"
                  >
                    Connect to Website <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Task Management Platform - Hidden for Alumni users */}
            {showTask && (
              <div className={`group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full relative overflow-visible pt-10 pb-6 px-4 sm:px-6 ${visibleCards === 4 ? 'sm:col-span-2 sm:col-start-1 md:col-span-1 md:col-start-2 md:justify-self-center lg:col-start-auto lg:justify-self-auto xl:col-start-auto xl:justify-self-auto' : ''}`}>
                {/* Large circular icon extending beyond card */}
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg z-10" style={{ backgroundColor: "#045F3C" }}>
                  <CheckSquare className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-9 lg:w-9 text-white" />
                </div>
                <div className="text-center flex flex-col flex-grow">
                  <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 mt-2" style={{ color: '#1e293b' }}>
                    Task Management
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-sm lg:text-base leading-relaxed mb-4 sm:mb-6 flex-grow">
                    Manage tasks, track progress, and collaborate with your team. Stay organized and productive.
                  </p>
                  <div className="mt-auto">
                    <button
                      onClick={() => handlePlatformSelect("task")}
                      className="text-[#045F3C] font-medium hover:text-[#03452f] transition-colors duration-300 flex items-center gap-1 justify-center group text-sm sm:text-base"
                    >
                      Connect to Task Management <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlatformSelectionPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <PlatformSelectionContent />
    </Suspense>
  );
}
