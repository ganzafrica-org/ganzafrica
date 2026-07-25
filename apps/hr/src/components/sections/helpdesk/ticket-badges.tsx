import React from "react";
import { Badge } from "@/components/ui/badge";
import type { TicketPriority, TicketStatus } from "@/services/helpdesk.service";

const STATUS_STYLES: Record<TicketStatus, string> = {
  OPEN: "bg-blue-100 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-200",
  RESOLVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
  REOPENED: "bg-orange-100 text-orange-800 border-orange-200",
};

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
  MEDIUM: "bg-blue-100 text-blue-800 border-blue-200",
  HIGH: "bg-orange-100 text-orange-800 border-orange-200",
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <Badge className={STATUS_STYLES[status]}>{status.replace("_", " ")}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <Badge className={`capitalize ${PRIORITY_STYLES[priority]}`}>{priority.toLowerCase()}</Badge>
  );
}
