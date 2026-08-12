"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Flag, Package } from "lucide-react";
import { StatsHeader } from "@/components/sections/header";
import { MyAssets } from "@/components/assets/my-assets";
import { useMyAssets } from "@/hooks/useAssets";

export default function MyAssetsPage() {
  const [scrolled, setScrolled] = useState(false);
  const { data: assets, isLoading } = useMyAssets();

  useEffect(() => {
    const mainEl = document.querySelector("main.overflow-auto") as HTMLElement | null;

    const onScroll = () => {
      const y = mainEl ? mainEl.scrollTop : window.scrollY;
      setScrolled(y > 10);
    };

    onScroll();
    if (mainEl) {
      mainEl.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (mainEl) {
        mainEl.removeEventListener("scroll", onScroll);
      }
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const headerStats = useMemo(() => {
    const list = assets ?? [];
    return [
      { label: "My Assets", value: String(list.length), icon: Package },
      {
        label: "Has Issue",
        value: String(list.filter((a) => a.hasIssue === "YES").length),
        icon: AlertTriangle,
      },
      {
        label: "Flagged",
        value: String(list.filter((a) => a.isFlagged).length),
        icon: Flag,
      },
    ];
  }, [assets]);

  return (
    <div className="min-h-screen flex flex-col w-full bg-[#f6f8fb] dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="space-y-6">
        <StatsHeader
          title="My Assets"
          subtitle="Devices and equipment currently assigned to you"
          scrolled={scrolled}
          stats={headerStats}
          isLoading={isLoading}
          ClassName="w-full"
        />
        <MyAssets />
      </div>
    </div>
  );
}
