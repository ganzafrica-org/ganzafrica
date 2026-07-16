"use client";

import { useState } from "react";
import { Languages, ArrowRightLeft, Loader2 } from "lucide-react";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
  { code: "pt", name: "Português" },
  { code: "ar", name: "العربية" },
  { code: "zh", name: "中文" },
  { code: "sw", name: "Kiswahili" },
  { code: "auto", name: "Auto Detect" },
] as const;

interface TranslationError {
  error: string;
  details?: string;
}

export default function Translator() {
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("fr");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TranslationError | null>(null);

  const handleTranslate = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          source: sourceLang,
          target: targetLang,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data as TranslationError);
        return;
      }

      setTranslatedText(data.translatedText);
    } catch (err) {
      setError({ error: "Failed to connect to translation service" });
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    if (sourceLang === "auto") return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    // Also swap the text if there's a translation
    if (translatedText) {
      setText(translatedText);
      setTranslatedText(text);
    }
  };

  const sourceLanguages = LANGUAGES;
  const targetLanguages = LANGUAGES.filter((l) => l.code !== "auto");

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#00A651] to-[#008f46] text-white">
          <div className="flex items-center gap-2">
            <Languages className="w-6 h-6" />
            <h1 className="text-xl font-bold">Translator</h1>
          </div>
          <p className="text-sm text-white/80 mt-1">Powered by LibreTranslate</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Language Selection */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent bg-white"
              >
                {sourceLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={swapLanguages}
              disabled={sourceLang === "auto"}
              className="mt-6 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Swap languages"
            >
              <ArrowRightLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent bg-white"
              >
                {targetLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Text Areas */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Source Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste text here..."
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent"
              />
              <div className="mt-1 text-xs text-gray-500 text-right">{text.length} characters</div>
            </div>

            {/* Translated Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Translation</label>
              <div className="w-full h-40 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 overflow-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Translating...
                  </div>
                ) : translatedText ? (
                  <p className="text-gray-800">{translatedText}</p>
                ) : (
                  <p className="text-gray-400 italic">Translation will appear here</p>
                )}
              </div>
              {translatedText && (
                <div className="mt-1 text-xs text-gray-500 text-right">
                  {translatedText.length} characters
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error.error}</p>
              {error.details && (
                <p className="text-xs text-red-500 mt-1 font-mono">{error.details}</p>
              )}
            </div>
          )}

          {/* Translate Button */}
          <button
            onClick={handleTranslate}
            disabled={loading || !text.trim()}
            className="w-full py-3 px-6 bg-[#00A651] text-white font-medium rounded-lg hover:bg-[#008f46] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="w-5 h-5" />
                Translate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
