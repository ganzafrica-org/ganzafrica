"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { remainingDays, type LeaveBalance } from "@/services/leave-balances.service";

const TYPE_LABELS: Record<string, string> = {
  ANNUAL: "Annual",
  SICK: "Sick",
  MATERNITY: "Maternity",
  PATERNITY: "Paternity",
  UNPAID: "Unpaid",
  OTHER: "Other",
};

function Ring({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const radius = 26;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg viewBox="0 0 64 64" className="size-16 shrink-0" role="img" aria-label={`${pct}% used`}>
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        className="text-slate-200"
      />
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        className="text-emerald-500"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - (pct / 100) * circumference}
        transform="rotate(-90 32 32)"
      />
      <text x="32" y="36" textAnchor="middle" className="fill-slate-700 text-[14px] font-semibold">
        {pct}%
      </text>
    </svg>
  );
}

export function BalanceCards({ balances }: { balances: LeaveBalance[] }) {
  if (!balances.length) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6 text-sm text-muted-foreground">
          No leave balances yet. HR sets entitlements in Settings → Time off.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {balances.map((balance) => {
        const entitled = Number(balance.entitled_days) + Number(balance.carried_over_days);
        const used = Number(balance.used_days);
        const remaining = remainingDays(balance);

        return (
          <Card key={balance.id} className="shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <Ring used={used} total={entitled} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {TYPE_LABELS[balance.type] ?? balance.type}
                </p>
                <p className="text-2xl font-semibold text-slate-900">{remaining}</p>
                <p className="text-xs text-muted-foreground">
                  {used} used of {entitled} day{entitled === 1 ? "" : "s"}
                  {Number(balance.carried_over_days) > 0 &&
                    ` (incl. ${balance.carried_over_days} carried)`}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
