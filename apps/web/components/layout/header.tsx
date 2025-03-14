'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import LanguageSwitcher from './language-switcher';

interface HeaderProps {
    locale: string;
    dict: any;
    transparent?: boolean;
}

export default function Header({ locale, dict, transparent = false }: HeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Add scroll detection for header styling
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Determine if we're on the home page
    const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;

    return (
        <header
            className={cn(
                'fixed top-0 z-50 w-full transition-all duration-300',
                isScrolled
                    ? 'bg-white/95 shadow-sm backdrop-blur-sm'
                    : transparent ? 'bg-transparent' : 'bg-white'
            )}
        >
            <div className="container mx-auto px-4">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo */}
                    <Link href={`/${locale}`} className="relative z-50 flex items-center gap-2" prefetch={true}>
                        <div className="relative h-10 w-28">
                            <Image
                                src="/images/logo.png"
                                alt="GanzAfrica"
                                fill
                                sizes="(max-width: 768px) 100px, 120px"
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center space-x-1 md:flex">
                        {/* About Dropdown */}
                        <div className="group relative">
                            <Link
                                href={`/${locale}/about`}
                                className={cn(
                                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                    pathname.includes('/about')
                                        ? 'text-primary-green'
                                        : isScrolled || !transparent
                                            ? 'text-gray-700 hover:text-primary-green'
                                            : 'text-white hover:text-white/80'
                                )}
                                prefetch={true}
                            >
                                {dict.navigation.about}
                                <ChevronDown className="ml-1 h-4 w-4" />
                            </Link>
                            <div className="absolute left-0 mt-1 w-48 hidden group-hover:block rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                                <div className="py-1 flex flex-col">
                                    <Link
                                        href={`/${locale}/about/who-we-are`}
                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        prefetch={true}
                                    >
                                        {dict.about.who_we_are}
                                    </Link>
                                    <Link
                                        href={`/${locale}/about/our-people`}
                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        prefetch={true}
                                    >
                                        {dict.about.our_people}
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* What We Do Dropdown */}
                        <div className="group relative">
                            <Link
                                href={`/${locale}/what-we-do`}
                                className={cn(
                                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                    pathname.includes('/what-we-do')
                                        ? 'text-primary-green'
                                        : isScrolled || !transparent
                                            ? 'text-gray-700 hover:text-primary-green'
                                            : 'text-white hover:text-white/80'
                                )}
                                prefetch={true}
                            >
                                {dict.navigation.what_we_do}
                                <ChevronDown className="ml-1 h-4 w-4" />
                            </Link>
                            <div className="absolute left-0 mt-1 w-48 hidden group-hover:block rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
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
                        </div>

                        {/* Programs Link */}
                        <Link
                            href={`/${locale}/programs`}
                            className={cn(
                                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                pathname.includes('/programs')
                                    ? 'text-primary-green'
                                    : isScrolled || !transparent
                                        ? 'text-gray-700 hover:text-primary-green'
                                        : 'text-white hover:text-white/80'
                            )}
                            prefetch={true}
                        >
                            {dict.navigation.programs}
                        </Link>

                        {/* Community Hub Dropdown */}
                        <div className="group relative">
                            <Link
                                href={`/${locale}/community-hub`}
                                className={cn(
                                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                    pathname.includes('/community-hub')
                                        ? 'text-primary-green'
                                        : isScrolled || !transparent
                                            ? 'text-gray-700 hover:text-primary-green'
                                            : 'text-white hover:text-white/80'
                                )}
                                prefetch={true}
                            >
                                {dict.navigation.community_hub}
                                <ChevronDown className="ml-1 h-4 w-4" />
                            </Link>
                            <div className="absolute left-0 mt-1 w-48 hidden group-hover:block rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                                <div className="py-1 flex flex-col">
                                    <Link
                                        href={`/${locale}/community-hub/mentors`}
                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        prefetch={true}
                                    >
                                        {dict.community.mentors}
                                    </Link>
                                    <Link
                                        href={`/${locale}/community-hub/fellows`}
                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        prefetch={true}
                                    >
                                        {dict.community.fellows}
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Stay Updated Dropdown */}
                        <div className="group relative">
                            <Link
                                href={`/${locale}/newsroom`}
                                className={cn(
                                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                    pathname.includes('/newsroom')
                                        ? 'text-primary-green'
                                        : isScrolled || !transparent
                                            ? 'text-gray-700 hover:text-primary-green'
                                            : 'text-white hover:text-white/80'
                                )}
                                prefetch={true}
                            >
                                {dict.navigation.stay_updated}
                                <ChevronDown className="ml-1 h-4 w-4" />
                            </Link>
                            <div className="absolute left-0 mt-1 w-48 hidden group-hover:block rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                                <div className="py-1 flex flex-col">
                                    <Link
                                        href={`/${locale}/newsroom`}
                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        prefetch={true}
                                    >
                                        {dict.stay_updated.newsroom}
                                    </Link>
                                    <Link
                                        href={`/${locale}/newsroom/reports`}
                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        prefetch={true}
                                    >
                                        {dict.stay_updated.reports}
                                    </Link>
                                </div>
                            </div>
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
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden bg-white pt-20">
                    <nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
                        <Link
                            href={`/${locale}/about`}
                            className="p-2 text-lg font-medium hover:bg-gray-100 rounded-md text-primary-green"
                            onClick={() => setIsMobileMenuOpen(false)}
                            prefetch={true}
                        >
                            {dict.navigation.about}
                        </Link>
                        <Link
                            href={`/${locale}/what-we-do`}
                            className="p-2 text-lg font-medium hover:bg-gray-100 rounded-md text-primary-green"
                            onClick={() => setIsMobileMenuOpen(false)}
                            prefetch={true}
                        >
                            {dict.navigation.what_we_do}
                        </Link>
                        <Link
                            href={`/${locale}/programs`}
                            className="p-2 text-lg font-medium hover:bg-gray-100 rounded-md text-primary-green"
                            onClick={() => setIsMobileMenuOpen(false)}
                            prefetch={true}
                        >
                            {dict.navigation.programs}
                        </Link>
                        <Link
                            href={`/${locale}/community-hub`}
                            className="p-2 text-lg font-medium hover:bg-gray-100 rounded-md text-primary-green"
                            onClick={() => setIsMobileMenuOpen(false)}
                            prefetch={true}
                        >
                            {dict.navigation.community_hub}
                        </Link>
                        <Link
                            href={`/${locale}/newsroom`}
                            className="p-2 text-lg font-medium hover:bg-gray-100 rounded-md text-primary-green"
                            onClick={() => setIsMobileMenuOpen(false)}
                            prefetch={true}
                        >
                            {dict.navigation.stay_updated}
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}