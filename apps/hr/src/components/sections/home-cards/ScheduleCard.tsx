"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useLeaves } from "@/hooks/useLeaves";
import { getInitialsFromName } from "@/lib/helpers/employee-util";
import type { Leave } from "@/types/api";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function overlapsDay(leave: Leave, day: Date): boolean {
  const start = new Date(leave.startDate);
  const end = new Date(leave.endDate);
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  return (
    d >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
    d <= new Date(end.getFullYear(), end.getMonth(), end.getDate())
  );
}

/**
 * "Schedule" — was a mock Meetings/Events/Holiday list; replaced with a real calendar showing
 * which employees are away, sourced from the same org-wide leave data (1B) as LeaveSummaryCard.
 * No new data source, per the source doc's instruction.
 */
export function ScheduleCard() {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = React.useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const { data: leaves, isLoading } = useLeaves();

  const approvedLeaves = useMemo(
    () => (leaves ?? []).filter((l) => l.status === "Approved"),
    [leaves],
  );

  const awayToday = useMemo(
    () => approvedLeaves.filter((l) => overlapsDay(l, today)),
    [approvedLeaves, today],
  );

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  // Monday-first blank lead-in, matching the header row below.
  const firstWeekday = (new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() + 6) % 7;

  const awayByDay = useMemo(() => {
    const map = new Map<number, Leave[]>();
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const away = approvedLeaves.filter((l) => overlapsDay(l, d));
      if (away.length) map.set(day, away);
    }
    return map;
  }, [approvedLeaves, viewDate, daysInMonth]);

  return (
    <Card className="border-0 shadow-sm rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Schedule
        </CardTitle>
        <button
          type="button"
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="font-semibold text-slate-900">
            {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-1 rounded hover:bg-slate-100"
              onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            </button>
            <button
              type="button"
              className="p-1 rounded hover:bg-slate-100"
              onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            >
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-[11px] text-slate-400">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`blank-${i}`} className="h-9" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday =
              day === today.getDate() &&
              viewDate.getMonth() === today.getMonth() &&
              viewDate.getFullYear() === today.getFullYear();
            const away = awayByDay.get(day) ?? [];
            return (
              <div key={day} className="flex flex-col items-center gap-0.5">
                <div
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                    isToday
                      ? "bg-emerald-100 text-emerald-800 font-semibold"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {day}
                </div>
                {away.length > 0 && (
                  <div className="flex -space-x-1" title={`${away.length} away`}>
                    {away.slice(0, 3).map((l) => (
                      <div
                        key={l.id}
                        className="h-1.5 w-1.5 rounded-full bg-amber-400 border border-white"
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Away today
          </h3>
          {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
          {!isLoading && awayToday.length === 0 && (
            <p className="text-sm text-slate-400">Everyone&apos;s in today.</p>
          )}
          {awayToday.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {awayToday.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-1.5 rounded-full bg-slate-50 pl-1 pr-3 py-1"
                  title={`${l.employeeName} — ${l.type.toLowerCase()} leave`}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-brand-accent/10 text-brand-accent text-[10px]">
                      {getInitialsFromName(l.employeeName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-slate-700">{l.employeeName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
