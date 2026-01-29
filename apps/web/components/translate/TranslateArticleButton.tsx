"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Languages, Loader2, RotateCcw } from "lucide-react";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/context/translation";
import { trackTranslation } from "@/components/analytics/google-analytics";

interface TranslateArticleButtonProps {
  /** The original article content (can be HTML) */
  originalContent: string;
  /** The original article title */
  originalTitle: string;
  /** Callback when translation is complete */
  onTranslate: (translatedContent: string, translatedTitle: string) => void;
  /** Callback to restore original content */
  onRestore: () => void;
  /** Whether the content is currently translated */
  isTranslated?: boolean;
  /** Source language of the article (default: 'en') */
  sourceLanguage?: string;
  /** Custom class name for the container */
  className?: string;
}

/**
 * A button component that allows users to translate article content
 * to their preferred language using LibreTranslate.
 */
export function TranslateArticleButton({
  originalContent,
  originalTitle,
  onTranslate,
  onRestore,
  isTranslated = false,
  sourceLanguage = "en",
  className = "",
}: TranslateArticleButtonProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("fr");
  const [isOpen, setIsOpen] = useState(false);
  const { translate, isLoading, error } = useTranslation();

  // Strip HTML tags for translation, then we'll handle it
  const stripHtml = (html: string): string => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleTranslate = async () => {
    if (selectedLanguage === sourceLanguage) {
      return;
    }

    try {
      // For HTML content, we translate the text content
      // This is a simplified approach - for production you might want
      // to preserve HTML structure and translate text nodes only
      const isHtml = /<[a-z][\s\S]*>/i.test(originalContent);

      let contentToTranslate = originalContent;
      if (isHtml) {
        // Split by paragraphs and translate each
        const paragraphs = originalContent.split(/<\/p>/i);
        const translatedParagraphs = await Promise.all(
          paragraphs.map(async (p) => {
            if (!p.trim()) return p;
            const textContent = stripHtml(p);
            if (!textContent.trim()) return p;
            const translated = await translate(
              textContent,
              selectedLanguage,
              sourceLanguage,
            );
            // Reconstruct with original HTML structure (simplified)
            return p.replace(textContent, translated);
          }),
        );
        contentToTranslate = translatedParagraphs.join("</p>");
      } else {
        contentToTranslate = await translate(
          originalContent,
          selectedLanguage,
          sourceLanguage,
        );
      }

      const translatedTitle = await translate(
        originalTitle,
        selectedLanguage,
        sourceLanguage,
      );

      onTranslate(contentToTranslate, translatedTitle);
      trackTranslation({
        source_language: sourceLanguage,
        target_language: selectedLanguage,
        scope: "article",
      });
      setIsOpen(false);
    } catch (err) {
      console.error("Translation failed:", err);
    }
  };

  const handleRestore = () => {
    onRestore();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700"
        title="Translate article"
      >
        <Languages className="w-5 h-5 text-[#00A651]" />
        <span className="text-sm font-medium">
          {isTranslated ? "Translated" : "Translate"}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">
              Translate to:
            </h4>

            {/* Language Selection */}
            <select
              value={selectedLanguage}
              onChange={(e) =>
                setSelectedLanguage(e.target.value as LanguageCode)
              }
              className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent"
              disabled={isLoading}
            >
              {SUPPORTED_LANGUAGES.filter(
                (lang) => lang.code !== sourceLanguage,
              ).map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>

            {/* Error Message */}
            {error && (
              <p className="mt-2 text-xs text-red-500">
                {error.error}
                {error.details && (
                  <span className="block mt-1 text-gray-500">
                    {error.details}
                  </span>
                )}
              </p>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
              {isTranslated ? (
                <button
                  onClick={handleRestore}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Show Original
                </button>
              ) : null}

              <button
                onClick={handleTranslate}
                disabled={isLoading || selectedLanguage === sourceLanguage}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#00A651] text-white rounded-md text-sm font-medium hover:bg-[#008f46] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Languages className="w-4 h-4" />
                    Translate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}

export default TranslateArticleButton;
