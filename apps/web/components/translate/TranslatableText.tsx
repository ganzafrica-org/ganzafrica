'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslationContext } from '@/context/translation';

interface TranslatableTextProps {
  /** The original text to translate */
  children: string;
  /** HTML tag to render (default: span) */
  as?: keyof JSX.IntrinsicElements;
  /** Additional class names */
  className?: string;
  /** Whether to show loading indicator */
  showLoading?: boolean;
  /** Callback when translation completes */
  onTranslated?: (translatedText: string) => void;
}

/**
 * A component that automatically translates its text content
 * based on the global translation context.
 *
 * @example
 * ```tsx
 * <TranslatableText>Hello, World!</TranslatableText>
 * <TranslatableText as="h1" className="text-2xl">Welcome</TranslatableText>
 * ```
 */
export function TranslatableText({
  children,
  as: Component = 'span',
  className = '',
  showLoading = false,
  onTranslated,
}: TranslatableTextProps) {
  const {
    targetLanguage,
    sourceLanguage,
    translateText,
    getCachedTranslation,
    isTranslated: isGloballyTranslated
  } = useTranslationContext();

  const [displayText, setDisplayText] = useState(children);
  const [isLoading, setIsLoading] = useState(false);
  const originalTextRef = useRef(children);
  const lastTargetLangRef = useRef(targetLanguage);

  useEffect(() => {
    // Update original text if children change
    if (children !== originalTextRef.current) {
      originalTextRef.current = children;
      setDisplayText(children);
    }
  }, [children]);

  useEffect(() => {
    const translateContent = async () => {
      // If same as source language, show original
      if (targetLanguage === sourceLanguage) {
        setDisplayText(originalTextRef.current);
        return;
      }

      // Check cache first
      const cached = getCachedTranslation(originalTextRef.current);
      if (cached) {
        setDisplayText(cached);
        onTranslated?.(cached);
        return;
      }

      // Translate
      setIsLoading(true);
      try {
        const translated = await translateText(originalTextRef.current);
        setDisplayText(translated);
        onTranslated?.(translated);
      } catch (error) {
        console.error('Translation failed:', error);
        // Keep original text on error
        setDisplayText(originalTextRef.current);
      } finally {
        setIsLoading(false);
      }
    };

    // Only translate if language changed
    if (targetLanguage !== lastTargetLangRef.current ||
        (isGloballyTranslated && displayText === originalTextRef.current)) {
      lastTargetLangRef.current = targetLanguage;
      translateContent();
    }
  }, [targetLanguage, sourceLanguage, translateText, getCachedTranslation, onTranslated, isGloballyTranslated, displayText]);

  const ElementComponent = Component as React.ElementType;

  if (showLoading && isLoading) {
    return (
      <ElementComponent className={`${className} animate-pulse`}>
        <span className="inline-block bg-gray-200 rounded h-4 w-full" />
      </ElementComponent>
    );
  }

  return (
    <ElementComponent className={className}>
      {displayText}
    </ElementComponent>
  );
}

/**
 * Hook for translating text in components that need more control
 */
export function useAutoTranslate(originalText: string): {
  text: string;
  isLoading: boolean;
} {
  const {
    targetLanguage,
    sourceLanguage,
    translateText,
    getCachedTranslation
  } = useTranslationContext();

  const [text, setText] = useState(originalText);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translate = async () => {
      if (targetLanguage === sourceLanguage) {
        setText(originalText);
        return;
      }

      const cached = getCachedTranslation(originalText);
      if (cached) {
        setText(cached);
        return;
      }

      setIsLoading(true);
      try {
        const translated = await translateText(originalText);
        setText(translated);
      } catch {
        setText(originalText);
      } finally {
        setIsLoading(false);
      }
    };

    translate();
  }, [originalText, targetLanguage, sourceLanguage, translateText, getCachedTranslation]);

  return { text, isLoading };
}

export default TranslatableText;
