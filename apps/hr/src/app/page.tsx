"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ClipboardCheck, Package, Wallet } from "lucide-react";
import { LeaveSummaryCard } from "@/components/sections/home-cards/LeaveSummaryCard";
import { ScheduleCard } from "@/components/sections/home-cards/ScheduleCard";
import { EmploymentStatusCard } from "@/components/sections/home-cards/EmploymentStatusCard";
import { ApplicantsCard } from "@/components/sections/home-cards/ApplicantsCard";
import { SystemAlertsCard } from "@/components/sections/home-cards/SystemAlertsCard";
import { MyAssetsCard } from "@/components/sections/home-cards/MyAssetsCard";
import { MyOnboardingCard } from "@/components/sections/home-cards/MyOnboardingCard";
import { StatsHeader } from "@/components/sections/header";
import { BalanceCards } from "@/components/sections/leave/balance-cards";
import { useAuth } from "@/hooks/useAuth";
import { useMyAssets } from "@/hooks/useAssets";
import { useMyLeave } from "@/hooks/useLeaveBalances";
import { useMyProcess } from "@/hooks/useProcesses";
import { remainingDays } from "@/services/leave-balances.service";

const getGreeting = (name?: string): string => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  return name ? `${greeting}, ${name}!` : `${greeting}!`;
};

export default function Dashboard() {
  const { user, roles } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Same split as navbar.tsx: "hr"/"admin" get the org-wide dashboard, everyone else
  // (employee, staff, fellow, analyst, mentor, alumni, director, program_manager, finance)
  // gets a self-service one built from their own data.
  const isHrManager = roles.includes("hr") || roles.includes("admin");

  const { data: myAssets } = useMyAssets();
  const { data: myLeave } = useMyLeave();
  const { data: myOnboarding } = useMyProcess("onboarding");

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

  const title = user ? getGreeting(user.name) : "Hi!";

  const employeeStats = useMemo(() => {
    const balances = myLeave?.balances ?? [];
    const leaveRemaining = balances.reduce((sum, b) => sum + remainingDays(b), 0);
    const flaggedOrIssue = (myAssets ?? []).filter(
      (a) => a.hasIssue === "YES" || a.isFlagged,
    ).length;

    return [
      { icon: Package, label: "My Assets", value: String(myAssets?.length ?? 0) },
      { icon: Wallet, label: "Leave Days Left", value: String(leaveRemaining) },
      { icon: AlertTriangle, label: "Assets Needing Attention", value: String(flaggedOrIssue) },
      {
        icon: ClipboardCheck,
        label: "Onboarding",
        value: myOnboarding?.instance ? `${myOnboarding.progress?.percent ?? 0}%` : "Complete",
      },
    ];
  }, [myAssets, myLeave, myOnboarding]);

  const showOnboardingCard =
    !!myOnboarding?.instance && myOnboarding.instance.status === "in_progress";

  return (
    <div className="flex flex-col gap-6 w-full pb-6">
      <StatsHeader
        title={title}
        scrolled={scrolled}
        stats={isHrManager ? undefined : employeeStats}
        ClassName="w-full"
      />
      {isHrManager ? (
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="grid gap-6 md:grid-cols-2 flex-1">
            <LeaveSummaryCard />
            <EmploymentStatusCard />
            <ApplicantsCard />
            <SystemAlertsCard />
          </div>
          <div className="w-full xl:w-[40%]">
            <ScheduleCard />
          </div>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <section className="space-y-3">
              <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                My Time Off
              </h2>
              <BalanceCards balances={myLeave?.balances ?? []} />
            </section>
            <div className="grid gap-6 md:grid-cols-2">
              <MyAssetsCard />
              {showOnboardingCard && <MyOnboardingCard />}
            </div>
          </div>
          <div className="w-full xl:w-[40%]">
            <ScheduleCard />
          </div>
        </div>
      )}
    </div>
  );
}
