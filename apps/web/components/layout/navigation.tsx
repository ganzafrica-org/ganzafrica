"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown, Globe } from "lucide-react";
import { useDict } from '@/context/dictionary';

import LanguageSwitcher from "./language-switcher";

import { Button } from "@workspace/ui/components/button";


const SafeLink = Link as unknown as React.ComponentType<any>;
const SafeImage = Image as unknown as React.ComponentType<any>;
const SafeIconMenu = Menu as unknown as React.ComponentType<any>;
const SafeIconX = X as unknown as React.ComponentType<any>;
const SafeIconChevronDown = ChevronDown as unknown as React.ComponentType<any>;

// Define types for menu items
interface MenuItem {
  title: string;
  href: string;
  description: string;
}


// Define dictionary type
interface DictionaryType {
  navigation?: {
    about?: string;
    What_we_do?:string;
    programs?: string;
    our_impact? : string;
    projects?: string;
    opportunities?: string;
    contact?: string;
  };
  about?: {
    who_we_are?: string;
    our_story?: string;
    our_approach?: string;
    team?: string;
    [key: string]: string | undefined;
  };
}

// Define Navigation props
interface NavigationProps {
  isHomePage?: boolean;
}

const resolveHref = (path: string) => {
  if (!path) return "/";
  // Keep absolute URLs as-is
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // Avoid protocol-relative URLs like //about
  if (path.startsWith("//")) return `/${path.replace(/^\/+/, "")}`;
  // Ensure a single leading slash for internal routes
  return path.startsWith("/") ? path : `/${path}`;
};

// Menu items with descriptions for rich dropdowns
const aboutItems: MenuItem[] = [
    {
        title: "who we are",
        href: "/about/who-we-are",
        description: "Learn about our mission, vision, and the values that drive us."
    },
  {
    title: "Our Story",
    href: "/about/our-story",
    description:
      "The journey of how we started and what inspires our work every day.",
  },
    {
        title: "Our Approach",
        href: "/about/our-approach",
        description:
            "How we work, the processes we follow, and our commitment to excellence.",
    },
  {
    title: "Team",
    href: "/about/team",
    description:
      "Meet the talented individuals behind our mission. Learn about our team members, their expertise, and their contributions to our success.",
  },
];

const programsItems: MenuItem[] = [
  {
    title: "Fellowship Program",
    href: "/programs/fellowship",
    description:
      "Our flagship program empowering the next generation of African change-makers.",
  },
  {
    title: "Alumni Network",
    href: "/programs/alumni",
    description:
      "A network of graduates continuing to make an impact across the continent.",
  },
];

const newsItems: MenuItem[] = [
    {
        title: "Social Media Updates",
        href: "/newsroom",
        description: "Stay informed about our recent activities, projects, and success stories."
    },
  {
    title: "Opportunities",
    href: "/opportunities",
    description: "Explore current openings and ways to grow with us.",
  },
  {
    title: "Blogs",
    href: "/programs/one-event",
    description:
      "Read our latest insights, industry updates, and expert perspectives.",
  },
];


export default function Navigation({
  isHomePage = false,
}: NavigationProps) {
  const dict = useDict();
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    React.useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(
    null,
  );
  const [desktopDropdown, setDesktopDropdown] = React.useState<string | null>(
    null,
  );
  const [isScrolled, setIsScrolled] = React.useState<boolean>(false);
  const pathname = usePathname();
  const navRef = React.useRef<HTMLDivElement>(null);

  // Add scroll detection for header styling
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle dropdown for mobile menu
  const toggleDropdown = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  // Handle desktop dropdown hover
  const handleDesktopDropdownEnter = (dropdownName: string) => {
    setDesktopDropdown(dropdownName);
  };

  const handleDesktopDropdownLeave = () => {
    setDesktopDropdown(null);
  };

  // Determine header background class - always use white background for non-home pages
  const getHeaderBgClass = () => {
    if (isHomePage) {
      return cn(
        "fixed top-0 z-50 min-w-full transition-all duration-500",
        isScrolled ? "bg-white shadow-sm backdrop-blur-sm" : "",
      );
    } else {
      // For non-home pages, always use the same style (as if scrolled)
      return "fixed top-0 z-50 min-w-full bg-white shadow-sm backdrop-blur-sm";
    }
  };

  // Get text color for navigation items
  const getNavItemColor = () => {
    if (isHomePage) {
      // For home page
      if (isScrolled) {
        return "text-black";
      }
      return "text-white";
    }

    // For other pages, always black
    return "text-black";
  };

  const locale = ""; // Added placeholder for locale if needed, though dict usage suggests it might be handled elsewhere

  // Mobile menu content
  const renderMobileMenu = () => {
    return (
        <div className="fixed inset-0 z-[60] bg-white w-screen h-screen overflow-y-auto md:hidden">
          <div className="flex justify-between items-center px-4 py-4 border-b">
            <SafeLink href="/" className="relative z-50 flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="relative h-14 w-24">
                <SafeImage
                  src="/images/logo.png"
                  alt="GanzAfrica"
                  fill
                  sizes="(max-width: 768px) 300px, 200px"
                  className="object-contain"
                  priority
                />
              </div>
            </SafeLink>
            <Button
              variant="ghost"
              size="icon"
              className="text-black hover:bg-[#F5F5F5] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <SafeIconX className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex flex-col space-y-4 px-4 pt-6 pb-8 h-full border-red-600">
            {/* Mobile About with submenu */}
            <div className="flex flex-col w-full">
              <button
                className="p-2 text-lg font-medium hover:bg-[#F5F5F5] rounded-md text-primary-green text-left flex items-center justify-between"
                onClick={() => toggleDropdown("mobile-about")}
              >
                {dict?.navigation?.about || "About"}
                <SafeIconChevronDown
                  className={`h-5 w-5 transform transition-transform ${activeDropdown === "mobile-about" ? "rotate-180" : ""}`}
                />
              </button>
              {activeDropdown === "mobile-about" && (
                <div className="ml-4 mt-2 flex flex-col space-y-2">
                  {aboutItems.map((item) => (
                    <SafeLink
                      key={item.href}
                      href={resolveHref(item.href)}
                      className="p-2 text-md font-medium hover:bg-[#F5F5F5] rounded-md text-gray-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                      prefetch={true}
                    >
                      {dict?.about?.[
                        item.title.toLowerCase().replace(/ /g, "_")
                      ] || item.title}
                    </SafeLink>
                  ))}
                </div>
              )}
            </div>


            {/* what we do */}
            <div className="flex flex-col w-full">
              <button
                className="p-2 text-lg font-medium hover:bg-[#F5F5F5] rounded-md text-primary-green text-left flex items-center justify-between"
                onClick={() => toggleDropdown("mobile-programs")}
              >
                {dict?.navigation?.what_we_do || "What we do"}
                <SafeIconChevronDown
                  className={`h-5 w-5 transform transition-transform ${activeDropdown === "mobile-programs" ? "rotate-180" : ""}`}
                />
              </button>
              {activeDropdown === "mobile-programs" && (
                <div className="ml-4 mt-2 flex flex-col space-y-2">
                  {programsItems.map((item) => (
                    <SafeLink
                      key={item.href}
                      href={resolveHref(item.href)}
                      className="p-2 text-md font-medium hover:bg-[#F5F5F5] rounded-md text-gray-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                      prefetch={true}
                    >
                      {item.title}
                    </SafeLink>
                  ))}
                </div>
              )}
            </div>

            {/* Our Impact - Direct Link */}
            <SafeLink
              href={resolveHref("/our-impact")}
              className="p-2 text-lg font-medium hover:bg-[#F5F5F5] rounded-md text-primary-green"
              onClick={() => setIsMobileMenuOpen(false)}
              prefetch={true}
            >
              {dict?.navigation?.our_impact || "Our Impact"}
            </SafeLink>

            {/* News & Updates */}
            <div className="flex flex-col w-full">
              <button
                className="p-2 text-lg font-medium hover:bg-[#F5F5F5] rounded-md text-primary-green text-left flex items-center justify-between"
                onClick={() => toggleDropdown("mobile-news")}
              >
                News & Updates
                <SafeIconChevronDown
                  className={`h-5 w-5 transform transition-transform ${activeDropdown === "mobile-news" ? "rotate-180" : ""}`}
                />
              </button>
              {activeDropdown === "mobile-news" && (
                <div className="ml-4 mt-2 flex flex-col space-y-2">
                  {newsItems.map((item) => (
                    <SafeLink
                      key={item.href}
                      href={resolveHref(item.href)}
                      className="p-2 text-md text-primary-orange font-medium hover:bg-[#F5F5F5] rounded-md text-gray-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                      prefetch={true}
                    >
                      {item.title}
                    </SafeLink>
                  ))}
                </div>
              )}
            </div>

            {/* Contact - Direct Link */}
            <SafeLink
              href={resolveHref("/contact")}
              className="p-2 text-lg font-medium hover:bg-[#F5F5F5] rounded-md text-primary-green"
              onClick={() => setIsMobileMenuOpen(false)}
              prefetch={true}
            >
              {dict?.navigation?.contact || "Contact"}
            </SafeLink>

            {/* Add sign in button at the bottom */}
            {/*<div className="mt-auto pt-6 border-t">*/}
            {/*  <SafeLink href="/login" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>*/}
            {/*    <Button*/}
            {/*      size="lg"*/}
            {/*      className="w-full bg-[#073392] hover:bg-primary-green/90 text-white"*/}
            {/*    >*/}
            {/*      {dict?.cta?.sign_in || "Sign In"}*/}
            {/*    </Button>*/}
            {/*  </SafeLink>*/}
            {/*</div>*/}
          </nav>
        </div>
    );
  };

  return (
    <header ref={navRef} className={getHeaderBgClass()}>
      <div className="container min-w-full py-0">
        <div className="flex h-20 items-stretch justify-between relative">
          {/* Logo */}
          <div className="min-h-full w-32 md:w-52 flex items-center p-8">
            <SafeLink
              href="/"
              className="relative z-50 flex items-center gap-2"
              prefetch={true}
            >
              <div className="relative h-14 w-24">
                <SafeImage
                  src="/images/logo.png"
                  alt="GanzAfrica"
                  fill
                  sizes="(max-width: 768px) 300px, 200px"
                  className="object-contain"
                  priority
                />
              </div>
            </SafeLink>
          </div>

          {/* Desktop Navigation - Simple Dropdown */}
          <div className="hidden md:flex justify-center items-center space-x-1 flex-1 mx-4">
            <nav className="flex items-center space-x-1">
              {/* About Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleDesktopDropdownEnter("about")}
                onMouseLeave={handleDesktopDropdownLeave}
              >
                <button
                  className={`${getNavItemColor()} text-base md:text-sm lg:text-base font-medium px-4 py-2 flex items-center gap-1 hover:bg-accent/50 rounded-md transition-colors`}
                >
                  {dict?.navigation?.about || "About"}
                  <SafeIconChevronDown className={`h-4 w-4 transition-transform ${desktopDropdown === "about" ? "rotate-180" : ""}`} />
                </button>
                {desktopDropdown === "about" && (
                  <div className="absolute left-0 top-full mt-1 w-[300px] bg-white rounded-md border shadow-lg z-50">
                    <ul className="p-2">
                      {aboutItems.map((item) => (
                        <li key={item.href}>
                          <SafeLink
                            href={resolveHref(item.href)}
                            className="block p-3 rounded-md hover:bg-accent transition-colors"
                            prefetch={true}
                          >
                            <div className="text-sm font-medium leading-none">
                              {dict?.about?.[
                                item.title.toLowerCase().replace(/ /g, "_")
                              ] || item.title}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          </SafeLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* What we do Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleDesktopDropdownEnter("what-we-do")}
                onMouseLeave={handleDesktopDropdownLeave}
              >
                <button
                  className={`${getNavItemColor()} text-base md:text-sm lg:text-base font-medium px-4 py-2 flex items-center gap-1 hover:bg-accent/50 rounded-md transition-colors`}
                >
                  {dict?.navigation?.what_we_do || "What we do"}
                  <SafeIconChevronDown className={`h-4 w-4 transition-transform ${desktopDropdown === "what-we-do" ? "rotate-180" : ""}`} />
                </button>
                {desktopDropdown === "what-we-do" && (
                  <div className="absolute left-0 top-full mt-1 w-[300px] bg-white rounded-md border shadow-lg z-50">
                    <ul className="p-2">
                      {programsItems.map((item) => (
                        <li key={item.href}>
                          <SafeLink
                            href={resolveHref(item.href)}
                            className="block p-3 rounded-md hover:bg-accent transition-colors"
                            prefetch={true}
                          >
                            <div className="text-sm font-medium leading-none">
                              {item.title}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          </SafeLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Our Impact - Direct Link */}
              <SafeLink
                href={resolveHref("/our-impact")}
                className={`${getNavItemColor()} text-base md:text-sm lg:text-base font-medium px-4 py-2 hover:bg-accent/50 rounded-md transition-colors`}
                prefetch={true}
              >
                {dict?.navigation?.our_impact || "Our Impact"}
              </SafeLink>

              {/* News & Updates Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleDesktopDropdownEnter("news")}
                onMouseLeave={handleDesktopDropdownLeave}
              >
                <button
                  className={`${getNavItemColor()} text-base md:text-sm lg:text-base font-medium px-4 py-2 flex items-center gap-1 hover:bg-accent/50 rounded-md transition-colors`}
                >
                  News & Updates
                  <SafeIconChevronDown className={`h-4 w-4 transition-transform ${desktopDropdown === "news" ? "rotate-180" : ""}`} />
                </button>
                {desktopDropdown === "news" && (
                  <div className="absolute left-0 top-full mt-1 w-[300px] bg-white rounded-md border shadow-lg z-50">
                    <ul className="p-2">
                      {newsItems.map((item) => (
                        <li key={item.href}>
                          <SafeLink
                            href={resolveHref(item.href)}
                            className="block p-3 rounded-md hover:bg-accent transition-colors"
                            prefetch={true}
                          >
                            <div className="text-sm font-medium leading-none">
                              {item.title}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          </SafeLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Contact - Direct Link */}
              <SafeLink
                href={resolveHref("/contact")}
                className={`${getNavItemColor()} text-base md:text-sm lg:text-base font-medium px-4 py-2 hover:bg-accent/50 rounded-md transition-colors`}
                prefetch={true}
              >
                {dict?.navigation?.contact || "Contact"}
              </SafeLink>
            </nav>
          </div>

          {/* Right side items */}
          <div className="min-h-full p-4 w-auto flex items-center">
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 border-3">
                <LanguageSwitcher />
              </div>
              {/*<SafeLink href="/login" className="hidden md:block">*/}
              {/*  <Button*/}
              {/*    size="sm"*/}
              {/*    className="bg-primary-green hover:bg-primary-green/90 text-white px-6"*/}
              {/*  >*/}
              {/*    {dict?.cta?.sign_in || "Sign In"}*/}
              {/*  </Button>*/}
              {/*</SafeLink>*/}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-black hover:bg-[#F5F5F5] transition-colors"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {isMobileMenuOpen ? (
                    <SafeIconX className="h-6 w-6" />
                  ) : (
                    <SafeIconMenu className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && renderMobileMenu()}
    </header>
  );
}