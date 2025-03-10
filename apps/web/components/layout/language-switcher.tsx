"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Button } from '@workspace/ui/components/button';

// Supported languages configuration with display names
const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
];

export default function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();

    // Get current locale from pathname
    const currentLocale = pathname.split('/')[1];

    // Handle language change
    const handleLanguageChange = (locale: string) => {
        // Extract the path without the locale prefix
        const segments = pathname.split('/');
        // Remove first segment (empty string before first slash) and the locale
        const pathWithoutLocale = segments.slice(2).join('/');

        // Create new path with the new locale and trailing slash
        const newPathname = locale === 'en'
            ? pathWithoutLocale ? `/${locale}/${pathWithoutLocale}` : '/'
            : pathWithoutLocale ? `/${locale}/${pathWithoutLocale}` : `/${locale}/`;

        router.push(newPathname);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Switch language">
                    <Globe className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((language) => (
                    <DropdownMenuItem
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={currentLocale === language.code ? 'font-bold' : ''}
                    >
                        {language.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}