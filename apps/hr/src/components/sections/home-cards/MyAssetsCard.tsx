"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { useMyAssets } from "@/hooks/useAssets";
import { ASSET_STATUS_BADGE_STYLES, getCategoryIcon } from "@/lib/helpers/assets-util";

export function MyAssetsCard() {
  const { data: assets, isLoading } = useMyAssets();
  const myAssets = assets ?? [];
  const preview = myAssets.slice(0, 3);

  return (
    <Card className="border-0 shadow-sm rounded-lg">
      <CardHeader className="flex flex-row justify-between">
        <CardTitle className="font-semibold text-slate-800 dark:text-slate-300">
          My Assets
        </CardTitle>
        <Link
          href="/asset/me"
          className="text-xs font-medium text-brand-accent hover:underline self-center"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="pb-4">
        {isLoading ? (
          <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
        ) : preview.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <Package className="h-8 w-8 text-slate-300" />
            <p className="text-sm text-muted-foreground">No assets assigned to you</p>
          </div>
        ) : (
          <div className="space-y-3">
            {preview.map((asset) => (
              <div key={asset.id} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg shrink-0">
                  {getCategoryIcon(asset.category?.slug || "")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{asset.deviceName}</div>
                  <div className="text-xs text-muted-foreground truncate">{asset.serialNumber}</div>
                </div>
                <Badge variant="outline" className={ASSET_STATUS_BADGE_STYLES[asset.status] ?? ""}>
                  {asset.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
            {myAssets.length > preview.length && (
              <p className="text-xs text-muted-foreground">
                +{myAssets.length - preview.length} more
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
