"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { MoreHorizontal } from "lucide-react";
import { useLeaves } from "@/hooks/useLeaves";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function isSameDayOrBetween(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

export function LeaveSummaryCard() {
  // HR-wide: /hr/leave/requests returns every employee's requests for an HR/admin caller
  // (listVisibleLeaves), so this is org-wide leave activity, not one person's balance.
  const { data: leaves, isLoading } = useLeaves();

  const { chartData, pendingCount, awayTodayCount } = useMemo(() => {
    const rows = leaves ?? [];
    const now = new Date();

    // Last 6 months, oldest first, counting APPROVED requests by type per month.
    const months: { key: string; label: string; annual: number; sick: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: MONTH_LABELS[d.getMonth()],
        annual: 0,
        sick: 0,
      });
    }
    const byKey = new Map(months.map((m) => [m.key, m]));

    let pending = 0;
    let away = 0;
    for (const leave of rows) {
      if (leave.status === "Pending") pending += 1;

      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      if (leave.status === "Approved" && isSameDayOrBetween(now, start, end)) away += 1;

      if (leave.status !== "Approved") continue;
      const key = `${start.getFullYear()}-${start.getMonth()}`;
      const bucket = byKey.get(key);
      if (!bucket) continue;
      if (leave.type === "ANNUAL") bucket.annual += 1;
      else if (leave.type === "SICK") bucket.sick += 1;
    }

    return { chartData: months, pendingCount: pending, awayTodayCount: away };
  }, [leaves]);

  return (
    <Card className="border-0 shadow-sm rounded-lg">
      <CardHeader className="flex flex-row justify-between">
        <CardTitle className="font-semibold text-slate-800 dark:text-slate-300">
          Leave summary
        </CardTitle>
        <button className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
          <MoreHorizontal size={18} className="text-slate-400" />
        </button>{" "}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-fit w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis hide domain={[0, "dataMax + 1"]} />
              <Tooltip
                cursor={{ stroke: "rgba(15,118,110,0.15)", strokeWidth: 2 }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  boxShadow: "0 10px 30px rgba(2, 6, 23, 0.08)",
                }}
              />
              <Line
                type="monotone"
                dataKey="annual"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
              />
              <Line type="monotone" dataKey="sick" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border bg-white/60 dark:bg-white/10 p-3">
            <div className="text-[11px] text-slate-500 dark:text-white">Pending requests</div>
            <div className="mt-1 text-lg font-semibold text-slate-900  dark:text-white">
              {isLoading ? "—" : pendingCount}
            </div>
            <Badge className="mt-2 bg-amber-100 text-amber-800 border-0 rounded-md">
              Needs review
            </Badge>
          </div>
          <div className="rounded-2xl border bg-white/60 dark:bg-white/10 p-3">
            <div className="text-[11px] text-slate-500  dark:text-white">On leave today</div>
            <div className="mt-1 text-lg font-semibold text-slate-900  dark:text-white">
              {isLoading ? "—" : awayTodayCount}
            </div>
            <Badge className="mt-2 bg-emerald-100 text-emerald-800 border-0 rounded-md">
              Away today
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
