"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/lib/auth/auth-provider";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function PayrollLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isLoading, isAuthenticated } = useAuth();

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#045F3C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";
      window.location.href = `${portalUrl}/login`;
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-900">
      {/* MOBILE SIDEBAR SHEET */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-[#045F3C]">
          <Sidebar
            isCollapsed={false}
            isMobile
            onMobileClose={() => setIsMobileSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* MAIN FLEX LAYOUT FOR DESKTOP */}
      <div className="flex">
        {/* SIDEBAR */}
        <div className="hidden md:block">
          <Sidebar isCollapsed={isSidebarCollapsed} />
        </div>

        {/* CONTENT AREA */}
        <div
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          <Navbar
            onMenuClick={toggleSidebar}
            onMobileMenuClick={toggleMobileSidebar}
            isSidebarCollapsed={isSidebarCollapsed}
          />

          {/* PAGE CONTENT */}
          <main className="min-h-[calc(100vh-4rem)] p-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
