'use client'
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Button } from "@workspace/ui/components/button";
import { Globe } from "lucide-react";

interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: "en", name: "English", flag: "/images/flags/en.svg", nativeName: "English" },
  { code: "fr", name: "French", flag: "/images/flags/fr.svg", nativeName: "Français" },
];

export default function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]!);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load Google Translate script
    const script = document.createElement('script');
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
    
    (window as any).googleTranslateElementInit = () => {
      try {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,fr',
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE
          },
          'google-translate-element'
        );
      } catch (error) {
        console.error('Error initializing Google Translate:', error);
      }
    };
  }, []);

  const handleLanguageChange = (langCode: string) => {
    const selected = languages.find(lang => lang.code === langCode);
    if (selected) {
      setCurrentLanguage(selected);
      setIsLoading(true);

      // Trigger Google Translate
      const comboBox = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (comboBox) {
        comboBox.value = langCode;
        comboBox.dispatchEvent(new Event("change", { bubbles: true }));
        
        // Show loading state briefly
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    }
  };

  return (
    <>
      {/* Hidden Google Translate widget container */}
      <div id="google-translate-element" className="hidden" />

      {/* Custom Language Switcher UI */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 gap-2 px-3 hover:bg-white/10 transition-colors"
            disabled={isLoading}
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium uppercase text-sm">{currentLanguage.code}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Select Language
          </div>

          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`flex items-center gap-3 cursor-pointer px-3 py-2 ${
                currentLanguage.code === language.code
                  ? "bg-primary-green/10 font-semibold"
                  : ""
              }`}
            >
              <Image
                src={language.flag}
                alt={language.code}
                width={20}
                height={20}
                className="rounded-sm"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{language.name}</span>
                <span className="text-xs text-gray-500">{language.nativeName}</span>
              </div>
              {currentLanguage.code === language.code && (
                <span className="ml-auto text-primary-green">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}


