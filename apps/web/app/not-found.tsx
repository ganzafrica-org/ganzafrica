"use client";

import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import ganzalogo from "../public/images/ganza.svg";

export default function GlobalNotFound() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  useEffect(() => setIsVisible(true), []);

  const segments = pathname.split("/").filter(Boolean);
  const supported = ["en", "fr"];

  // Normalize the first segment to a string (could be undefined) and derive locale/attemptedPath
  const first = segments[0] ?? "";
  const locale = supported.includes(first) ? first : "en";

  // The path portion after the locale (used when switching languages)
  const attemptedPath = supported.includes(first)
    ? `/${segments.slice(1).join("/")}` || "/"
    : pathname;

  const texts: Record<
    string,
    { title: string; message: string; requested: string; goHome: string; switchTo: string }
  > = {
    en: {
      title: "Oops!",
      message: "We couldn't find the page you were looking for",
      requested: "Requested:",
      goHome: "Go home",
      switchTo: "FR",
    },
    fr: {
      title: "Oups!",
      message: "La page que vous recherchez est introuvable",
      requested: "Requête :",
      goHome: "Aller à l'accueil",
      switchTo: "EN",
    },
  };

  const t = (supported.includes(first) ? texts[first as "en" | "fr"] : texts.en) as {
    title: string;
    message: string;
    requested: string;
    goHome: string;
    switchTo: string;
  };

  return (
    <div
      data-not-found="true"
      className="min-h-screen bg-black flex items-center justify-center px-6 py-12"
    >
      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-between gap-12">
        <div
          className={`flex-1 transition-all duration-1000 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
        >
          <div className="retro-tv-container">
            <Image
              src={ganzalogo}
              alt="Retro TV"
              width={400}
              height={380}
              className="w-[70rem] h-[35rem] border border-black"
            />
          </div>
        </div>

        <div
          className={`flex-1 text-center lg:text-left transition-all duration-1000 text-white ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t.title}</h1>
          <p className="text-xl text-gray-300 mb-2 leading-relaxed">{t.message}</p>
          <p className="text-sm text-gray-400 mb-6">
            {t.requested} <span className="font-mono">{pathname}</span>
          </p>

          <div className="flex items-center gap-4 justify-center lg:justify-start">
            <button
              onClick={() => router.push("/")}
              className="border inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              {t.goHome}
            </button>

            {/* <button
              aria-label="switch language"
              onClick={() => {
                const other = locale === 'fr' ? 'en' : 'fr';
                const target = attemptedPath.startsWith('/') ? `/${other}${attemptedPath}` : `/${other}/${attemptedPath}`;
                router.push(target);
              }}
              className="px-4 py-2 border rounded-full text-sm font-medium hover:bg-gray-50 text-white"
            >
              {t.switchTo}
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
