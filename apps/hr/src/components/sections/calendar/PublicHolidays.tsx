"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const holidays = [
  {
    region: "Rwanda public holidays",
    count: 14,
    year: 2026,
  },
  {
    region: "Burkina Faso public holidays",
    count: 16,
    year: 2026,
  },
];

export function PublicHolidays() {
  return (
    <div className="flex flex-col gap-4">
      {holidays.map((holiday, index) => (
        <Card
          key={index}
          className="p-4 bg-white border border-gray-100 shadow-none hover:border-gray-200 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg shrink-0">
                {holiday.region.includes("Rwanda") ? "🇷🇼" : "🇧🇫"}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{holiday.region}</p>
                <p className="text-xs text-gray-600">
                  {holiday.count} holidays in {holiday.year}
                </p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
