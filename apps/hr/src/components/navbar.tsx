"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  User,
  Menu,
  Settings,
  LogOut,
  Sun,
  Moon,
  Settings as SettingsIcon,
  HelpCircle,
  Eye,
  X,
  Home,
  Users,
  Briefcase,
  FileText,
  UserCircle,
  Clock,
} from "lucide-react";
import { NotificationList } from "@/components/shared/notification-list";
import { useUnreadNotificationCount, useMarkAllNotificationsRead } from "@/hooks/useNotifications";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, isAuthenticated, roles, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isDashboardPage = pathname === "/";
  const useExpandedNavbar = isDashboardPage && !scrolled;
  const { data: unreadCount } = useUnreadNotificationCount();
  const markAllRead = useMarkAllNotificationsRead();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mainEl = document.querySelector("main.overflow-auto") as HTMLElement | null;

    const onScroll = () => {
      const y = mainEl ? mainEl.scrollTop : window.scrollY;
      setScrolled(y > 10);
    };

    onScroll();
    if (mainEl) {
      mainEl.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (mainEl) {
        mainEl.removeEventListener("scroll", onScroll);
      }
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  // RBAC role names come back lowercase from /auth/me (roles table: "hr", "admin", "director",
  // "finance", "program_manager", "staff", "fellow", "analyst", "mentor", "alumni", "employee").
  // There is no "IT" role in that system — the old three-way IT/HR/EMPLOYEE split was written
  // against the retired hr_users model, whose /auth/me response never actually had a `role`
  // field, so every user silently fell through to the Home-only default below.
  const isHrManager = roles.includes("hr") || roles.includes("admin");

  const navItems = useMemo(() => {
    if (!isAuthenticated || !user) {
      return [{ id: "home", label: "Home", href: "/" }];
    }

    if (isHrManager) {
      return [
        { id: "home", label: "Home", href: "/" },
        { id: "employees", label: "Employees", href: "/employees" },
        { id: "recruitment", label: "Recruitment", href: "/recruitment" },
        { id: "document", label: "Documents", href: "/documents" },
        { id: "assets", label: "Assets", href: "/asset" },
        // { id: "help-desk", label: "Help Desk", href: "/help-desk" },
      ];
    }

    // Every other authenticated role (employee, staff, fellow, analyst, mentor, alumni,
    // director, program_manager, finance) gets the self-service nav.
    return [
      { id: "home", label: "Home", href: "/" },
      { id: "my-onboarding", label: "My Onboarding", href: "/employees/onboarding/me" },
      { id: "leave", label: "Time Off", href: "/leave" },
      { id: "documents", label: "Documents", href: "/documents" },
      { id: "signing", label: "Sign", href: "/signing" },
      { id: "my-assets", label: "My Assets", href: "/asset/me" },
      // { id: "help-desk", label: "Help Desk", href: "/help-desk" },
    ];
  }, [isAuthenticated, user, isHrManager]);

  const isActive = (href: string) => {
    if (href === "/" && pathname !== "/") return false;
    return pathname.startsWith(href);
  };

  const getInitials = (name?: string | null) => {
    // 1. If name is undefined/null, default to an empty string.
    // 2. We use || "" to ensure that if name is falsy, we operate on an empty string.
    const safeName = name || "";

    // 3. Optional chaining .trim() is not needed here if we ensure a string,
    // but using (name || "").trim() handles the logic safely.
    const parts = safeName.trim().split(" "); // Note: usually you split by space, not ""

    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";

    return (first + last).toUpperCase();
  };

  // "hr" / "program_manager" -> "Hr" / "Program Manager" for display.
  const formatRole = (role: string) =>
    role
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const roleLabel = roles.length ? roles.map(formatRole).join(", ") : null;

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 px-0 border-none transition-all duration-300 flex flex-col justify-center items-center backdrop-blur-md mt-5 w-full rounded-t-xl">
        <div className="hidden md:flex px-10 h-[72px] w-full max-w-[80%] items-center bg-brand-dark justify-between gap-25 rounded-t-lg">
          <div className="flex justify-between items-center gap-6 lg:gap-9 w-[60%]">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-white p-1 rounded-md">
                <Image src="/logo.svg" alt="GanzAfrica" width={100} height={24} priority />
              </div>
              <span className="text-white font-bold text-xl ml-2">hr.</span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`sticky top-0 z-50 px-0 border-none transition-all duration-300 flex flex-col justify-center items-center backdrop-blur-md ${
        useExpandedNavbar
          ? "mt-5 w-full rounded-t-xl border-none"
          : "mx-0 mt-0 rounded-none border-none"
      }`}
    >
      {/* Desktop Navbar (md and up) */}
      <div className="hidden md:flex px-10 h-[72px] w-full max-w-[80%] items-center bg-brand-dark justify-between gap-25 rounded-t-lg mt-5">
        {/* Logo and Main Nav */}
        <div className="flex justify-between items-center gap-6 lg:gap-9 w-[60%]">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-[#ffff] p-2 rounded flex items-center justify-center">
              <Image src="/logo.png" width={50} height={50} alt="ga-logo" />
            </div>
            <span className="font-bold text-laj tracking-tight text-white">hr.</span>
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`px-4 py-2 text-default font-medium rounded-full transition-all duration-200 ${
                  isActive(item.href)
                    ? "text-[#134e48] bg-brand-accent"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-3 lg:gap-9">
          {/* Theme Toggle */}
          {mounted && (
            <div className="flex items-center bg-white/10 p-1 rounded-full">
              <button
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-full transition-all ${theme === "light" ? "bg-brand-accent text-[#134e48]" : "text-white/60 hover:text-white"}`}
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-full transition-all ${theme === "dark" ? "bg-brand-accent text-[#134e48]" : "text-white/60 hover:text-white"}`}
              >
                <Moon className="h-4 w-4" />
              </button>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-full bg-white/10 text-white hover:bg-brand-accent border-none"
              >
                <Bell className="h-5 w-5" />
                {!!unreadCount && (
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-[#134e48]"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 mt-2 p-0 overflow-hidden bg-white dark:bg-slate-900 border-white/10 dark:border-slate-800 rounded-lg"
            >
              <DropdownMenuLabel className="p-4 flex items-center justify-between">
                <span className="font-bold text-base">Notifications</span>
                {!!unreadCount && (
                  <Badge
                    variant="secondary"
                    className="bg-[#00df82]/10 text-brand-accent border-none"
                  >
                    {unreadCount} New
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="m-0 bg-white/10" />
              <div className="max-h-80 overflow-y-auto">
                <NotificationList />
              </div>
              <DropdownMenuSeparator className="m-0 bg-white/10" />
              <Button
                variant="ghost"
                disabled={!unreadCount || markAllRead.isPending}
                onClick={() => markAllRead.mutate()}
                className="w-full rounded-none h-12 text-sm text-[#00df82] hover:text-[#00df82] hover:bg-slate-50 dark:hover:bg-white/5"
              >
                Mark all as read
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/settings">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-brand-accent border-none"
            >
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </Link>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-0 h-10 w-10 rounded-full hover:opacity-80 border-none"
                >
                  <Avatar className="h-10 w-10 border-none border-white/20">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="bg-brand-accent">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-lg">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    {roleLabel && (
                      <Badge variant="outline" className="w-fit text-[10px] px-1 py-0 mt-1">
                        {roleLabel}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile" className="flex">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full px-4"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navbar (< md) */}
      <div className="md:hidden flex h-16 w-full items-center justify-between px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-brand-dark p-1.5 rounded flex items-center justify-center">
              <Image src="/logo.png" width={32} height={32} alt="ga-logo" />
            </div>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-slate-600 dark:text-slate-300"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] sm:w-[350px] p-0 border-none bg-brand-dark text-white"
            >
              <SheetHeader className="p-6 border-b border-white/10">
                <SheetTitle className="text-white flex items-center gap-2">
                  <div className="bg-white p-1.5 rounded">
                    <Image src="/logo.png" width={24} height={24} alt="ga-logo" />
                  </div>
                  <span className="font-bold text-xl tracking-tight">hr.</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col py-6">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`px-6 py-4 text-lg font-medium transition-all ${
                      isActive(item.href)
                        ? "text-brand-accent bg-white/10 border-r-4 border-brand-accent"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-auto p-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-white/70">Appearance</span>
                  {mounted && (
                    <div className="flex items-center bg-white/10 p-1 rounded-full">
                      <button
                        onClick={() => setTheme("light")}
                        className={`p-1.5 rounded-full transition-all ${theme === "light" ? "bg-brand-accent text-[#134e48]" : "text-white/60 hover:text-white"}`}
                      >
                        <Sun className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`p-1.5 rounded-full transition-all ${theme === "dark" ? "bg-brand-accent text-[#134e48]" : "text-white/60 hover:text-white"}`}
                      >
                        <Moon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none"
              >
                <Bell className="h-5 w-5" />
                {!!unreadCount && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 mt-2 p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg"
            >
              <DropdownMenuLabel className="p-4 flex items-center justify-between">
                <span className="font-bold text-base">Notifications</span>
                {!!unreadCount && (
                  <Badge
                    variant="secondary"
                    className="bg-[#00df82]/10 text-brand-accent border-none"
                  >
                    {unreadCount} New
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="m-0 bg-slate-100 dark:bg-white/10" />
              <div className="max-h-80 overflow-y-auto">
                <NotificationList />
              </div>
              <Button
                variant="ghost"
                disabled={!unreadCount || markAllRead.isPending}
                onClick={() => markAllRead.mutate()}
                className="w-full rounded-none h-12 text-sm text-[#00df82] hover:text-[#00df82] hover:bg-slate-50 dark:hover:bg-white/5"
              >
                Mark all as read
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/settings">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </Link>
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-0 h-8 w-8 ml-1 rounded-full hover:opacity-80 border-none"
                >
                  <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-lg">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    {roleLabel && (
                      <Badge variant="outline" className="w-fit text-[10px] px-1 py-0 mt-1">
                        {roleLabel}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full px-4 text-xs h-8"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Nav Scroll Area (only if needed, but the image shows a different style) */}
      <div className="hidden lg:hidden border-t border-white/10 overflow-x-auto no-scrollbar py-2">
        <div className="flex px-4 h-10 items-center gap-4 whitespace-nowrap">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`text-sm font-medium transition-colors px-3 py-1 rounded-full ${
                isActive(item.href)
                  ? "bg-[#00df82] text-[#134e48]"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
