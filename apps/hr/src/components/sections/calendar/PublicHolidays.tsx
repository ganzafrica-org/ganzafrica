"use client";

import { Avatar, AvatarFallback } from "@heroui/react";
import { Card } from "@/components/ui/card";
import { useRelevantHolidays } from "@/hooks/useLeaveBalances";
import { countryToFlag } from "@/lib/helpers/employee-util";
import type { PublicHolidayApi } from "@/services/leave-balances.service";

const MONTH_ABBR = [
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

/** One holiday, as a square avatar showing its date (day + month abbreviation) — HeroUI's Avatar
 *  has no built-in square shape, so the corner radius is forced via inline style (HeroUI's own
 *  compiled CSS loads after Tailwind's utilities, so a class-based override isn't reliable). */
function HolidayAvatar({ holiday }: { holiday: PublicHolidayApi }) {
  const d = new Date(`${holiday.date}T00:00:00.000Z`);
  return (
    <Avatar
      size="sm"
      className="ring-2 ring-white"
      style={{ borderRadius: 6 }}
      title={`${holiday.name} — ${MONTH_ABBR[d.getUTCMonth()]} ${d.getUTCDate()}`}
    >
      <AvatarFallback
        className="bg-indigo-100 text-indigo-700 text-[9px] font-semibold leading-none"
        style={{ borderRadius: 6 }}
      >
        <span className="flex flex-col items-center">
          <span>{d.getUTCDate()}</span>
          <span>{MONTH_ABBR[d.getUTCMonth()]}</span>
        </span>
      </AvatarFallback>
    </Avatar>
  );
}

/** HeroUI has no AvatarGroup in this version — reproduces the same overlapping-avatars-plus-
 *  overflow-count visual by hand, one avatar per holiday, square rather than circular. */
function HolidayAvatarStrip({ holidays }: { holidays: PublicHolidayApi[] }) {
  const MAX_VISIBLE = 8;
  const visible = holidays.slice(0, MAX_VISIBLE);
  const overflow = holidays.length - visible.length;

  return (
    <div className="flex -space-x-2">
      {visible.map((h) => (
        <HolidayAvatar key={`${h.date}:${h.name}`} holiday={h} />
      ))}
      {overflow > 0 && (
        <Avatar size="sm" className="ring-2 ring-white" style={{ borderRadius: 6 }}>
          <AvatarFallback
            className="bg-slate-200 text-slate-700 text-[10px] font-semibold"
            style={{ borderRadius: 6 }}
          >
            +{overflow}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

/**
 * Real public holidays (Nager.Date), grouped by country — one card per represented country, a
 * live count, and a square avatar strip below showing each holiday's date.
 */
export function PublicHolidays() {
  const { data: holidays, isLoading } = useRelevantHolidays();

  if (isLoading) {
    return <div className="text-xs text-gray-400">Loading…</div>;
  }

  const groups = new Map<string, PublicHolidayApi[]>();
  (holidays ?? []).forEach((h) => {
    const list = groups.get(h.country) ?? [];
    list.push(h);
    groups.set(h.country, list);
  });

  if (!groups.size) {
    return <div className="text-xs text-gray-400">No public holidays configured yet.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {[...groups.entries()].map(([country, countryHolidays]) => {
        const flag = countryToFlag(country);
        const sorted = [...countryHolidays].sort((a, b) => a.date.localeCompare(b.date));
        return (
          <Card
            key={country}
            className="p-4 bg-white border border-gray-100 shadow-none hover:border-gray-200 transition-colors space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg shrink-0">
                  {flag?.flag ?? "🏢"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{country} public holidays</p>
                  <p className="text-xs text-gray-600">{sorted.length} holidays</p>
                </div>
              </div>
            </div>
            <HolidayAvatarStrip holidays={sorted} />
          </Card>
        );
      })}
    </div>
  );
}
