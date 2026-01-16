"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
// import GoogleTranslate from "@/components/google-translate";
import { useDict } from "@/context/dictionary";
import { TranslatableText } from "@/components/translate/TranslatableText";

// Import shadcn Navigation Menu components
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@workspace/ui/components/navigation-menu";
import LanguageSwitcher from "@/components/layout/language-switcher";

// Define types for menu items
interface MenuItem {
  title: string;
  href: string;
  description?: string;
  hasSubmenu?: boolean;
}

// Define props for ListItem component
interface ListItemProps {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
  onClick?: () => void;
}

// Define dictionary type
interface DictionaryType {
  navigation?: {
    about?: string;
    our_approach?: string;
    programs?: string;
    projects?: string;
    opportunities?: string;
  };
  about?: {
    who_we_are?: string;
    our_story?: string;
    team?: string;
    [key: string]: string | undefined;
  };

  home?: {
    hero?: {
      title?: string;
      subtitle?: string;
      title_after?: {
        line1?: string;
        line2?: string;
        line3?: string;
        line4?: string;
      };
    };
  };
  cta?: {
    sign_in?: string;
    discover_more?: string;
  };
}

// Define HomeHero props
interface HomeHeroProps {
  backgroundImage?: string;
}

const resolveHref = (path: string) => (path.startsWith("/") ? path : `/${path}`);


export default function HomeHero({
  backgroundImage = "/images/hero-test.jpg",
}: HomeHeroProps) {
  const dict = useDict();
  // Refs with proper types
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const whiteOverlayRef = useRef<HTMLDivElement>(null);
  const initialContentRef = useRef<HTMLDivElement>(null);
  const finalContentRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // States
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [animationStarted, setAnimationStarted] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [desktopDropdown, setDesktopDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  const pathname = usePathname();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Navigation items for shadcn navigation
  const aboutItems: MenuItem[] = [
      {
          title: dict.about?.who_we_are || "who we are",
          href: "/about/who-we-are",
          description:
              "The journey of how we started and what inspires our work every day.",
      },
    {
      title: dict.about?.our_story || "Our Story",
      href: "/about/our-story",
      description:
        "The journey of how we started and what inspires our work every day.",
    },
      {
          title: dict.about?.our_approach || "Our Approach",
          href: "/about/our-approach",
          description:
              "The journey of how we started and what inspires our work every day.",
      },
    {
      title: dict.about?.team || "Team",
      href: "/about/team",
      description:
        "Meet the talented individuals behind our mission. Learn about our team members, their expertise, and their contributions to our success.",
    },
  ];

  const programsItems: MenuItem[] = [
    {
      title: "Program",
      href: "/programs",
      hasSubmenu: true, // Optional flag for future logic
    },
    {
      title: "Projects",
      href: "/projects",
    },
  ];

  const programSubItems: MenuItem[] = [
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
          description: "Stay informed about our recent activities, projects, and success stories.",
      },
    {
      title: "Opportunities",
      href: "/opportunities",
      description: "Explore current openings and ways to grow with us.",
    }
  ];

  // Add scroll detection for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle video loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setVideoLoaded(true);
      if (!animationStarted) {
        startTransition();
      }
    };

    if (video.readyState >= 3) {
      handleCanPlay();
    } else {
      video.addEventListener("canplay", handleCanPlay);
    }

    const timeoutId = setTimeout(() => {
      if (!animationStarted) {
        startTransition();
      }
    }, 5000);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      clearTimeout(timeoutId);
    };
  }, [animationStarted]);

  // Function to start the transition
  const startTransition = () => {
    if (animationStarted) return;
    setAnimationStarted(true);

    if (
      !sectionRef.current ||
      !whiteOverlayRef.current ||
      !initialContentRef.current ||
      !finalContentRef.current ||
      !videoContainerRef.current ||
      !navRef.current
    )
      return;

    // Check if we're on a small screen (mobile/tablet)
    const isSmallScreen = window.innerWidth < 768;

    // Set initial states
    gsap.set(whiteOverlayRef.current, {
      y: "-100%",
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
    });
    gsap.set(finalContentRef.current, { opacity: 0 });

    // Initial video state (full screen)
    gsap.set(videoContainerRef.current, {
      clipPath: "none",
      height: "100%",
      bottom: 0,
    });

    // On small screens, we want the video to stay as a full background
    // and skip the curved clipPath animation. Just fade in the final content.
    if (isSmallScreen) {
      navRef.current.setAttribute("data-overlay-passed", "true");
      gsap.set(finalContentRef.current, { opacity: 1 });
      return;
    }

    // Create animation timeline
    const tl = gsap.timeline();

    // Set nav color to black right before the animation starts
    navRef.current.setAttribute("data-overlay-passed", "true");

    tl.to(initialContentRef.current, {
      opacity: 0,
      duration: 2.5,
    })
      .to(whiteOverlayRef.current, {
        y: "0%",
        duration: 1.2,
        ease: "power2.inOut",
        clipPath: "url(#hero-clip)",
      })
      .to(
        videoContainerRef.current,
        {
          clipPath: "url(#hero-clip-inverted)",
          height: "35%",
          bottom: 0,
          duration: 1.2,
          ease: "power2.inOut",
        },
        "<",
      )
      .to(finalContentRef.current, {
        opacity: 1,
        duration: 0.8,
      });
  };

  // Dropdown handling functions for mobile
  const handleDropdownOpen = (dropdownName: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown(dropdownName);
  };

  const handleDropdownClose = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 300);
  };

  const handleDropdownContentEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
  };

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

  // Determine header background class based on scroll and animation state
  const getHeaderBgClass = () => {
    return cn(
      "fixed top-0 z-50 min-w-full transition-all duration-500",
      isScrolled && !animationStarted ? "bg-black/30 backdrop-blur-sm" : "",
      isScrolled && animationStarted
        ? "bg-white shadow-sm backdrop-blur-sm"
        : "",
      !isScrolled ? "bg-transparent" : "",
    );
  };

  // Get text color for navigation items
  const getNavItemColor = () => {
    if (
      animationStarted &&
      navRef.current?.getAttribute("data-overlay-passed") === "true"
    ) {
      return "text-black bg-transparent";
    }
    return "text-white bg-transparent";
  };

  // Render simple dropdown navigation for desktop
  const renderDesktopNavigation = () => {
    const textColor = getNavItemColor();

    return (
      <div className="hidden md:flex justify-center items-center space-x-1 flex-1 mx-4">
        <nav className="flex items-center space-x-1">
          {/* About Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleDesktopDropdownEnter("about")}
            onMouseLeave={handleDesktopDropdownLeave}
          >
            <button
              className={`${textColor} text-base font-medium px-4 py-2 flex items-center gap-1 hover:bg-accent/50 rounded-md transition-colors`}
            >
              {dict.navigation?.about || "About"}
              <ChevronDown className={`h-4 w-4 transition-transform ${desktopDropdown === "about" ? "rotate-180" : ""}`} />
            </button>
            {desktopDropdown === "about" && (
              <div className="absolute left-0 top-full -mt-1 w-[300px] bg-white rounded-md border shadow-lg z-50">
                <ul className="p-2">
                  {aboutItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={resolveHref(item.href)}
                        className="block p-3 rounded-md hover:bg-accent transition-colors"
                        prefetch={true}
                      >
                        <div className="text-sm font-medium leading-none">
                          {dict?.about?.[
                            item.title.toLowerCase().replace(/ /g, "_")
                          ] || item.title}
                        </div>
                        {item.description && (
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                      </Link>
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
              className={`${textColor} text-base font-medium px-4 py-2 flex items-center gap-1 hover:bg-accent/50 rounded-md transition-colors`}
            >
              {dict.navigation?.what_we_do || "What we do"}
              <ChevronDown className={`h-4 w-4 transition-transform ${desktopDropdown === "what-we-do" ? "rotate-180" : ""}`} />
            </button>
            {(desktopDropdown === "what-we-do" || desktopDropdown === "program-submenu") && (
              <div className="absolute left-0 top-full -mt-1 w-[300px] bg-white rounded-md border shadow-lg z-50">
                <ul className="p-2">
                  {programsItems.map((item) => {
                    const isSubmenuOpen = desktopDropdown === "program-submenu";
                    return (
                      <li 
                        key={item.href}
                        className="relative"
                        onMouseEnter={() => item.hasSubmenu && handleDesktopDropdownEnter("program-submenu")}
                      >
                        {item.hasSubmenu ? (
                          <div className="block p-3 rounded-md hover:bg-accent transition-colors">
                            <div className="text-sm font-medium leading-none flex items-center justify-between">
                              {item.title}
                              <ChevronDown className={`h-3 w-3 transition-transform ${isSubmenuOpen ? "rotate-180" : ""}`} />
                            </div>
                            {item.description && (
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            )}
                            {isSubmenuOpen && (
                              <div 
                                className="absolute left-full top-0 ml-1 w-[280px] bg-white rounded-md border shadow-lg z-50"
                                onMouseEnter={() => handleDesktopDropdownEnter("program-submenu")}
                                onMouseLeave={() => handleDesktopDropdownEnter("what-we-do")}
                              >
                                <ul className="p-2">
                                  {programSubItems.map((subItem) => (
                                    <li key={subItem.href}>
                                      <Link
                                        href={resolveHref(subItem.href)}
                                        className="block p-3 rounded-md hover:bg-accent transition-colors"
                                        prefetch={true}
                                      >
                                        <div className="text-sm font-medium leading-none">
                                          {subItem.title}
                                        </div>
                                        {subItem.description && (
                                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                                            {subItem.description}
                                          </p>
                                        )}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={resolveHref(item.href)}
                            className="block p-3 rounded-md hover:bg-accent transition-colors"
                            prefetch={true}
                          >
                            <div className="text-sm font-medium leading-none">
                              {item.title}
                            </div>
                            {item.description && (
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            )}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* News & Updates Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleDesktopDropdownEnter("news")}
            onMouseLeave={handleDesktopDropdownLeave}
          >
            <button
              className={`${textColor} text-base font-medium px-4 py-2 flex items-center gap-1 hover:bg-accent/50 rounded-md transition-colors`}
            >
              News & Updates
              <ChevronDown className={`h-4 w-4 transition-transform ${desktopDropdown === "news" ? "rotate-180" : ""}`} />
            </button>
            {desktopDropdown === "news" && (
              <div className="absolute left-0 top-full -mt-1 w-[300px] bg-white rounded-md border shadow-lg z-50">
                <ul className="p-2">
                  {newsItems.map((item) => (
                    <li key={item.href}>
                      <Link
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
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Contact - Direct Link */}
          <Link
            href={resolveHref("/contact")}
            className={`${textColor} text-base font-medium px-4 py-2 hover:bg-accent/50 rounded-md transition-colors`}
            prefetch={true}
          >
            {dict.navigation?.contact || "Contact"}
          </Link>
        </nav>
      </div>
    );
  };

  // Mobile menu content
  const renderMobileMenu = () => {
    return (
      <div className="fixed inset-0 z-50 bg-white w-screen h-screen overflow-y-auto md:hidden">
        <div className="flex justify-between items-center px-4 py-4 border-b">
          <Link href={`/`} className="relative z-50 flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="relative h-14 w-24">
              <Image
                src="/images/logo.png"
                alt="GanzAfrica"
                fill
                sizes="(max-width: 768px) 300px, 200px"
                className="object-contain border"
                priority
              />
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-black hover:bg-[#F5F5F5] transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="flex flex-col space-y-4 px-4 pt-6 pb-8 h-full">
          {/* Mobile About with submenu */}
          <div className="flex flex-col w-full">
            <button
              className="p-2 text-lg font-medium hover:bg-[#F5F5F5] rounded-md text-primary-green text-left flex items-center justify-between"
              onClick={() => toggleDropdown("mobile-about")}
            >
              {dict.navigation?.about || "About"}
              <ChevronDown
                className={`h-5 w-5 transform transition-transform ${activeDropdown === "mobile-about" ? "rotate-180" : ""}`}
              />
            </button>
            {activeDropdown === "mobile-about" && (
              <div className="ml-4 mt-2 flex flex-col space-y-2">
                {aboutItems.map((item) => (
                  <Link
                    key={item.href}
                    href={resolveHref(item.href)}
                    className="p-2 text-md font-medium hover:bg-[#F5F5F5] rounded-md text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                    prefetch={true}
                  >
                    {dict?.about?.[
                      item.title.toLowerCase().replace(/ /g, "_")
                    ] || item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Programs */}
          <div className="flex flex-col w-full">
            <button
              className="p-2 text-lg font-medium hover:bg-[#F5F5F5] rounded-md text-primary-green text-left flex items-center justify-between"
              onClick={() => toggleDropdown("mobile-programs")}
            >
              {dict.navigation?.what_we_do || "what we do"}
              <ChevronDown
                className={`h-5 w-5 transform transition-transform ${activeDropdown === "mobile-programs" ? "rotate-180" : ""}`}
              />
            </button>
            {(activeDropdown === "mobile-programs" || activeDropdown === "mobile-program-submenu") && (
              <div className="ml-4 mt-2 flex flex-col space-y-2">
                {programsItems.map((item) => {
                  const isSubmenuOpen = activeDropdown === "mobile-program-submenu";
                  return (
                    <div key={item.href} className="flex flex-col w-full">
                      {item.hasSubmenu ? (
                        <>
                          <button
                            className="p-2 text-md font-medium hover:bg-[#F5F5F5] rounded-md text-gray-700 text-left flex items-center justify-between"
                            onClick={() => toggleDropdown("mobile-program-submenu")}
                          >
                            {item.title}
                            <ChevronDown
                              className={`h-4 w-4 transform transition-transform ${isSubmenuOpen ? "rotate-180" : ""}`}
                            />
                          </button>
                          {isSubmenuOpen && (
                            <div className="ml-4 mt-2 flex flex-col space-y-2">
                              {programSubItems.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  href={resolveHref(subItem.href)}
                                  className="p-2 text-sm font-medium hover:bg-[#F5F5F5] rounded-md text-gray-600"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  prefetch={true}
                                >
                                  {subItem.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link
                          href={resolveHref(item.href)}
                          className="p-2 text-md font-medium hover:bg-[#F5F5F5] rounded-md text-gray-700"
                          onClick={() => setIsMobileMenuOpen(false)}
                          prefetch={true}
                        >
                          {item.title}
                        </Link>
                      )}
                    </div>
                  );
                })}
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
              <ChevronDown
                className={`h-5 w-5 transform transition-transform ${activeDropdown === "mobile-news" ? "rotate-180" : ""}`}
              />
            </button>
            {activeDropdown === "mobile-news" && (
              <div className="ml-4 mt-2 flex flex-col space-y-2">
                {newsItems.map((item) => (
                  <Link
                    key={item.href}
                    href={resolveHref(item.href)}
                    className="p-2 text-md font-medium hover:bg-[#F5F5F5] rounded-md text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                    prefetch={true}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Contact - Direct Link */}
          <Link
            href={`/contact`}
            className="p-2 text-lg font-medium hover:bg-[#F5F5F5] rounded-md text-primary-green"
            onClick={() => setIsMobileMenuOpen(false)}
            prefetch={true}
          >
            {dict.navigation?.contact || "Contact"}
          </Link>

          {/* Add sign in button at the bottom */}
          {/* <div className="mt-auto pt-6 border-t">*/}
            {/*  <Link href={`/login`} className="w-full" onClick={() => setIsMobileMenuOpen(false)}>*/}
            {/*  <Button*/}
            {/*    size="lg"*/}
            {/*    className="w-full bg-primary-green hover:bg-primary-green/90 text-white"*/}
            {/*  >*/}
            {/*    {dict?.cta?.sign_in || "Sign In"}*/}
            {/*  </Button>*/}
            {/*</Link>*/}
            {/*   <LanguageSwitcher/>*/}
           {/*</div>*/}
        </nav>
      </div>
    );
  };

  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden">
      {/* Header */}
      <header
        ref={navRef}
        className={getHeaderBgClass()}
        data-overlay-passed={animationStarted ? "true" : "false"}
      >
        <div className="container min-w-full py-0">
          <div className="flex h-20 items-stretch justify-between relative">
            {/* Logo */}
            <div className="bg-white rounded-tr-none rounded-br-2xl  min-h-full w-32 md:w-52 flex justify-center items-center p-8">
              <Link
                href={`/`}
                className="relative z-50 flex items-center gap-2"
                prefetch={true}
              >
                <div className="relative h-14 w-24">
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
            </div>

            {/* Desktop Navigation */}
            {renderDesktopNavigation()}

            {/* Right side items */}
            <div className="bg-white rounded-tl-none rounded-bl-2xl min-h-full p-4 w-auto flex items-center">
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <div className="md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "hover:bg-[#F5F5F5] transition-colors",
                      !animationStarted ||
                        navRef.current?.getAttribute("data-overlay-passed") !==
                        "true"
                        ? "text-white"
                        : "text-black",
                    )}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                  >
                    {isMobileMenuOpen ? (
                      <X className="h-6 w-6" />
                    ) : (
                      <Menu className="h-6 w-6" />
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

      {/* Video background container */}
      <div
        ref={videoContainerRef}
        // ="absolute inset-0 z-0 md:z-10 overflow-hidden"
        className="absolute inset-x-0 z-10 overflow-hidden hidden md:block"
        style={{
          height: "100%",
          bottom: 0,
        }}
      >
        <div className="absolute inset-0 bg-secondary-green/60 z-20"></div>

        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt="Hero background"
            fill
            priority
            quality={75}
            className="object-cover"
          />
        </div>

        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          preload="auto"
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Initial content */}
      <div
        ref={initialContentRef}
        className="absolute inset-0 flex items-center top-52 justify-center z-30 hidden md:block"
      >
        <div className="text-center text-white mt-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl mx-auto">
            {dict?.home?.hero?.title ||
              "Sustainable Solutions for Africa's Future"}
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            {dict?.home?.hero?.subtitle ||
              "Empowering youth to address agri-food systems challenges in Africa"}
          </p>
        </div>
      </div>

      {/* SVG definitions */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-primary-green">
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <clipPath id="hero-clip" clipPathUnits="objectBoundingBox">
              <path d="M0,0 H1 V0.85 C0.83,0.7 0.66,0.65 0.5,0.65 C0.33,0.65 0.16,0.7 0,0.85 L0,0 Z" />
            </clipPath>
          </defs>
        </svg>
      </div>

      {/* White overlay */}
      <div
        ref={whiteOverlayRef}
            // className="absolute inset-0 bg-white z-30 hidden md:block"
        className="absolute inset-0 bg-white z-30"
        style={{
          transform: "translateY(-100%)",
          clipPath: "url(#hero-clip)",
        }}
      ></div>

      {/* Final content */}
      <div
        ref={finalContentRef}
        className="absolute inset-0 z-40 opacity-0 pt-24 flex flex-col items-center md:items-start justify-center md:justify-start"
      >
        <div className="container mx-auto px-4 text-center mt-10 sm:mt-20 md:mt-20 hidden md:block">
          <h1 className="text-2xl lg:text-4xl font-bold mb-4 sm:mb-6">
            <TranslatableText as="span" className="text-primary-green">
              {dict?.home?.hero?.title_after?.line1 || "A PROSPEROUS AND"}
            </TranslatableText>{" "}
            <br />
            <TranslatableText as="span" className="text-primary-green">
              {dict?.home?.hero?.title_after?.line2 || "SUSTAINABLE"}
            </TranslatableText>{" "}
            <TranslatableText as="span" className="text-primary-orange">
              {dict?.home?.hero?.title_after?.line3 || "FUTURE FOR"}
            </TranslatableText>{" "}
            <br />
            <TranslatableText as="span" className="text-primary-orange">
              {dict?.home?.hero?.title_after?.line4 || "AFRICA"}
            </TranslatableText>
          </h1>

          <TranslatableText
            as="p"
            className="text-base max-w-3xl mx-auto mb-6 sm:mb-8 text-gray-800"
          >
            {dict?.home?.hero?.subtitle ||
              "Empowering youth through sustainable land management, agriculture, and environmental initiatives"}
          </TranslatableText>

          <Link href={`/about/who-we-are`} prefetch={true}>
            <Button
              size="lg"
              className="bg-primary-green hover:bg-primary-green/90 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 text-lg sm:text-base"
            >
              {dict?.cta?.discover_more || "Discover More"}
            </Button>
          </Link>
        </div>
        {/* MOBILE */}
        <div className="container mx-auto px-4 text-center block md:hidden">
          <h1 className="text-5xl lg:text-4xl font-bold mb-4 sm:mb-6">
            <TranslatableText as="span" className="text-primary-green">
              {dict?.home?.hero?.title_after?.line1 || "A PROSPEROUS AND"}
            </TranslatableText>{" "}
            <br />
            <TranslatableText as="span" className="text-primary-green">
              {dict?.home?.hero?.title_after?.line2 || "SUSTAINABLE"}
            </TranslatableText>{" "}
            <TranslatableText as="span" className="text-primary-orange">
              {dict?.home?.hero?.title_after?.line3 || "FUTURE FOR"}
            </TranslatableText>{" "}
            <br />
            <TranslatableText as="span" className="text-primary-orange">
              {dict?.home?.hero?.title_after?.line4 || "AFRICA"}
            </TranslatableText>
          </h1>

          <TranslatableText
            as="p"
            className="text-3xl max-w-3xl mx-auto mb-6 sm:mb-8 text-gray-800"
          >
            {dict?.home?.hero?.subtitle ||
              "Empowering youth through sustainable land management, agriculture, and environmental initiatives"}
          </TranslatableText>

          <Link href={`/about/who-we-are`} prefetch={true}>
            <Button
              size="lg"
              className="bg-primary-green hover:bg-primary-green/90 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 text-lg sm:text-base"
            >
              <TranslatableText>
                {dict?.cta?.discover_more || "Discover More"}
              </TranslatableText>
            </Button>
          </Link>
        </div>

        {/* Leaves */}
        <div className="absolute -left-1 top-1/3 transform rotate-[31.83deg] -translate-x-1/4 z-50 w-0 sm:w-[100px] md:w-[150px] lg:w-[200px] hidden sm:block aspect-square">
          <Image
            src="/images/leaf.png"
            alt="Decorative leaf"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="absolute -right-1 top-1/4 rotate-[-60deg] transform translate-x-1/4 z-50 w-0 sm:w-[100px] md:w-[150px] lg:w-[200px] hidden sm:block aspect-square overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              src="/images/leaf.png"
              alt="Decorative leaf"
              fill
              className="object-contain rotate-180"
              priority
            />
          </div>
        </div>
      </div>

      {/* Overlay video above all content */}
      <div className="pointer-events-none absolute inset-0 z-60">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-30"
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
