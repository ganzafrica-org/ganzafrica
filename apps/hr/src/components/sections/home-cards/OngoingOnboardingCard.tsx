"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useProcesses } from "@/hooks/useProcesses";
import { getInitials } from "@/lib/helpers/employee-util";

/**
 * "Ongoing track" — real onboarding-progress milestones across every employee currently
 * onboarding, from the LCM-01 process engine (org-wide, no employee_id filter — same endpoint
 * MyOnboardingCard uses for the self-service one-person view).
 */
export function OngoingOnboardingCard() {
  const { data: instances, isLoading } = useProcesses({
    type: "onboarding",
    status: "in_progress",
  });

  const rows = instances ?? [];

  return (
    <Card className="border-0 shadow-sm rounded-lg">
      <CardHeader className="flex flex-row justify-between">
        <CardTitle className="font-semibold text-slate-800 dark:text-slate-300">
          Ongoing onboarding
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
        {!isLoading && rows.length === 0 && (
          <p className="text-sm text-slate-400">No one is currently onboarding.</p>
        )}
        {rows.slice(0, 5).map((row) => (
          <Link
            key={row.id}
            href={`/employees/onboarding/${row.id}`}
            className="block rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-brand-accent/10 text-brand-accent text-xs">
                  {getInitials(row.employee.first_name, row.employee.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-slate-900">
                    {row.employee.first_name} {row.employee.last_name}
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-slate-500">
                    {row.progress.percent}%
                  </span>
                </div>
                <Progress value={row.progress.percent} className="mt-1.5 h-1.5 rounded-full" />
              </div>
            </div>
          </Link>
        ))}
        {rows.length > 5 && <p className="text-xs text-slate-400 pt-1">+{rows.length - 5} more</p>}
      </CardContent>
    </Card>
  );
}
