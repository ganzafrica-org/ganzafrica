"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, ListTodo, Layers, CalendarDays, BarChart3 } from "lucide-react";
import { Task, TeamMember } from "@/lib/types";

export function Sidebar({ members, tasks, collapsed }: { members: TeamMember[]; tasks: Task[]; collapsed?: boolean }): React.JSX.Element {
  const pathname = usePathname();

  const navItems = [
    { href: "/board", icon: Layout, label: "Board View" },
    { href: "/my-tasks", icon: ListTodo, label: "Manage Tasks" },
    { href: "/teams", icon: Layers, label: "Teams" },
    { href: "/calendar", icon: CalendarDays, label: "Calendar" },
    { href: "/reports", icon: BarChart3, label: "Reports" },
  ];

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
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                  {item.label}
                  {/* Arrow pointing to the icon */}
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}


