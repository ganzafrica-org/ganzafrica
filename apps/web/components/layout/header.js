"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Navigation from "@/components/layout/navigation";
import HomeHero from "@/components/sections/homepage/home-hero";
export default function Header({ locale, dict }) {
    const pathname = usePathname();
    // Check if we're on the homepage
    const isHomePage = pathname === `/${locale}` || pathname === "/";
    return (<>
      {isHomePage ? (
        // For homepage, use the HomeHero component which includes navigation and hero section
        <HomeHero locale={locale} dict={dict} backgroundImage="/images/hero-test.jpg"/>) : (
        // For other pages, just use the Navigation component without a hero section
        <Navigation locale={locale} dict={dict} isHomePage={false}/>)}
    </>);
}
