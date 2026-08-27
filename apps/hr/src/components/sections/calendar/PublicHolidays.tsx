"use client";

import { Card } from "@/components/ui/card";
import { useRelevantHolidays } from "@/hooks/useLeaveBalances";
import { countryToFlag } from "@/lib/helpers/employee-util";

/**
 * Punch-list #7 — real, per-country holidays (was fully hardcoded: two static
 * "Rwanda"/"Burkina Faso" cards, disconnected from both the real /hr/holidays API and the leave
 * calendar's own data). Groups the relevant-scope union (universal + every represented country's
 * holidays) by country, one card per group with a count — same visual shape as before.
 */
export function PublicHolidays() {
  const { data: holidays, isLoading } = useRelevantHolidays();

  if (isLoading) {
    return <div className="text-xs text-gray-400">Loading…</div>;
  }

  const groups = new Map<string, number>();
  (holidays ?? []).forEach((h) => {
    const key = h.country || "Company-wide";
    groups.set(key, (groups.get(key) ?? 0) + 1);
  });

  if (!groups.size) {
    return <div className="text-xs text-gray-400">No public holidays configured yet.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {[...groups.entries()].map(([country, count]) => {
        const flag = country === "Company-wide" ? null : countryToFlag(country);
        return (
          <Card
            key={country}
            className="p-4 bg-white border border-gray-100 shadow-none hover:border-gray-200 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg shrink-0">
                  {flag?.flag ?? "🏢"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {country === "Company-wide"
                      ? "Company-wide holidays"
                      : `${country} public holidays`}
                  </p>
                  <p className="text-xs text-gray-600">{count} holidays</p>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
