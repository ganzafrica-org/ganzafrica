"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { useAssets } from "@/hooks/useAssets";
import { getCategoryIcon } from "@/lib/helpers/assets-util";
import type { Asset } from "@/types/api";

/** Same "needs attention" definition used elsewhere on the dashboard (page.tsx's
 *  employeeStats): a self-reported issue, or HR/admin having flagged it. */
function needsAttention(asset: Asset): boolean {
  return asset.hasIssue === "YES" || asset.isFlagged;
}

/** HR/admin: every asset with an open issue or flag, org-wide — mirrors ScheduleCard's
 *  "Away today" chip-list styling, each row deep-linking to that asset's detail sheet. */
export function AssetsWithIssueCard() {
  const { data: assets, isLoading } = useAssets();
  const flagged = (assets ?? []).filter(needsAttention);

  return (
    <Card className="border-0 shadow-sm rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Assets With Issue
        </CardTitle>
        <Link
          href="/asset"
          className="text-xs font-medium text-brand-accent hover:underline self-center"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <p className="text-xs text-slate-400">
          Assets currently flagged or reported with an issue.
        </p>

        {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
        {!isLoading && flagged.length === 0 && (
          <p className="text-sm text-slate-400">No assets need attention right now.</p>
        )}

        {flagged.length > 0 && (
          <div className="space-y-2">
            {flagged.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-2.5 py-2"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  {getCategoryIcon(asset.category?.slug || "")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-700">{asset.deviceName}</p>
                  <p className="truncate text-[11px] text-slate-400">{asset.serialNumber}</p>
                </div>
                <Badge variant="outline" className="shrink-0 gap-1 border-amber-200 text-amber-700">
                  <AlertTriangle className="size-3" />
                  {asset.isFlagged ? "Flagged" : "Issue"}
                </Badge>
                <Link
                  href={`/asset?asset=${asset.id}`}
                  className="shrink-0 text-xs font-medium text-brand-accent hover:underline"
                >
                  Read more
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
