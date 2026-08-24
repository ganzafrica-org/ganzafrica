"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DataTable, ColumnDef } from "@/components/sections/table-component";
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

/**
 * `process_instances.status` only has in_progress|completed|cancelled — there is no "not started"
 * value in the backend enum. An instance that exists but hasn't had a single task actioned is
 * still `in_progress` there, which the raw enum badge can't tell apart from one someone's actually
 * working through. This derives the three-way onboarding-specific label the UI wants (Not Started
 * / Onboarding / Completed) from status + progress, so the table's Status column and the page's
 * headerStats tiles (employees/onboarding/page.tsx) count rows the same way.
 */
export type OnboardingDisplayStatus = "Not Started" | "Onboarding" | "Completed" | "Cancelled";

export function onboardingDisplayStatus(
  status: ProcessListRow["status"],
  progressDone: number,
): OnboardingDisplayStatus {
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";
  return progressDone > 0 ? "Onboarding" : "Not Started";
}

const ONBOARDING_STATUS_VARIANT: Record<
  OnboardingDisplayStatus,
  "default" | "secondary" | "outline"
> = {
  "Not Started": "outline",
  Onboarding: "default",
  Completed: "secondary",
  Cancelled: "outline",
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

/** Flat, sortable/searchable shape the shared DataTable (employees/page.tsx's table) expects. */
interface DisplayRow {
  id: number;
  employeeName: string;
  jobTitle: string;
  employmentType: string;
  overdueCount: number;
  progressPercent: number;
  progressDone: number;
  progressTotal: number;
  startedAt: string;
  status: ProcessListRow["status"];
}

/** Shared by the onboarding and offboarding index pages (LCM-02 reuses this) — same DataTable as
 * the employees directory, for a uniform table look/feel across the HR app. */
export function InstanceTable({ rows, type, isLoading, isError }: Props) {
  const router = useRouter();

  const displayRows = useMemo<DisplayRow[]>(
    () =>
      rows.map((row) => ({
        id: row.id,
        employeeName: `${row.employee.first_name} ${row.employee.last_name}`.trim(),
        jobTitle: row.employee.job_title ?? "—",
        employmentType: row.employee.employment_type,
        overdueCount: row.overdue_count,
        progressPercent: row.progress.percent,
        progressDone: row.progress.done,
        progressTotal: row.progress.total,
        startedAt: row.started_at,
        status: row.status,
      })),
    [rows],
  );

  const columns: ColumnDef<DisplayRow>[] = [
    {
      key: "employeeName",
      header: "Employee",
      sortable: true,
      render: (name, row) => (
        <>
          <span className="font-medium text-slate-900">{name}</span>
          {row.overdueCount > 0 && (
            <Badge variant="outline" className="ml-2 border-red-200 text-red-600">
              {row.overdueCount} overdue
            </Badge>
          )}
        </>
      ),
    },
    {
      key: "jobTitle",
      header: "Role",
      sortable: true,
      className: "text-muted-foreground",
      render: (jobTitle, row) => (
        <>
          {jobTitle}
          <span className="ml-1 capitalize text-xs">({row.employmentType})</span>
        </>
      ),
    },
    {
      key: "progressPercent",
      header: "Progress",
      sortable: true,
      render: (percent, row) => (
        <div>
          <ProgressBar percent={percent} />
          <span className="text-xs text-muted-foreground">
            {row.progressDone}/{row.progressTotal} required
          </span>
        </div>
      ),
    },
    {
      key: "startedAt",
      header: "Started",
      sortable: true,
      className: "text-muted-foreground",
      render: (startedAt) => String(startedAt).slice(0, 10),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (status, row) => {
        // Offboarding (LCM-02) hasn't shipped a UI yet — keep the raw enum badge for it and only
        // apply the Not Started/Onboarding/Completed split where it's meaningful.
        if (type !== "onboarding") {
          return (
            <Badge variant={STATUS_VARIANT[status] ?? "outline"}>
              {String(status).replace("_", " ")}
            </Badge>
          );
        }
        const label = onboardingDisplayStatus(status, row.progressDone);
        return <Badge variant={ONBOARDING_STATUS_VARIANT[label]}>{label}</Badge>;
      },
    },
  ];

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
    <DataTable
      columns={columns}
      data={displayRows}
      onRowClick={(row) => router.push(`${BASE_PATH[type]}/${row.id}`)}
      searchPlaceholder="Search employees…"
    />
  );
}
