"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMyProcess } from "@/hooks/useProcesses";

/** Only meant to render while onboarding is in progress — the caller checks that first. */
export function MyOnboardingCard() {
  const { data } = useMyProcess("onboarding");
  const percent = data?.progress?.percent ?? 0;
  const done = data?.progress?.done ?? 0;
  const total = data?.progress?.total ?? 0;

  return (
    <Card className="border-0 shadow-sm rounded-lg">
      <CardHeader className="flex flex-row justify-between">
        <CardTitle className="font-semibold text-slate-800 dark:text-slate-300">
          Onboarding Progress
        </CardTitle>
        <Link
          href="/employees/onboarding/me"
          className="text-xs font-medium text-brand-accent hover:underline self-center"
        >
          Continue
        </Link>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            {done} of {total} tasks complete
          </span>
          <span className="font-semibold text-slate-900 dark:text-white">{percent}%</span>
        </div>
        <Progress value={percent} className="h-2 rounded-full" />
      </CardContent>
    </Card>
  );
}
