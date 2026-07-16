"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { useSidebar } from "@/components/sidebar-provider";
import { Task, TeamMember } from "@/lib/types";

interface PageLayoutProps {
  children: React.ReactNode;
  members: TeamMember[];
  tasks: Task[];
  title?: string;
  headerAction?: React.ReactNode;
  className?: string;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export function PageLayout({
  children,
  members,
  tasks,
  title,
  headerAction,
  className = "",
  onSearchChange,
  searchQuery,
}: PageLayoutProps) {
  const { collapsed: sidebarCollapsed, mobileOpen, toggleMobile, closeMobile } = useSidebar();
  const [isDesktop, setIsDesktop] = useState(false);

  // Track if we're on desktop to adjust margin
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Close mobile sidebar when clicking on backdrop
  useEffect(() => {
    if (mobileOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest(".sidebar-container") && !target.closest(".sidebar-toggle")) {
          closeMobile();
        }
      };
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [mobileOpen, closeMobile]);

  return (
    <div
      className="min-h-screen bg-gray-50 w-full"
      style={{
        overflowX: "hidden",
        width: "100%",
        position: "relative",
        touchAction: "pan-y",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Navbar - Fixed at top, full width */}
      <div
        className="fixed top-0 left-0 right-0 z-30 bg-white flex-shrink-0 border-b border-gray-200 w-full"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          touchAction: "none",
          WebkitTransform: "translateZ(0)",
          transform: "translateZ(0)",
          overflowX: "visible",
          overflowY: "visible",
        }}
      >
        <Navbar
          tasks={tasks}
          onToggleSidebar={toggleMobile}
          onSearchChange={onSearchChange}
          searchQuery={searchQuery}
        />
      </div>

      {/* Mobile backdrop - Only shows when sidebar is open on mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={closeMobile}
          style={{
            touchAction: "none",
            WebkitTransform: "translateZ(0)",
            transform: "translateZ(0)",
            display: "block",
          }}
        />
      )}

      {/* Main layout container - Full width, no max-width constraint */}
      <div
        className="flex min-h-screen w-full"
        style={{
          paddingTop: "64px",
          overflowX: "hidden",
          width: "100%",
          position: "relative",
        }}
      >
        {/* Desktop Sidebar - Fixed on left, only visible on desktop (lg and above) */}
        <aside
          className="hidden lg:block fixed left-0 transition-all duration-300 sidebar-container z-20"
          style={{
            width: sidebarCollapsed ? "64px" : "240px",
            backgroundColor: "#076297",
            top: "64px",
            bottom: 0,
            height: "calc(100vh - 64px)",
            overflowY: "auto",
            overflowX: "hidden",
            touchAction: "pan-y",
            WebkitOverflowScrolling: "touch",
            WebkitTransform: "translateZ(0)",
            transform: "translateZ(0)",
            position: "fixed",
          }}
        >
          <Sidebar members={members} tasks={tasks} collapsed={sidebarCollapsed ?? false} />
        </aside>

        {/* Mobile Sidebar - Completely hidden by default, only shows when hamburger is clicked */}
        <aside
          className={`fixed top-0 left-0 h-full z-50 lg:hidden sidebar-container transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            width: "280px",
            backgroundColor: "#076297",
            touchAction: "pan-y",
            WebkitOverflowScrolling: "touch",
            WebkitTransform: "translateZ(0)",
            transform: mobileOpen
              ? "translateX(0) translateZ(0)"
              : "translateX(-100%) translateZ(0)",
            overflowY: "auto",
            overflowX: "hidden",
            // Ensure sidebar is completely hidden when not open
            pointerEvents: mobileOpen ? "auto" : "none",
            // Ensure it's completely off-screen when closed
            left: mobileOpen ? "0" : "-280px",
          }}
        >
          <Sidebar members={members} tasks={tasks} collapsed={false} />
        </aside>

        {/* Main Content - Adjusts based on sidebar width */}
        <div
          className={`flex flex-col min-w-0 flex-1 transition-all duration-300 ${className}`}
          style={{
            // On desktop: add margin for sidebar, on mobile: full width (no sidebar visible by default)
            marginLeft: isDesktop ? (sidebarCollapsed ? "64px" : "240px") : "0",
            width: isDesktop ? `calc(100% - ${sidebarCollapsed ? "64px" : "240px"})` : "100%",
            overflowX: "hidden",
            position: "relative",
            touchAction: "pan-y",
          }}
        >
          <div
            className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 pb-6 sm:pb-8 md:pb-10"
            style={{ overflowX: "hidden", width: "100%" }}
          >
            {/* Header with title and action button */}
            {(title || headerAction) && (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5 mb-3 sm:mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                {title && (
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                    {title}
                  </h2>
                )}
                {headerAction && <div className="w-full sm:w-auto">{headerAction}</div>}
              </div>
            )}

            {/* Page content */}
            <div style={{ overflowX: "hidden", width: "100%" }}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageLayout;
