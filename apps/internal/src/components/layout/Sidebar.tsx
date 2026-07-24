"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { LayoutGrid, DollarSign, FileText, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";

interface SidebarProps {
  isCollapsed: boolean;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

const Sidebar = ({ isCollapsed, isMobile = false, onMobileClose }: SidebarProps) => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleLinkClick = () => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const navItems = [{ href: "/payroll/payslips", label: "Payslips", icon: FileText }];

  return (
    <div
      className={`${isMobile ? "h-full" : "fixed left-0 top-0 h-full"} bg-[#045F3C] text-white/90 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="h-16 flex-shrink-0 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center">
            {!isCollapsed ? (
              <span className="text-lg font-bold text-white">HR & Finance</span>
            ) : (
              <DollarSign className="w-8 h-8 text-white" />
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? "bg-white/20 text-white font-medium"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
