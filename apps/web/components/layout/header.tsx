"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navigation from "@/components/layout/navigation";
import HomeHero from "@/components/sections/homepage/home-hero";

export default function Header() {
  const pathname = usePathname();

  // Check if we're on the homepage
  const isHomePage = pathname === `/` || pathname === "/";

  return (
    <>
      {isHomePage ? (
        // For homepage, use the HomeHero component which includes navigation and hero section
        <HomeHero backgroundImage="/images/hero-test.jpg" />
      ) : (
        // For other pages, just use the Navigation component without a hero section
        <Navigation isHomePage={false} />
      )}
    </>
  );
}
