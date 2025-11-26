"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navigation from "@/components/layout/navigation";
import HomeHero from "@/components/sections/homepage/home-hero";
import { useDict } from '@/context/dictionary';

// Define dictionary type
interface DictionaryType {
  navigation?: {
    about?: string;
    what_we_do?: string;
    our_approach?: string;
    programs?: string;
    community_hub?: string;
  };
  about?: {
    who_we_are?: string;
    our_story?: string;
    [key: string]: string | undefined;
  };
  what_we_do?: {
    food_systems?: string;
    climate_change_adaptation?: string;
    [key: string]: string | undefined;
  };
  home?: {
    hero?: {
      title?: string;
      subtitle?: string;
      title_after?: {
        line1?: string;
        line2?: string;
        line3?: string;
        line4?: string;
      };
    };
  };
  cta?: {
    sign_in?: string;
    discover_more?: string;
  };
}

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  const pathname = usePathname();
  const dict = useDict();

  // Check if we're on the homepage
  const isHomePage = pathname === `/` || pathname === "/";

  return (
    <>
      {isHomePage ? (
        // For homepage, use the HomeHero component which includes navigation and hero section
        <HomeHero
          locale={locale}
          backgroundImage="/images/hero-test.jpg"
        />
      ) : (
        // For other pages, just use the Navigation component without a hero section
        <Navigation isHomePage={false} />
      )}
    </>
  );
}