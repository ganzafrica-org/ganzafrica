"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useLeaveSummary } from "@/hooks/useLeaveBalances";
import type { SummaryWindow } from "@/services/leave-balances.service";

const WINDOWS: { value: SummaryWindow; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

/**
 * Punch-list #8 — historical leave totals (request count + total days, both shown since there's
 * room and either alone is only half the picture), additional to the existing LeaveSummaryCard
 * rather than a replacement — that card stays as-is. APPROVED leave only, server-aggregated via
 * GET /hr/leave/summary (leave-core.service.ts's getLeaveSummary), reusing the same UTC
 * week/month/year boundary convention as leave-days.ts.
 */
export function LeaveHistoryCard() {
  const [window, setWindow] = useState<SummaryWindow>("month");
  const { data, isLoading, isError, refetch } = useLeaveSummary(window);

  return (
    <Card className="border-0 shadow-sm rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-semibold text-slate-800 dark:text-slate-300">
          Leave history
        </CardTitle>
        <div className="flex rounded-lg border p-0.5">
          {WINDOWS.map((w) => (
            <button
              key={w.value}
              onClick={() => setWindow(w.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                window === w.value
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isError && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <p className="text-sm text-slate-600 dark:text-white">
              Couldn&apos;t load leave history.
            </p>
            <button
              onClick={() => refetch()}
              className="text-xs font-medium text-brand-accent hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!isError && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border bg-white/60 dark:bg-white/10 p-3">
              <div className="text-[11px] text-slate-500 dark:text-white">Requests</div>
              <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                {isLoading ? "—" : (data?.requestCount ?? 0)}
              </div>
            </div>
            <div className="rounded-2xl border bg-white/60 dark:bg-white/10 p-3">
              <div className="text-[11px] text-slate-500 dark:text-white">Total days</div>
              <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                {isLoading ? "—" : (data?.totalDays ?? 0)}
              </div>
            </div>
          </div>
        )}

        {!isLoading && !isError && (data?.requestCount ?? 0) === 0 && (
          <p className="mt-3 text-xs text-slate-500 dark:text-white">
            No approved leave in this period.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
