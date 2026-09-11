"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { usePendingApprovals } from "@/hooks/useLeaveBalances";
import { getInitialsFromName } from "@/lib/helpers/employee-util";

const TYPE_LABELS: Record<string, string> = {
  ANNUAL: "Annual",
  SICK: "Sick",
  MATERNITY: "Maternity",
  PATERNITY: "Paternity",
  UNPAID: "Unpaid",
  OTHER: "Other",
};

function formatRange(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const s = new Date(start).toLocaleDateString(undefined, opts);
  const e = new Date(end).toLocaleDateString(undefined, opts);
  return s === e ? s : `${s} – ${e}`;
}

interface LeaveRequestsCardProps {
  /** "org": every pending request in the company (HR/admin). "approvals": only requests
   *  waiting on this viewer's own decision (their reports). Both come from the same
   *  role-scoped endpoint — HR/admin get the org-wide set automatically, everyone else gets
   *  their reports' only (empty for a non-manager). */
  scope: "org" | "approvals";
}

/** Pending leave requests, styled like ScheduleCard's "Away today" chip list. */
export function LeaveRequestsCard({ scope }: LeaveRequestsCardProps) {
  const { data: pending, isLoading } = usePendingApprovals();
  const requests = pending ?? [];

  // A non-manager employee has nothing to approve — don't show an always-empty card for them.
  if (scope === "approvals" && !isLoading && requests.length === 0) return null;

  return (
    <Card className="border-0 shadow-sm rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Leave Requests
        </CardTitle>
        <button
          type="button"
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <p className="text-xs text-slate-400">
          {scope === "org"
            ? "Every pending request across the organization."
            : "Requests from your reports awaiting your decision."}
        </p>

        {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
        {!isLoading && requests.length === 0 && (
          <p className="text-sm text-slate-400">Nothing pending right now.</p>
        )}

        {requests.length > 0 && (
          <div className="space-y-2">
            {requests.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-2.5 py-2"
              >
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="bg-brand-accent/10 text-brand-accent text-[10px]">
                    {getInitialsFromName(r.employeeName ?? "—")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-700">
                    {r.employeeName ?? "Unknown"}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">
                    {formatRange(r.start_date, r.end_date)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 bg-brand-accent/10 text-[10px] border-0"
                >
                  {TYPE_LABELS[r.type] ?? r.type}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
