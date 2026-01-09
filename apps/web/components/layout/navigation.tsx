"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown, Globe } from "lucide-react";
import { useDict } from '@/context/dictionary';

import LanguageSwitcher from "./language-switcher";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@workspace/ui/components/navigation-menu";
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

// Define props for ListItem component
interface ListItemProps {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
}

// Define dictionary type
interface DictionaryType {
  navigation?: {
    about?: string;
    our_approach?:string;
    programs?: string;
    projects?: string;
    opportunities?: string;
  };
  about?: {
    who_we_are?: string;
    our_story?: string;
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
    title: "Our Story",
    href: "/about/our-story",
    description:
      "The journey of how we started and what inspires our work every day.",
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
    title: "Fellowship",
    href: "/programs/fellowship",
    description:
      "Our flagship program empowering the next generation of African change-makers.",
  },
  {
    title: "Alumni",
    href: "/programs/alumni",
    description:
      "A network of graduates continuing to make an impact across the continent.",
  },
];

const newsItems: MenuItem[] = [
  {
    title: "Opportunities",
    href: "/opportunities",
    description: "Explore current openings and ways to grow with us.",
  },
  {
    title: "Contact Us",
    href: "/contact",
    description:
      "Get in touch with our team for inquiries, partnerships, or support.",
  },
];

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default function Navigation({
  isHomePage = false,
}: NavigationProps) {
  const dict = useDict();
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    React.useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(
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
          <nav className="flex flex-col space-y-4 px-4 pt-6 pb-8 h-full">
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

            {/* Our Approach - Direct Link */}
            <SafeLink
              href={resolveHref("/our-approach")}
              className="p-2 text-lg font-medium hover:bg-[#F5F5F5] rounded-md text-primary-green"
              onClick={() => setIsMobileMenuOpen(false)}
              prefetch={true}
            >
              {dict?.navigation?.our_approach || "Our Approach"}
            </SafeLink>

            {/* Programs */}
            <div className="flex flex-col w-full">
              <button
                className="p-2 text-lg font-medium hover:bg-[#F5F5F5] rounded-md text-primary-green text-left flex items-center justify-between"
                onClick={() => toggleDropdown("mobile-programs")}
              >
                {dict?.navigation?.programs || "Programs"}
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

          {/* Desktop Navigation using shadcn NavigationMenu */}
          <div className="hidden md:flex justify-center items-center space-x-1 flex-1 mx-4">
            <NavigationMenu>
              <NavigationMenuList>
                {/* About Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={`${getNavItemColor()} text-base md:text-sm lg:text-base font-medium`}>
                    {dict?.navigation?.about || "About"}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href={resolveHref("/about/who-we-are")}
                          >
                            <div className="mb-2 mt-4 text-lg font-medium">
                              Who We Are
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                            Learn about our mission, vision, and the values that drive us.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      {aboutItems.map((item) => (
                        <ListItem
                          key={item.href}
                          href={resolveHref(item.href)}
                          title={
                            dict?.about?.[
                              item.title.toLowerCase().replace(/ /g, "_")
                            ] || item.title
                          }
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                {/* Our Approach - Direct Link */} 
                <NavigationMenuItem>
                  <Link href={resolveHref("/our-approach")} passHref>
                    <NavigationMenuLink 
                      className={`${getNavItemColor()} block px-0 py-2 text-base md:text-sm lg:text-base font-medium hover:text-accent-foreground`}
                    >
                      {dict?.navigation?.our_approach || "Our Approach"}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                {/* Programs Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={`${getNavItemColor()} text-base md:text-sm lg:text-base font-medium`}>
                    {dict?.navigation?.programs || "Programs"}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href={resolveHref("/projects")}
                          >
                            <div className="mb-2 mt-4 text-lg font-medium">
                             Our Projects
                           </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                            Innovative initiatives driving Africa’s transformation through technology, youth empowerment, and sustainable development.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      {programsItems.map((item) => (
                        <ListItem
                          key={item.href}
                          href={resolveHref(item.href)}
                          title={item.title}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>              

                {/* News & Updates Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={`${getNavItemColor()} text-base md:text-sm lg:text-base font-medium`}>
                    News & Updates
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href={resolveHref("/newsroom")}
                          >
                            <div className="mb-2 mt-4 text-lg font-medium">
                              News & Updates
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Stay informed about our recent activities,
                              projects, and success stories.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      {newsItems.map((item) => (
                        <ListItem
                          key={item.href}
                          href={resolveHref(item.href)}
                          title={item.title}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side items */}
          <div className="min-h-full p-4 w-auto flex items-center">
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
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