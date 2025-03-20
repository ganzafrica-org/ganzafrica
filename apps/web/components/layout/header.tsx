"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Button } from "@workspace/ui/components/button";
import LanguageSwitcher from "./language-switcher";

interface HeaderProps {
  locale: string;
  dict: any;
}

export default function Header({
                                 locale,
                                 dict,
                               }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Add scroll detection for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
      <header
          className="fixed top-0 z-50 w-full transition-all duration-300 bg-transparent"
      >

      </header>
  );
}