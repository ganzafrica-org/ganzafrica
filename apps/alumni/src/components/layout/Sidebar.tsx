"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  LayoutGrid,
  Users,
  Briefcase,
  Calendar,
  Trophy,
  BookOpen,
  UserPlus,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";

interface SidebarProps {
  isCollapsed: boolean;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

const Sidebar = ({ isCollapsed, isMobile = false, onMobileClose }: SidebarProps) => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [mentorshipOpen, setMentorshipOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTopArrow, setShowTopArrow] = useState(false);
  const [showBottomArrow, setShowBottomArrow] = useState(false);

  useEffect(() => {
    // Auto-open dropdowns based on active route
    if (pathname?.startsWith("/mentorship")) {
      setMentorshipOpen(true);
    }
  }, [pathname]);

  // Check if we need to show arrows
  const checkArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowTopArrow(el.scrollTop > 0);
    setShowBottomArrow(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  };

  useEffect(() => {
    checkArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkArrows);
    window.addEventListener("resize", checkArrows);
    return () => {
      el.removeEventListener("scroll", checkArrows);
      window.removeEventListener("resize", checkArrows);
    };
  }, []);

  const scrollBy = (amount: number) => {
    scrollRef.current?.scrollBy({ top: amount, behavior: "smooth" });
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleLinkClick = () => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutGrid },
    { href: "/directory", label: "Alumni Directory", icon: Users },
    { href: "/jobs", label: "Job Opportunities", icon: Briefcase },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/achievements", label: "Achievements", icon: Trophy },
    { href: "/resources", label: "Resources", icon: BookOpen },
  ];

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
              <Image
                src={
                  process.env.NODE_ENV === "production"
                    ? "/alumni/images/logo-2.png"
                    : "/images/logo-2.png"
                }
                alt="GanzAfrica"
                width={130}
                height={35}
                className="object-contain"
                priority
              />
            ) : (
              <Image
                src={
                  process.env.NODE_ENV === "production"
                    ? "/alumni/images/logoLight.png"
                    : "/images/logoLight.png"
                }
                alt="GanzAfrica"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            )}
          </div>
        </div>

        {/* Menu Sections */}
        <div className="flex-1 min-h-0 relative">
          {/* Scroll Arrows */}
          {showTopArrow && (
            <button
              className="absolute left-1/2 -translate-x-1/2 top-2 z-20 bg-[#045F3C]/90 backdrop-blur-sm rounded-full shadow-lg p-1.5 hover:bg-[#045F3C] transition-all duration-200"
              onClick={() => scrollBy(-80)}
              aria-label="Scroll up"
            >
              <ChevronUp className="w-4 h-4 text-white" />
            </button>
          )}

          {showBottomArrow && (
            <button
              className="absolute left-1/2 -translate-x-1/2 bottom-2 z-20 bg-[#045F3C]/90 backdrop-blur-sm rounded-full shadow-lg p-1.5 hover:bg-[#045F3C] transition-all duration-200"
              onClick={() => scrollBy(80)}
              aria-label="Scroll down"
            >
              <ChevronDown className="w-4 h-4 text-white" />
            </button>
          )}

          {/* Menu Content */}
          <div
            ref={scrollRef}
            className="absolute inset-0 overflow-y-auto overflow-x-hidden no-scrollbar"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div className="px-4 py-6">
              {/* Main Menu */}
              <div>
                {!isCollapsed && (
                  <h2 className="px-4 mb-3 text-sm font-medium text-white/60 uppercase tracking-wider">
                    Main Menu
                  </h2>
                )}
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleLinkClick}
                        className={`flex items-center ${isCollapsed ? "justify-center px-3" : "px-4"} py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-white/80 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
                      </Link>
                    );
                  })}

                  {/* Mentorship Dropdown */}
                  <div>
                    <div
                      className={`flex items-center justify-between cursor-pointer ${isCollapsed ? "justify-center px-3" : "px-4"} py-2.5 rounded-lg transition-colors ${
                        pathname?.startsWith("/mentorship")
                          ? "bg-white/10 text-white"
                          : "text-white/80 hover:bg-white/5 hover:text-white"
                      }`}
                      onClick={() => !isCollapsed && setMentorshipOpen(!mentorshipOpen)}
                    >
                      <div className="flex items-center">
                        <UserPlus className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="ml-3 font-medium">Mentorship</span>}
                      </div>
                      {!isCollapsed &&
                        (mentorshipOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        ))}
                    </div>

                    {!isCollapsed && mentorshipOpen && (
                      <>
                        <Link
                          href="/mentorship"
                          onClick={handleLinkClick}
                          className={`flex items-center pl-10 pr-4 py-2 rounded-lg transition-colors ${
                            pathname === "/mentorship"
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <Users className="w-4 h-4 flex-shrink-0" />
                          <span className="ml-3 font-medium text-sm">Find Mentees</span>
                        </Link>
                        <Link
                          href="/mentorship/my-connections"
                          onClick={handleLinkClick}
                          className={`flex items-center pl-10 pr-4 py-2 rounded-lg transition-colors ${
                            pathname === "/mentorship/my-connections"
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <MessageSquare className="w-4 h-4 flex-shrink-0" />
                          <span className="ml-3 font-medium text-sm">My Connections</span>
                        </Link>
                      </>
                    )}
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="flex-shrink-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`flex items-center ${isCollapsed ? "justify-center" : ""} w-full px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors`}
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
