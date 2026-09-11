"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Ban, CheckCircle2, ClipboardCheck, AlertTriangle } from "lucide-react";
import { ProcessStatus } from "@/components/processes/process-status";
import { ProgressRing } from "@/components/processes/progress-ring";
import { useProcess, useCancelProcess } from "@/hooks/useProcesses";
import { StatsHeader } from "@/components/sections/header";

export default function OnboardingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [scrolled, setScrolled] = useState(false);

  const { data, isLoading, isError } = useProcess(Number.isNaN(id) ? null : id);
  const cancel = useCancelProcess();

  useEffect(() => {
    const mainEl = document.querySelector("main.overflow-auto") as HTMLElement | null;
    const onScroll = () => setScrolled((mainEl ? mainEl.scrollTop : window.scrollY) > 10);
    onScroll();
    mainEl?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      mainEl?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const instance = data?.instance;
  const tasks = useMemo(() => data?.tasks ?? [], [data]);
  const progress = data?.progress ?? null;
  const canManage = data?.can_manage ?? false;

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const overdue = tasks.filter(
      (t) => t.status === "pending" && !!t.due_date && t.due_date < today,
    ).length;
    return [
      {
        icon: CheckCircle2,
        label: "Completed Steps",
        value: String(progress?.done ?? 0),
        comparison: `of ${progress?.total ?? 0} required`,
      },
      {
        icon: ClipboardCheck,
        label: "Remaining Steps",
        value: String((progress?.total ?? 0) - (progress?.done ?? 0)),
      },
      {
        icon: AlertTriangle,
        label: "Overdue Tasks",
        value: String(overdue),
      },
      {
        label: "Overall Progress",
        content: <ProgressRing percent={progress?.percent ?? 0} variant="dark" />,
      },
    ];
  }, [tasks, progress]);

  if (isLoading) {
    return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  }
  if (isError || !instance) {
    return <p className="py-12 text-center text-red-500">Could not load this process.</p>;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <StatsHeader
        title="Onboarding checklist"
        subtitle={`Started ${instance.started_at.slice(0, 10)}`}
        stats={stats}
        scrolled={scrolled}
        ClassName="w-full"
      />

      <div className="px-6">
        <Button
          asChild
          variant="outline"
          className="mb-2 -ml-2bg-transparent border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white"
        >
          <Link href="/employees/onboarding">
            <ArrowLeft className="mr-1.5 size-4" /> Back to All onboarding
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-end gap-3">
          <div className="flex items-center gap-2">
            <Badge
              variant={instance.status === "completed" ? "secondary" : "default"}
              className="bg-transparent text-brand-accent"
            >
              {instance.status.replace("_", " ")}
            </Badge>
            {canManage && instance.status === "in_progress" && (
              <Button
                variant="outline"
                onClick={() => cancel.mutate(instance.id)}
                disabled={cancel.isPending}
                className="bg-transparent border border-red-500 text-red-500 hover:bg-red-700 hover:text-white"
              >
                <Ban className="mr-1.5 size-4" /> Cancel process
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <ProcessStatus
          tasks={tasks}
          canManage={canManage}
          variant="full"
          employeeId={instance.employee_id}
        />
      </div>
    </div>
  );
}
