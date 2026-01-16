"use client";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { DictionaryProvider } from "@/context/dictionary";
import { TranslationProvider } from "@/context/translation";

export default function ClientLayout({
  children,
  locale,
  dict,
}: {
  children: React.ReactNode;
  locale: string;
  dict: any;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <TranslationProvider sourceLanguage="en">
        <DictionaryProvider dict={dict}>
          <div className="relative flex min-h-screen flex-col">
            <Header />

            <div className="flex-1">{children}</div>
            <Footer locale={locale} />
          </div>
        </DictionaryProvider>
      </TranslationProvider>
    </NextThemesProvider>
  );
}
