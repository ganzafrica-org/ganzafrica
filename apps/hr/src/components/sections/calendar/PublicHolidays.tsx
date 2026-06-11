'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PublicHolidays() {
  return (
    <Card className="p-4 bg-white border border-gray-100 shadow-none hover:border-gray-200 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg shrink-0">
            🇷🇼
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Rwanda public holidays</p>
            <p className="text-xs text-gray-600">14 holidays in 2026</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
