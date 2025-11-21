"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Layout, ListTodo, Layers, CalendarDays, BarChart3, X, LayoutDashboard } from "lucide-react";
import { Task, TeamMember } from "@/lib/types";
import { isCurrentUserAdminOrManager, isCurrentUserAdminOrManagerAsync } from "@/lib/auth-utils";
import { useSidebar } from "./sidebar-provider";

export function Sidebar({ members, tasks, collapsed }: { members: TeamMember[]; tasks: Task[]; collapsed?: boolean }): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { closeMobile, mobileOpen } = useSidebar();
  const [userHasAccess, setUserHasAccess] = useState<boolean>(false);

  // Check if current user has admin or manager role
  const isCurrentUserAdminOrManagerRole = () => {
    return isCurrentUserAdminOrManager();
  };

  // Check user access on component mount
  useEffect(() => {
    const checkUserAccess = async () => {
      try {
        const hasAccess = await isCurrentUserAdminOrManagerAsync();
        setUserHasAccess(hasAccess);
      } catch (error) {
        console.error('Error checking user access in sidebar:', error);
        setUserHasAccess(false);
      }
    };
    
    checkUserAccess();
  }, []);

  // Base navigation items
  const baseNavItems = [
    { href: "/my-tasks", icon: ListTodo, label: "Manage Tasks" },
    { href: "/teams", icon: Layers, label: "Teams" },
    { href: "/calendar", icon: CalendarDays, label: "Calendar" },
    { href: "/reports", icon: BarChart3, label: "Reports" },
  ];

  // Add Board View only for admin/manager users
  const navItems = userHasAccess 
    ? [{ href: "/board", icon: Layout, label: "Board View" }, ...baseNavItems]
    : baseNavItems;

  const handleLinkClick = () => {
    // Close mobile sidebar when a link is clicked
    if (mobileOpen) {
      closeMobile();
    }
  };

  return (
    <div 
      className="h-full p-3 sm:p-4 flex flex-col overflow-y-auto" 
      style={{ 
        backgroundColor: '#076297',
        overflowX: 'hidden',
        touchAction: 'pan-y',
        WebkitOverflowScrolling: 'touch',
        width: '100%'
      }}
    >
      {/* Mobile close button */}
      {mobileOpen && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/20">
          <span className="text-white font-semibold text-base sm:text-lg">Menu</span>
          <button
            onClick={closeMobile}
            className="p-2 rounded-md hover:bg-white/10 text-white transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <nav className="space-y-1.5 sm:space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
             <div key={item.href} className="relative group">
              <Link
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-md transition-all duration-200 text-white ${
                  collapsed ? 'justify-center px-2' : ''
                } ${
                  isActive ? 'bg-white/20 shadow-sm' : 'hover:bg-white/10'
                }`}
              >
                <Icon className={`${collapsed ? 'h-5 w-5' : 'h-4 w-4 sm:h-5 sm:w-5'} flex-shrink-0`} /> 
                {!collapsed && (
                  <span className="text-sm sm:text-base font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
              
              {/* Tooltip for collapsed sidebar (desktop only) */}
              {collapsed && !mobileOpen && (
                <div className="absolute left-full ml-2 px-3 py-2 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[99999] whitespace-nowrap pointer-events-none shadow-lg" style={{ backgroundColor: '#0a7bb8' }}>
                  {item.label}
                  {/* Arrow pointing to the icon */}
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: '#0a7bb8' }}></div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Portal Link - Only for Admin and Manager - At the bottom */}
      {userHasAccess && (
        <div className="mt-auto pt-2 border-t border-white/20">
          <div className="relative group">
            <a
              href={`${process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001'}/dashboard`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className={`flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-md transition-all duration-200 text-white hover:bg-white/10 ${
                collapsed ? 'justify-center px-2' : ''
              }`}
            >
              <LayoutDashboard className={`${collapsed ? 'h-5 w-5' : 'h-4 w-4 sm:h-5 sm:w-5'} flex-shrink-0`} />
              {!collapsed && (
                <span className="text-sm sm:text-base font-medium whitespace-nowrap">
                  Portal
                </span>
              )}
            </a>
            
            {/* Tooltip for collapsed sidebar (desktop only) */}
            {collapsed && !mobileOpen && (
              <div className="absolute left-full ml-2 px-3 py-2 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[99999] whitespace-nowrap pointer-events-none shadow-lg" style={{ backgroundColor: '#0a7bb8' }}>
                Portal
                {/* Arrow pointing to the icon */}
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: '#0a7bb8' }}></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


