"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Layout, ListTodo, Layers, CalendarDays, BarChart3 } from "lucide-react";
import { Task, TeamMember } from "@/lib/types";
import { isCurrentUserAdminOrManager, isCurrentUserAdminOrManagerAsync } from "@/lib/auth-utils";

export function Sidebar({ members, tasks, collapsed }: { members: TeamMember[]; tasks: Task[]; collapsed?: boolean }): React.JSX.Element {
  const pathname = usePathname();
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

  return (
    <div className="h-full p-4 flex flex-col" style={{ backgroundColor: '#076297' }}>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
             <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-white ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" /> 
                {!collapsed && <span>{item.label}</span>}
              </Link>
              
              {/* Tooltip for collapsed sidebar */}
              {collapsed && (
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
    </div>
  );
}


