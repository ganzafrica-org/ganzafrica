"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProcessListRow, ProcessType } from "@/services/processes.service";

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs text-muted-foreground">{percent}%</span>
    </div>
  );
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  in_progress: "default",
  completed: "secondary",
  cancelled: "outline",
};

// Onboarding lives nested under Employees; offboarding (LCM-02) hasn't shipped a route yet, so
// it falls back to a top-level guess until that ships and this gets a real entry.
const BASE_PATH: Record<ProcessType, string> = {
  onboarding: "/employees/onboarding",
  offboarding: "/offboarding",
};

interface Props {
  rows: ProcessListRow[];
  type: ProcessType;
  isLoading?: boolean;
  isError?: boolean;
}

/** Shared by the onboarding and offboarding index pages (LCM-02 reuses this). */
export function InstanceTable({ rows, type, isLoading, isError }: Props) {
  if (isLoading) {
    return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  }
  if (isError) {
    return <p className="py-12 text-center text-red-500">Failed to load. Please try again.</p>;
  }
  if (!rows.length) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No {type} processes yet. They start automatically when an offer is accepted.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Started</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id} className="cursor-pointer">
            <TableCell>
              <Link
                href={`${BASE_PATH[type]}/${row.id}`}
                className="font-medium text-slate-900 hover:underline"
              >
                {row.employee.first_name} {row.employee.last_name}
              </Link>
              {row.overdue_count > 0 && (
                <Badge variant="outline" className="ml-2 border-red-200 text-red-600">
                  {row.overdue_count} overdue
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {row.employee.job_title ?? "—"}
              <span className="ml-1 capitalize text-xs">({row.employee.employment_type})</span>
            </TableCell>
            <TableCell>
              <ProgressBar percent={row.progress.percent} />
              <span className="text-xs text-muted-foreground">
                {row.progress.done}/{row.progress.total} required
              </span>
            </TableCell>
            <TableCell className="text-muted-foreground">{row.started_at.slice(0, 10)}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[row.status] ?? "outline"}>
                {row.status.replace("_", " ")}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
