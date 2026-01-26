'use client';

import { useState, useCallback, useRef } from 'react';

interface TranslationResult {
  translatedText: string;
  source: string;
  target: string;
}

interface TranslationError {
  error: string;
  details?: string;
}

interface UseTranslationOptions {
  /** Cache translations to avoid repeated API calls */
  enableCache?: boolean;
  /** Source language code (default: 'en', use 'auto' for detection) */
  defaultSource?: string;
}

interface UseTranslationReturn {
  /** Translate a single piece of text */
  translate: (text: string, target: string, source?: string) => Promise<string>;
  /** Translate multiple texts at once */
  translateBatch: (texts: string[], target: string, source?: string) => Promise<string[]>;
  /** Whether a translation is in progress */
  isLoading: boolean;
  /** Last error that occurred */
  error: TranslationError | null;
  /** Clear the translation cache */
  clearCache: () => void;
}

/**
 * Hook for translating text using LibreTranslate
 *
 * @example
 * ```tsx
 * const { translate, isLoading, error } = useTranslation();
 *
 * const handleTranslate = async () => {
 *   const translated = await translate("Hello world", "fr");
 *   console.log(translated); // "Bonjour le monde"
 * };
 * ```
 */
export function useTranslation(options: UseTranslationOptions = {}): UseTranslationReturn {
  const { enableCache = true, defaultSource = 'en' } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TranslationError | null>(null);

  // Cache for translations: key = `${source}:${target}:${text}`
  const cacheRef = useRef<Map<string, string>>(new Map());

  const getCacheKey = (text: string, source: string, target: string): string => {
    return `${source}:${target}:${text}`;
  };

  const translate = useCallback(async (
    text: string,
    target: string,
    source: string = defaultSource
  ): Promise<string> => {
    // Return original text if empty or same language
    if (!text.trim() || source === target) {
      return text;
    }

    // Check cache first
    if (enableCache) {
      const cacheKey = getCacheKey(text, source, target);
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          source,
          target,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as TranslationError;
        setError(errorData);
        throw new Error(errorData.error);
      }

      const result = data as TranslationResult;

      // Cache the result
      if (enableCache) {
        const cacheKey = getCacheKey(text, source, target);
        cacheRef.current.set(cacheKey, result.translatedText);
      }

      return result.translatedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError({ error: errorMessage });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [defaultSource, enableCache]);

  const translateBatch = useCallback(async (
    texts: string[],
    target: string,
    source: string = defaultSource
  ): Promise<string[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        texts.map(text => translate(text, target, source))
      );
      return results;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [translate, defaultSource]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    translate,
    translateBatch,
    isLoading,
    error,
    clearCache,
  };
}

export default useTranslation;
