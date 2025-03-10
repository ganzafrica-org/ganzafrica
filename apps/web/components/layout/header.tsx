"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import LanguageSwitcher from './language-switcher';

export default function Header({ locale, dict }: { locale: string; dict: any }) {
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

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full transition-all duration-200',
                isScrolled
                    ? 'bg-background/80 backdrop-blur-md shadow-sm'
                    : 'bg-transparent'
            )}
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href={`/${locale}`} className="flex items-center space-x-2" prefetch={true}>
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="font-bold text-primary">GA</span>
                    </div>
                    <span className="text-xl font-bold">{dict.site.name}</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    <Link href={`/${locale}/about`} prefetch={true} className={cn(
                        'text-sm font-medium transition-colors hover:text-primary',
                        pathname.includes('/about') ? 'text-primary' : 'text-foreground/80'
                    )}>
                        {dict.navigation.about}
                    </Link>
                    <Link href={`/${locale}/what-we-do`} prefetch={true} className={cn(
                        'text-sm font-medium transition-colors hover:text-primary',
                        pathname.includes('/what-we-do') ? 'text-primary' : 'text-foreground/80'
                    )}>
                        {dict.navigation.what_we_do}
                    </Link>
                    <Link href={`/${locale}/programs`} prefetch={true} className={cn(
                        'text-sm font-medium transition-colors hover:text-primary',
                        pathname.includes('/programs') ? 'text-primary' : 'text-foreground/80'
                    )}>
                        {dict.navigation.programs}
                    </Link>
                    <Link href={`/${locale}/projects`} prefetch={true} className={cn(
                        'text-sm font-medium transition-colors hover:text-primary',
                        pathname.includes('/projects') ? 'text-primary' : 'text-foreground/80'
                    )}>
                        {dict.navigation.projects}
                    </Link>
                    <Link href={`/${locale}/community-hub`} prefetch={true} className={cn(
                        'text-sm font-medium transition-colors hover:text-primary',
                        pathname.includes('/community-hub') ? 'text-primary' : 'text-foreground/80'
                    )}>
                        {dict.navigation.community_hub}
                    </Link>
                    <Link href={`/${locale}/newsroom`} prefetch={true} className={cn(
                        'text-sm font-medium transition-colors hover:text-primary',
                        pathname.includes('/newsroom') ? 'text-primary' : 'text-foreground/80'
                    )}>
                        {dict.navigation.stay_updated}
                    </Link>
                </nav>

                {/* Right side items */}
                <div className="flex items-center space-x-2">
                    <LanguageSwitcher />
                    <Button size="sm">{dict.cta.apply}</Button>

                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden bg-background pt-16">
                    <nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
                        <Link
                            href={`/${locale}/about`}
                            className="p-2 text-lg font-medium hover:bg-accent rounded-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {dict.navigation.about}
                        </Link>
                        <Link
                            href={`/${locale}/what-we-do`}
                            className="p-2 text-lg font-medium hover:bg-accent rounded-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {dict.navigation.what_we_do}
                        </Link>
                        <Link
                            href={`/${locale}/programs`}
                            className="p-2 text-lg font-medium hover:bg-accent rounded-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {dict.navigation.programs}
                        </Link>
                        <Link
                            href={`/${locale}/projects`}
                            className="p-2 text-lg font-medium hover:bg-accent rounded-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {dict.navigation.projects}
                        </Link>
                        <Link
                            href={`/${locale}/community-hub`}
                            className="p-2 text-lg font-medium hover:bg-accent rounded-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {dict.navigation.community_hub}
                        </Link>
                        <Link
                            href={`/${locale}/newsroom`}
                            className="p-2 text-lg font-medium hover:bg-accent rounded-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {dict.navigation.stay_updated}
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}