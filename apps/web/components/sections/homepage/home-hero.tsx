'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from '@workspace/ui/components/button';
import { cn } from "@workspace/ui/lib/utils";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/components/layout/language-switcher";

interface HomeHeroProps {
    locale: string;
    dict: any;
}

export default function HomeHero({ locale, dict }: HomeHeroProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const whiteOverlayRef = useRef<HTMLDivElement>(null);
    const initialContentRef = useRef<HTMLDivElement>(null);
    const finalContentRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLDivElement>(null);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [animationStarted, setAnimationStarted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
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
            video.addEventListener('canplay', handleCanPlay);
        }

        const timeoutId = setTimeout(() => {
            if (!animationStarted) {
                startTransition();
            }
        }, 5000);

        return () => {
            video.removeEventListener('canplay', handleCanPlay);
            clearTimeout(timeoutId);
        };
    }, [animationStarted]);

    // Function to start the transition
    const startTransition = () => {
        if (animationStarted) return;
        setAnimationStarted(true);

        if (!sectionRef.current || !whiteOverlayRef.current || !initialContentRef.current || !finalContentRef.current || !videoContainerRef.current || !navRef.current) return;

        // Set initial states
        gsap.set(whiteOverlayRef.current, {
            y: '-100%',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)'
        });
        gsap.set(finalContentRef.current, { opacity: 0 });

        // Initial video state (full screen)
        gsap.set(videoContainerRef.current, {
            clipPath: 'none',
            height: '100%',
            bottom: 0
        });

        // Create animation timeline
        const tl = gsap.timeline();

        // Set nav color to black right before the animation starts
        navRef.current.setAttribute('data-overlay-passed', 'true');

        tl.to(initialContentRef.current, {
            opacity: 0,
            duration: 7.5
        })
            .to(whiteOverlayRef.current, {
                y: '0%',
                duration: 1.2,
                ease: "power2.inOut",
                clipPath: 'url(#hero-clip)'
            })
            .to(videoContainerRef.current, {
                clipPath: 'url(#hero-clip-inverted)',
                height: '35%',
                bottom: 0,
                duration: 1.2,
                ease: "power2.inOut"
            }, "<")
            .to(finalContentRef.current, {
                opacity: 1,
                duration: 0.8
            });
    };

    // Dropdown handling functions
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

    return (
        <section ref={sectionRef} className="relative h-screen overflow-hidden">
            {/* Video background container */}
            <div
                ref={videoContainerRef}
                className="absolute inset-x-0 z-10 overflow-hidden"
                style={{
                    height: '100%',
                    bottom: 0
                }}
            >
                <div className="absolute inset-0 bg-secondary-green/60 z-20"></div>

                <div className="absolute inset-0">
                    <Image
                        src="/images/hero-test.jpg"
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

            {/* Header */}
            <header
                ref={navRef}
                className={cn(
                    "fixed top-0 z-50 min-w-full transition-all duration-500",
                    isScrolled && !animationStarted ? "bg-black/30 backdrop-blur-sm" : "",
                    isScrolled && animationStarted ? "bg-white/90 shadow-sm backdrop-blur-sm" : ""
                )}
                data-overlay-passed="false"
            >
                <div className="container min-w-full py-0">
                    <div className="flex h-20 items-stretch justify-between relative">
                        {/* Logo */}
                        <div className="bg-white rounded-tr-none rounded-br-2xl shadow-sm min-h-full w-32 md:w-52 flex items-center p-8">
                            <Link
                                href={`/${locale}`}
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
                        <div className="hidden md:flex justify-center items-center space-x-1 flex-1 mx-4">
                            {/* About Dropdown */}
                            <div className="relative">
                                <span
                                    className={cn(
                                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                                        navRef.current?.getAttribute('data-overlay-passed') === 'true' ? "text-black hover:bg-gray-100" : "text-white hover:bg-white/10",
                                        pathname.includes("/about") && animationStarted && navRef.current?.getAttribute('data-overlay-passed') === 'true' ? "text-primary-green" : ""
                                    )}
                                    onClick={() => toggleDropdown('about')}
                                    onMouseEnter={() => handleDropdownOpen('about')}
                                    onMouseLeave={handleDropdownClose}
                                >
                                    {dict.navigation?.about || "About"}
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                </span>

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
                                                {dict.about?.who_we_are || "Who We Are"}
                                            </Link>
                                            <Link
                                                href={`/${locale}/about/our-story`}
                                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                prefetch={true}
                                            >
                                                {dict.about?.our_story || "Our Story"}
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
                                        navRef.current?.getAttribute('data-overlay-passed') === 'true' ? "text-black hover:bg-gray-100" : "text-white hover:bg-white/10",
                                        pathname.includes("/what-we-do") && animationStarted && navRef.current?.getAttribute('data-overlay-passed') === 'true' ? "text-primary-green" : ""
                                    )}
                                    onClick={() => toggleDropdown('what-we-do')}
                                    onMouseEnter={() => handleDropdownOpen('what-we-do')}
                                    onMouseLeave={handleDropdownClose}
                                >
                                    {dict.navigation?.what_we_do || "What We Do"}
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
                                                {dict.what_we_do?.food_systems || "Food Systems"}
                                            </Link>
                                            <Link
                                                href={`/${locale}/what-we-do/climate-change-adaptation`}
                                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                prefetch={true}
                                            >
                                                {dict.what_we_do?.climate_change_adaptation || "Climate Change Adaptation"}
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
                                        navRef.current?.getAttribute('data-overlay-passed') === 'true' ? "text-black hover:bg-gray-100" : "text-white hover:bg-white/10",
                                        pathname.includes("/programs") && animationStarted && navRef.current?.getAttribute('data-overlay-passed') === 'true' ? "text-primary-green" : ""
                                    )}
                                    onClick={() => toggleDropdown('programs')}
                                    onMouseEnter={() => handleDropdownOpen('programs')}
                                    onMouseLeave={handleDropdownClose}
                                >
                                    {dict.navigation?.programs || "Programs"}
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

                            {/* Community Hub Dropdown */}
                            <div className="relative">
    <span
        className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
            navRef.current?.getAttribute('data-overlay-passed') === 'true'
                ? "text-black hover:bg-gray-100"
                : "text-white hover:bg-white/10",
            pathname.includes("/community-hub") && animationStarted && navRef.current?.getAttribute('data-overlay-passed') === 'true'
                ? "text-primary-green"
                : ""
        )}
        onClick={() => toggleDropdown('community-hub')}
        onMouseEnter={() => handleDropdownOpen('community-hub')}
        onMouseLeave={handleDropdownClose}
    >
        {dict.navigation?.community_hub || "Community Hub"}
        <ChevronDown className="ml-1 h-4 w-4" />
    </span>

                                {activeDropdown === 'community-hub' && (
                                    <div
                                        className="absolute left-0 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                                        onMouseEnter={handleDropdownContentEnter}
                                        onMouseLeave={handleDropdownClose}
                                    >
                                        <div className="py-1 flex flex-col">
                                            <Link
                                                href={`/${locale}/community-hub/team`}
                                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                prefetch={true}
                                            >
                                                Team
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* News & Updates Dropdown */}
                            <div className="relative">
                                <span
                                    className={cn(
                                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                                        navRef.current?.getAttribute('data-overlay-passed') === 'true' ? "text-black hover:bg-gray-100" : "text-white hover:bg-white/10",
                                        pathname.includes("/newsroom") && animationStarted && navRef.current?.getAttribute('data-overlay-passed') === 'true' ? "text-primary-green" : ""
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
                        </div>

                        {/* Right side items with inverted top-left corner */}
                        <div className="bg-white rounded-tl-none rounded-bl-2xl min-h-full p-4 w-56 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="mr-2">
                                    <LanguageSwitcher />
                                </div>
                                <Link href={`/${locale}/login`}>
                                    <Button
                                        size="sm"
                                        className="bg-primary-green hover:bg-primary-green/90 text-white px-6"
                                    >
                                        {dict.cta?.sign_in || "Sign In"}
                                    </Button>
                                </Link>
                                <div className="md:hidden ">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "hover:bg-white/20",
                                            !animationStarted || navRef.current?.getAttribute('data-overlay-passed') !== 'true'
                                                ? "text-white"
                                                : "text-black"
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
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 bg-white pt-20 md:hidden overflow-y-auto">
                        <div className="absolute right-4 top-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-black hover:bg-gray-100"
                                onClick={() => setIsMobileMenuOpen(false)}
                                aria-label="Close menu"
                            >
                                <X className="h-6 w-6" />
                            </Button>
                        </div>
                        <nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
                            {/* Mobile About with submenu */}
                            <div className="flex flex-col">
                                <button
                                    className="p-2 text-lg font-medium hover:bg-gray-100 rounded-md text-primary-green text-left flex items-center justify-between"
                                    onClick={() => setActiveDropdown(activeDropdown === 'mobile-about' ? null : 'mobile-about')}
                                >
                                    {dict.navigation?.about || "About"}
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
                                            {dict.about?.who_we_are || "Who We Are"}
                                        </Link>
                                        <Link
                                            href={`/${locale}/about/our-story`}
                                            className="p-2 text-md font-medium hover:bg-gray-100 rounded-md text-gray-700"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            prefetch={true}
                                        >
                                            {dict.about?.our_story || "Our Story"}
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* What We Do */}
                            <div className="flex flex-col">
                                <button
                                    className="p-2 text-lg font-medium hover:bg-gray-100 rounded-md text-primary-green text-left flex items-center justify-between"
                                    onClick={() => setActiveDropdown(activeDropdown === 'mobile-what-we-do' ? null : 'mobile-what-we-do')}
                                >
                                    {dict.navigation?.what_we_do || "What We Do"}
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
                                            {dict.what_we_do?.food_systems || "Food Systems"}
                                        </Link>
                                        <Link
                                            href={`/${locale}/what-we-do/climate-change-adaptation`}
                                            className="p-2 text-md font-medium hover:bg-gray-100 rounded-md text-gray-700"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            prefetch={true}
                                        >
                                            {dict.what_we_do?.climate_change_adaptation || "Climate Change Adaptation"}
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Programs */}
                            <div className="flex flex-col">
                                <button
                                    className="p-2 text-lg font-medium hover:bg-gray-100 rounded-md text-primary-green text-left flex items-center justify-between"
                                    onClick={() => setActiveDropdown(activeDropdown === 'mobile-programs' ? null : 'mobile-programs')}
                                >
                                    {dict.navigation?.programs || "Programs"}
                                    <ChevronDown className={`h-5 w-5 transform transition-transform ${activeDropdown === 'mobile-programs' ? 'rotate-180' : ''}`} />
                                </button>
                                {activeDropdown === 'mobile-programs' && (
                                    <div className="ml-4 mt-2 flex flex-col space-y-2">
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

                            {/* Community Hub */}
                            <div className="flex flex-col">
                                <button
                                    className="p-2 text-lg font-medium hover:bg-gray-100 rounded-md text-primary-green text-left flex items-center justify-between"
                                    onClick={() => setActiveDropdown(activeDropdown === 'mobile-community' ? null : 'mobile-community')}
                                >
                                    {dict.navigation?.community_hub || "Community Hub"}
                                    <ChevronDown className={`h-5 w-5 transform transition-transform ${activeDropdown === 'mobile-community' ? 'rotate-180' : ''}`} />
                                </button>
                                {activeDropdown === 'mobile-community' && (
                                    <div className="ml-4 mt-2 flex flex-col space-y-2">
                                        <Link
                                            href={`/${locale}/community-hub/team`}
                                            className="p-2 text-md font-medium hover:bg-gray-100 rounded-md text-gray-700"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            prefetch={true}
                                        >
                                            Team
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* News & Updates */}
                            <div className="flex flex-col">
                                <button
                                    className="p-2 text-lg font-medium hover:bg-gray-100 rounded-md text-primary-green text-left flex items-center justify-between"
                                    onClick={() => setActiveDropdown(activeDropdown === 'mobile-news' ? null : 'mobile-news')}
                                >
                                    News & Updates
                                    <ChevronDown className={`h-5 w-5 transform transition-transform ${activeDropdown === 'mobile-news' ? 'rotate-180' : ''}`} />
                                </button>
                                {activeDropdown === 'mobile-news' && (
                                    <div className="ml-4 mt-2 flex flex-col space-y-2">
                                        <Link
                                            href={`/${locale}/newsroom`}
                                            className="p-2 text-md font-medium hover:bg-gray-100 rounded-md text-gray-700"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            prefetch={true}
                                        >
                                            News
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

            {/* Initial content */}
            <div
                ref={initialContentRef}
                className="absolute inset-0 flex items-center justify-center z-30"
            >
                <div className="text-center text-white mt-16">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl mx-auto">
                        {dict?.home?.hero?.title || "Sustainable Solutions for Rwanda's Future"}
                    </h1>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto">
                        {dict?.home?.hero?.subtitle || "Empowering youth through sustainable land management"}
                    </p>
                </div>
            </div>

            {/* SVG definitions */}
            <div className="absolute inset-0 z-0 pointer-events-none">
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
                className="absolute inset-0 bg-white z-30"
                style={{
                    transform: 'translateY(-100%)',
                    clipPath: 'url(#hero-clip)',
                }}
            ></div>

            {/* Final content */}
            <div
                ref={finalContentRef}
                className="absolute inset-0 z-40 opacity-0 pt-24"
            >
                <div className="container mx-auto px-4 text-center mt-20">
                    <h1 className="text-3xl md:text-4xl font-bold mb-6">
                        <span className="text-primary-green">
                            {dict?.home?.hero?.title_after?.line1 || "A PROSPEROUS AND"} <br/>
                            {dict?.home?.hero?.title_after?.line2 || "SUSTAINABLE"}
                        </span>{" "}
                        <span className="text-primary-orange">
                            {dict?.home?.hero?.title_after?.line3 || "FUTURE FOR"} <br/>
                            {dict?.home?.hero?.title_after?.line4 || "AFRICA"}
                        </span>
                    </h1>

                    <p className="text-base max-w-3xl mx-auto mb-8 text-gray-800">
                        {dict?.home?.hero?.subtitle || "Empowering youth through sustainable land management, agriculture, and environmental initiatives"}
                    </p>

                    <Link href={`/${locale}/about`} prefetch={true}>
                        <Button
                            size="lg"
                            className="bg-primary-green hover:bg-primary-green/90 text-white font-medium px-6 py-3"
                        >
                            {dict?.cta?.discover_more || "Discover More"}
                        </Button>
                    </Link>
                </div>

                {/* Leaves */}
                <div className="absolute -left-1 top-1/3 transform rotate-[31.83deg] -translate-x-1/4 z-50 md:w-[200px] w-[150px] aspect-square">
                    <Image
                        src="/images/leaf.png"
                        alt="Decorative leaf"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                <div className="absolute -right-1 top-1/4 rotate-[-60deg] transform translate-x-1/4 z-50 md:w-[200px] w-[150px] aspect-square overflow-hidden">
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
        </section>
    );
}