"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import LanguageSwitcher from "./language-switcher";

interface HeaderProps {
  locale: string;
  dict: any;
  transparent?: boolean;
}

export default function Header({
  locale,
  dict,
  transparent = false,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add scroll detection for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine if we're on the home page
  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;

  // Function to handle dropdown opening
  const handleDropdownOpen = (dropdownName: string) => {
    // Clear any existing timeout
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown(dropdownName);
  };

  // Function to handle dropdown closing with delay
  const handleDropdownClose = () => {
    // Set a timeout to close the dropdown
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 300); // 300ms delay before closing
  };

  // Function to keep dropdown open when hovering over dropdown content
  const handleDropdownContentEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
  };

  // Function to toggle dropdown on click
  const toggleDropdown = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-white/95 shadow-sm backdrop-blur-sm"
          : transparent
            ? "bg-transparent"
            : "bg-white",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="relative z-50 flex items-center gap-2"
            prefetch={true}
          >
            <div className="relative h-16 w-28">
              <Image
                src="/images/logo.png"
                alt="GanzAfrica"
                fill
                sizes="(max-width: 768px) 300px, 200px"
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-1 md:flex">
            {/* About Dropdown */}
            <div className="relative">
              {/* 'About' is a clickable span that toggles dropdown */}
              <span
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  pathname.includes("/about")
                    ? "text-primary-green"
                    : isScrolled || !transparent
                      ? "text-gray-700 hover:text-primary-green"
                      : "text-white hover:text-white/80",
                )}
                onClick={() => toggleDropdown('about')}
                onMouseEnter={() => handleDropdownOpen('about')}
                onMouseLeave={handleDropdownClose}
              >
                {dict.navigation.about}
                <ChevronDown className="ml-1 h-4 w-4" />
              </span>

              {/* Dropdown content */}
              {activeDropdown === 'about' && (
                <div 
                  className="absolute left-0 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                  onMouseEnter={handleDropdownContentEnter}
                  onMouseLeave={handleDropdownClose}
                >
                  <div className="py-1 flex flex-col">
                    <Link
                      href={`/${locale}/about/who-we-are`}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      prefetch={true}
                    >
                      {dict.about.who_we_are}
                    </Link>
                    <Link
                      href={`/${locale}/about/our-story`}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      prefetch={true}
                    >
                      {dict.about.our_story}
                    </Link>
                    <Link
                      href={`/${locale}/about/team`}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      prefetch={true}
                    >
                      Team
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* What We Do Dropdown */}
            <div className="relative">
              <span
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  pathname.includes("/what-we-do")
                    ? "text-primary-green"
                    : isScrolled || !transparent
                      ? "text-gray-700 hover:text-primary-green"
                      : "text-white hover:text-white/80",
                )}
                onClick={() => toggleDropdown('what-we-do')}
                onMouseEnter={() => handleDropdownOpen('what-we-do')}
                onMouseLeave={handleDropdownClose}
              >
                {dict.navigation.what_we_do}
                <ChevronDown className="ml-1 h-4 w-4" />
              </span>
              
              {activeDropdown === 'what-we-do' && (
                <div 
                  className="absolute left-0 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                  onMouseEnter={handleDropdownContentEnter}
                  onMouseLeave={handleDropdownClose}
                >
                  <div className="py-1 flex flex-col">
                    <Link
                      href={`/${locale}/what-we-do/food-systems`}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      prefetch={true}
                    >
                      {dict.what_we_do.food_systems}
                    </Link>
                    <Link
                      href={`/${locale}/what-we-do/climate-change-adaptation`}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      prefetch={true}
                    >
                      {dict.what_we_do.climate_change_adaptation}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Programs Dropdown */}
            <div className="relative">
              <span
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  pathname.includes("/programs")
                    ? "text-primary-green"
                    : isScrolled || !transparent
                      ? "text-gray-700 hover:text-primary-green"
                      : "text-white hover:text-white/80",
                )}
                onClick={() => toggleDropdown('programs')}
                onMouseEnter={() => handleDropdownOpen('programs')}
                onMouseLeave={handleDropdownClose}
              >
                {dict.navigation.programs}
                <ChevronDown className="ml-1 h-4 w-4" />
              </span>
              
              {activeDropdown === 'programs' && (
                <div 
                  className="absolute left-0 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                  onMouseEnter={handleDropdownContentEnter}
                  onMouseLeave={handleDropdownClose}
                >
                  <div className="py-1 flex flex-col">
                    <Link
                      href={`/${locale}/programs/fellowship`}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      prefetch={true}
                    >
                      Fellowship
                    </Link>
                    <Link
                      href={`/${locale}/programs/alumni`}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      prefetch={true}
                    >
                      Alumni
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* projects Dropdown */}
            <div className="relative">
  <Link
    href={`/${locale}/projects`}
    className={cn(
      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
      pathname.includes("/project")
        ? "text-primary-green"
        : isScrolled || !transparent
          ? "text-gray-700 hover:text-primary-green"
          : "text-white hover:text-white/80",
    )}
    prefetch={true}
  >
    {dict.navigation.projects}
  </Link>
</div>

            {/* News & Updates Dropdown */}
            <div className="relative">
              <span
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  pathname.includes("/newsroom")
                    ? "text-primary-green"
                    : isScrolled || !transparent
                      ? "text-gray-700 hover:text-primary-green"
                      : "text-white hover:text-white/80",
                )}
                onClick={() => toggleDropdown('news-updates')}
                onMouseEnter={() => handleDropdownOpen('news-updates')}
                onMouseLeave={handleDropdownClose}
              >
                News & Updates
                <ChevronDown className="ml-1 h-4 w-4" />
              </span>
              
              {activeDropdown === 'news-updates' && (
                <div 
                  className="absolute left-0 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                  onMouseEnter={handleDropdownContentEnter}
                  onMouseLeave={handleDropdownClose}
                >
                  <div className="py-1 flex flex-col">
                    <Link
                      href={`/${locale}/newsroom`}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      prefetch={true}
                    >
                      News
                    </Link>
                    <Link
                      href={`/${locale}/contact-us`}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      prefetch={true}
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right side items */}
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />

            <Link href={`/${locale}/login`}>
              <Button
                size="sm"
                className="bg-primary-green hover:bg-primary-green/90 text-white"
              >
                {dict.cta?.sign_in || "Sign In"}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-primary-green"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-white pt-20">
          <nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            {/* Mobile About with submenu */}
            <div className="flex flex-col">
              <button
                className="p-2 text-lg font-medium hover:bg-gray-100 rounded-md text-primary-green text-left flex items-center justify-between"
                onClick={() => setActiveDropdown(activeDropdown === 'mobile-about' ? null : 'mobile-about')}
              >
                {dict.navigation.about}
                <ChevronDown className={`h-5 w-5 transform transition-transform ${activeDropdown === 'mobile-about' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'mobile-about' && (
                <div className="ml-4 mt-2 flex flex-col space-y-2">
                  <Link
                    href={`/${locale}/about/who-we-are`}
                    className="p-2 text-md font-medium hover:bg-gray-100 rounded-md text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                    prefetch={true}
                  >
                    {dict.about.who_we_are}
                  </Link>
                  <Link
                    href={`/${locale}/about/our-story`}
                    className="p-2 text-md font-medium hover:bg-gray-100 rounded-md text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                    prefetch={true}
                  >
                    {dict.about.our_story}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile What We Do with submenu */}
            <div className="flex flex-col">
              <button
                className="p-2 text-lg font-medium hover:bg-gray-100 rounded-md text-primary-green text-left flex items-center justify-between"
                onClick={() => setActiveDropdown(activeDropdown === 'mobile-what-we-do' ? null : 'mobile-what-we-do')}
              >
                {dict.navigation.what_we_do}
                <ChevronDown className={`h-5 w-5 transform transition-transform ${activeDropdown === 'mobile-what-we-do' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'mobile-what-we-do' && (
                <div className="ml-4 mt-2 flex flex-col space-y-2">
                  <Link
                    href={`/${locale}/what-we-do/food-systems`}
                    className="p-2 text-md font-medium hover:bg-gray-100 rounded-md text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                    prefetch={true}
                  >
                    {dict.what_we_do.food_systems}
                  </Link>
                  <Link
                    href={`/${locale}/what-we-do/climate-change-adaptation`}
                    className="p-2 text-md font-medium hover:bg-gray-100 rounded-md text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                    prefetch={true}
                  >
                    {dict.what_we_do.climate_change_adaptation}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Programs with submenu */}
            <div className="flex flex-col">
              <button
                className="p-2 text-lg font-medium hover:bg-gray-100 rounded-md text-primary-green text-left flex items-center justify-between"
                onClick={() => setActiveDropdown(activeDropdown === 'mobile-programs' ? null : 'mobile-programs')}
              >
                {dict.navigation.programs}
                <ChevronDown className={`h-5 w-5 transform transition-transform ${activeDropdown === 'mobile-programs' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'mobile-programs' && (
                <div className="ml-4 mt-2 flex flex-col space-y-2">
                  <Link
                    href={`/${locale}/programs`}
                    className="p-2 text-md font-medium hover:bg-gray-100 rounded-md text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                    prefetch={true}
                  >
                    {dict.navigation.programs}
                  </Link>
                  <Link
                    href={`/${locale}/programs/fellowship`}
                    className="p-2 text-md font-medium hover:bg-gray-100 rounded-md text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                    prefetch={true}
                  >
                    Fellowship
                  </Link>
                  <Link
                    href={`/${locale}/programs/alumni`}
                    className="p-2 text-md font-medium hover:bg-gray-100 rounded-md text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                    prefetch={true}
                  >
                    Alumni
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile projects with submenu */}
            <div className="flex flex-col">
              <button
                className="p-2 text-lg font-medium hover:bg-gray-100 rounded-md text-primary-green text-left flex items-center justify-between"
                onClick={() => setActiveDropdown(activeDropdown === 'mobile-community' ? null : 'mobile-community')}
              >
                {dict.navigation.community_hub}
                <ChevronDown className={`h-5 w-5 transform transition-transform ${activeDropdown === 'mobile-community' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'mobile-community' && (
                <div className="ml-4 mt-2 flex flex-col space-y-2">
                  <Link
                    href={`/${locale}/projects/mentors`}
                    className="p-2 text-md font-medium hover:bg-gray-100 rounded-md text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                    prefetch={true}
                  >
                    {dict.community.mentors}
                  </Link>
                  <Link
                    href={`/${locale}/projects/fellows`}
                    className="p-2 text-md font-medium hover:bg-gray-100 rounded-md text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                    prefetch={true}
                  >
                    {dict.community.fellows}
                  </Link>
                  <Link
                    href={`/${locale}/projects/team`}
                    className="p-2 text-md font-medium hover:bg-gray-100 rounded-md text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                    prefetch={true}
                  >
                    Team
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile News & Updates with submenu */}
            <div className="flex flex-col">
              <button
                className="p-2 text-lg font-medium hover:bg-gray-100 rounded-md text-primary-green text-left flex items-center justify-between"
                onClick={() => setActiveDropdown(activeDropdown === 'mobile-news-updates' ? null : 'mobile-news-updates')}
              >
                News & Updates
                <ChevronDown className={`h-5 w-5 transform transition-transform ${activeDropdown === 'mobile-news-updates' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'mobile-news-updates' && (
                <div className="ml-4 mt-2 flex flex-col space-y-2">
                  <Link
                    href={`/${locale}/newsroom`}
                    className="p-2 text-md font-medium hover:bg-gray-100 rounded-md text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                    prefetch={true}
                  >
                    News & Updates  
                  </Link>
                  <Link
                    href={`/${locale}/contact-us`}
                    className="p-2 text-md font-medium hover:bg-gray-100 rounded-md text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                    prefetch={true}
                  >
                    Contact Us
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}