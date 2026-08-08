"use client";

import React, { useMemo } from "react";
import { useAssetHistory } from "@/hooks/useAssets";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserCheck, UserX, Wrench, Info } from "lucide-react";
import type { AssetAssignment, AssetMaintenance } from "@/types/api";

interface AssetHistoryTimelineProps {
  assetId: string | null;
}

type TimelineEntry =
  | { kind: "assignment"; date: string; data: AssetAssignment }
  | { kind: "maintenance"; date: string; data: AssetMaintenance };

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function AssetHistoryTimeline({ assetId }: AssetHistoryTimelineProps) {
  const { data, isLoading, isError } = useAssetHistory(assetId);

  const entries = useMemo<TimelineEntry[]>(() => {
    if (!data) return [];
    const assignmentEntries: TimelineEntry[] = data.assignments.map((a) => ({
      kind: "assignment",
      date: a.assignedAt,
      data: a,
    }));
    const maintenanceEntries: TimelineEntry[] = data.maintenance.map((m) => ({
      kind: "maintenance",
      date: m.maintenanceDate,
      data: m,
    }));
    return [...assignmentEntries, ...maintenanceEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center py-8 text-red-500">
        <Info className="h-6 w-6 mb-2" />
        <p className="text-sm">Failed to load history.</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No history yet.</p>;
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, i) =>
        entry.kind === "assignment" ? (
          <div
            key={`a-${i}`}
            className="flex gap-3 p-3 border rounded-lg bg-blue-50/50 border-blue-100"
          >
            <div className="mt-0.5">
              {entry.data.returnedAt ? (
                <UserX className="h-4 w-4 text-slate-500" />
              ) : (
                <UserCheck className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <div className="flex-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {entry.data.returnedAt ? "Returned" : "Assigned"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(entry.data.returnedAt ?? entry.data.assignedAt)}
                </span>
              </div>
              {entry.data.returnCondition && (
                <p className="text-xs text-muted-foreground mt-1">
                  Condition: {entry.data.returnCondition}
                </p>
              )}
              {entry.data.notes && (
                <p className="text-xs text-slate-600 mt-1 italic">{entry.data.notes}</p>
              )}
            </div>
          </div>
        ) : (
          <div
            key={`m-${i}`}
            className="flex gap-3 p-3 border rounded-lg bg-amber-50/50 border-amber-100"
          >
            <div className="mt-0.5">
              <Wrench className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{entry.data.title}</span>
                <Badge variant="outline" className="text-[10px]">
                  {entry.data.status}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(entry.data.maintenanceDate)}
              </span>
              {entry.data.description && (
                <p className="text-xs text-slate-600 mt-1">{entry.data.description}</p>
              )}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
