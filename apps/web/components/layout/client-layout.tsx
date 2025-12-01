"use client";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { DictionaryProvider } from '@/context/dictionary';
import GoogleTranslate from "@/components/layout/GoogleTranslate"; // Import your component
import useGoogleTranslate from '@/hooks/useGoogleTranslate';

export default function ClientLayout({
  children,
  locale,
  dict,
}: {
  children: React.ReactNode;
  locale: string;
  dict: any;
}) {
  // Initialize Google Translate once
  useGoogleTranslate(locale);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <DictionaryProvider dict={dict}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <GoogleTranslate /> {/* Render the Google Translate widget here */}
          <div className="flex-1">{children}</div>
          <Footer locale={locale} />
        </div>
      </DictionaryProvider>
    </NextThemesProvider>
  );
}
