"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CircleDashed, ClipboardCheck, Settings2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { InstanceTable, onboardingDisplayStatus } from "@/components/processes/instance-table";
import { useProcesses } from "@/hooks/useProcesses";
import { StatsHeader } from "@/components/sections/header";

export default function OnboardingPage() {
  const [status, setStatus] = useState("in_progress");
  const {
    data: rows = [],
    isLoading,
    isError,
  } = useProcesses({
    type: "onboarding",
    status: status === "all" ? undefined : status,
  });

  // Unfiltered — the table's own query above is scoped to whichever status the dropdown picks
  // (defaulting to in_progress), so headerStats needs its own full-roster read to count correctly
  // across all three states regardless of what the table is currently showing.
  const { data: allRows = [], isLoading: statsLoading } = useProcesses({ type: "onboarding" });

  const stats = useMemo(() => {
    let notStarted = 0;
    let onboarding = 0;
    let completed = 0;
    let overdue = 0;
    for (const row of allRows) {
      const label = onboardingDisplayStatus(row.status, row.progress.done);
      if (label === "Not Started") notStarted++;
      else if (label === "Onboarding") onboarding++;
      else if (label === "Completed") completed++;
      overdue += row.overdue_count;
    }
    return [
      { icon: CircleDashed, label: "Not Started", value: String(notStarted) },
      { icon: ClipboardCheck, label: "Onboarding", value: String(onboarding) },
      { icon: CheckCircle2, label: "Completed", value: String(completed) },
      { icon: AlertTriangle, label: "Overdue Tasks", value: String(overdue) },
    ];
  }, [allRows]);

  return (
    <div className="flex w-full flex-col gap-6">
      <StatsHeader
        title="Onboarding Overview"
        subtitle="Track every new hire's checklist"
        stats={stats}
        isLoading={statsLoading}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Onboarding</h1>
          <p className="text-sm text-muted-foreground">
            Checklists start automatically when an offer is accepted.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/settings/onboarding-templates">
            <Settings2 className="mr-1.5 size-4" /> Templates
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="mb-4 flex justify-end">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <InstanceTable rows={rows} type="onboarding" isLoading={isLoading} isError={isError} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
