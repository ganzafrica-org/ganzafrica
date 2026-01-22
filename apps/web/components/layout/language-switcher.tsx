"use client";

import { useState } from "react";
import Image from "next/image";
import { Languages, Check, Loader2, Globe } from "lucide-react";
import {
    useTranslationContext,
    SUPPORTED_LANGUAGES,
    type LanguageCode,
} from "@/context/translation";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@workspace/ui/components/dropdown-menu";
import { Button } from "@workspace/ui/components/button";

// Safe image component for Next.js type compatibility
const SafeImage = Image as unknown as React.ComponentType<any>;

export default function LanguageSwitcher(): JSX.Element {
    const {
        targetLanguage,
        sourceLanguage,
        setTargetLanguage,
        isTranslating,
        isTranslated,
        resetToOriginal,
        error,
    } = useTranslationContext();

    const [isOpen, setIsOpen] = useState(false);

    // Find current language object
    const currentLanguage =
        SUPPORTED_LANGUAGES.find((lang) => lang.code === targetLanguage) ??
        SUPPORTED_LANGUAGES[0]!;

    // Handle language change
    const handleLanguageChange = (langCode: LanguageCode): void => {
        setTargetLanguage(langCode);
        setIsOpen(false);
    };

    // Check if flag image exists, fallback to globe icon
    const renderFlag = (
        lang: (typeof SUPPORTED_LANGUAGES)[number],
        size: number = 20,
    ) => {
        // Only en and fr have flags currently
        if (["en", "fr"].includes(lang.code)) {
            return (
                <SafeImage
                    src={lang.flag}
                    alt={lang.code}
                    width={size}
                    height={size * 0.75}
                    className="rounded-sm"
                />
            );
        }
        // For other languages, show a colored circle with language code
        return (
            <div
                className="flex items-center justify-center rounded-sm bg-gradient-to-br from-[#00A651] to-[#008f46] text-white text-xs font-bold"
                style={{ width: size, height: size * 0.75 }}
            >
                {lang.code.toUpperCase().slice(0, 2)}
            </div>
        );
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2 px-2 hover:bg-gray-100"
                    disabled={isTranslating}
                >
                    {isTranslating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            {renderFlag(currentLanguage)}
                            <span className="font-medium uppercase text-sm">
                {currentLanguage.code}
              </span>
                            {isTranslated && targetLanguage !== sourceLanguage && (
                                <span
                                    className="ml-1 w-2 h-2 bg-[#00A651] rounded-full"
                                    title="Translated"
                                />
                            )}
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="flex items-center gap-2 text-xs text-gray-500">
                    <Languages className="h-3 w-3" />
                    Translate to
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {SUPPORTED_LANGUAGES.map((language) => (
                    <DropdownMenuItem
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        {renderFlag(language)}
                        <span
                            className={
                                targetLanguage === language.code ? "font-semibold" : ""
                            }
                        >
              {language.name}
            </span>
                        {targetLanguage === language.code && (
                            <Check className="h-4 w-4 ml-auto text-[#00A651]" />
                        )}
                    </DropdownMenuItem>
                ))}

                {isTranslated && targetLanguage !== sourceLanguage && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => {
                                resetToOriginal();
                                setIsOpen(false);
                            }}
                            className="text-gray-600 cursor-pointer"
                        >
                            <Globe className="h-4 w-4 mr-2" />
                            Show Original
                        </DropdownMenuItem>
                    </>
                )}

                {error && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-1.5 text-xs text-red-500">
                            Translation unavailable
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}