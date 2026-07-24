"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { trackTranslation } from "@/components/analytics/google-analytics";

// Supported languages (all supported by LibreTranslate)
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "/images/flags/en.svg" },
  { code: "fr", name: "Français", flag: "/images/flags/fr.svg" },
  // { code: "es", name: "Español", flag: "/images/flags/es.svg" },
  // { code: "de", name: "Deutsch", flag: "/images/flags/de.svg" },
  // { code: "pt", name: "Português", flag: "/images/flags/pt.svg" },
  // { code: "ar", name: "العربية", flag: "/images/flags/ar.svg" },
  // { code: "zh", name: "中文", flag: "/images/flags/zh.svg" },
  // { code: "it", name: "Italiano", flag: "/images/flags/it.svg" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

interface TranslationContextType {
  /** Current target language for translation */
  targetLanguage: LanguageCode;
  /** Source language of the website (default content language) */
  sourceLanguage: LanguageCode;
  /** Whether translation is currently in progress */
  isTranslating: boolean;
  /** Whether the page is currently showing translated content */
  isTranslated: boolean;
  /** Set the target language and trigger translation */
  setTargetLanguage: (lang: LanguageCode) => void;
  /** Translate a single piece of text */
  translateText: (text: string) => Promise<string>;
  /** Translate multiple texts at once */
  translateTexts: (texts: string[]) => Promise<string[]>;
  /** Reset to original language */
  resetToOriginal: () => void;
  /** Translation error if any */
  error: string | null;
  /** Get cached translation for a text */
  getCachedTranslation: (text: string) => string | undefined;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

const STORAGE_KEY = "ganzafrica_target_language";

interface TranslationProviderProps {
  children: React.ReactNode;
  /** Default source language of the website */
  sourceLanguage?: LanguageCode;
}

export function TranslationProvider({ children, sourceLanguage = "en" }: TranslationProviderProps) {
  const [targetLanguage, setTargetLanguageState] = useState<LanguageCode>(sourceLanguage);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache for translations: key = `${text}:${targetLang}`
  const cacheRef = useRef<Map<string, string>>(new Map());

  // Load saved language preference on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        setTargetLanguageState(saved as LanguageCode);
        if (saved !== sourceLanguage) {
          setIsTranslated(true);
        }
      }
    }
  }, [sourceLanguage]);

  const getCacheKey = (text: string, target: LanguageCode): string => {
    return `${text}:${target}`;
  };

  const getCachedTranslation = useCallback(
    (text: string): string | undefined => {
      const cacheKey = getCacheKey(text, targetLanguage);
      return cacheRef.current.get(cacheKey);
    },
    [targetLanguage],
  );

  const translateText = useCallback(
    async (text: string): Promise<string> => {
      if (!text.trim() || targetLanguage === sourceLanguage) {
        return text;
      }

      // Check cache first
      const cacheKey = getCacheKey(text, targetLanguage);
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        return cached;
      }

      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            source: sourceLanguage,
            target: targetLanguage,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Translation failed");
        }

        const data = await response.json();
        const translatedText = data.translatedText;

        // Cache the result
        cacheRef.current.set(cacheKey, translatedText);

        return translatedText;
      } catch (err) {
        console.error("Translation error:", err);
        throw err;
      }
    },
    [targetLanguage, sourceLanguage],
  );

  const translateTexts = useCallback(
    async (texts: string[]): Promise<string[]> => {
      if (targetLanguage === sourceLanguage) {
        return texts;
      }

      setIsTranslating(true);
      setError(null);

      try {
        const results = await Promise.all(texts.map((text) => translateText(text)));
        return results;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Translation failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsTranslating(false);
      }
    },
    [translateText, targetLanguage, sourceLanguage],
  );

  const setTargetLanguage = useCallback(
    (lang: LanguageCode) => {
      setTargetLanguageState(lang);
      setIsTranslated(lang !== sourceLanguage);
      setError(null);

      if (lang !== targetLanguage) {
        trackTranslation({
          source_language: sourceLanguage,
          target_language: lang,
          scope: "page",
        });
      }

      // Save preference
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, lang);
      }
    },
    [sourceLanguage],
  );

  const resetToOriginal = useCallback(() => {
    setTargetLanguageState(sourceLanguage);
    setIsTranslated(false);
    setError(null);

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, sourceLanguage);
    }
  }, [sourceLanguage]);

  const value: TranslationContextType = {
    targetLanguage,
    sourceLanguage,
    isTranslating,
    isTranslated,
    setTargetLanguage,
    translateText,
    translateTexts,
    resetToOriginal,
    error,
    getCachedTranslation,
  };

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslationContext() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslationContext must be used within a TranslationProvider");
  }
  return context;
}

export default TranslationContext;
