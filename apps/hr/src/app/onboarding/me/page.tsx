"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PartyPopper, CheckCircle2, ClipboardCheck, AlertTriangle } from "lucide-react";
import { TaskRow } from "@/components/processes/task-row";
import { ProgressRing } from "@/components/processes/progress-ring";
import { useMyProcess, useMyTasks } from "@/hooks/useProcesses";
import { StatsHeader } from "@/components/sections/header";

export default function MyOnboardingPage() {
  const { data, isLoading, isError } = useMyProcess("onboarding");
  const { data: myTasks = [] } = useMyTasks();
  const [scrolled, setScrolled] = useState(false);

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
  const progress = data?.progress;

  // The server already stripped staff-only rows; split what is mine to act on from the rest.
  const myTaskIds = useMemo(() => new Set(myTasks.map((t) => t.id)), [myTasks]);
  const mine = useMemo(
    () => tasks.filter((t) => myTaskIds.has(t.id) && t.status === "pending"),
    [tasks, myTaskIds],
  );
  const others = useMemo(
    () => tasks.filter((t) => !myTaskIds.has(t.id) || t.status !== "pending"),
    [tasks, myTaskIds],
  );

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
        comparison: `of ${progress?.total ?? 0} steps`,
      },
      {
        icon: ClipboardCheck,
        label: "Your Action Items",
        value: String(mine.length),
        comparison: "still need you",
      },
      {
        icon: AlertTriangle,
        label: "Overdue",
        value: String(overdue),
      },
      {
        label: "Overall Progress",
        content: <ProgressRing percent={progress?.percent ?? 0} variant="dark" />,
      },
    ];
  }, [progress, tasks, mine]);

  if (isLoading) {
    return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  }
  if (isError) {
    return <p className="py-12 text-center text-red-500">Could not load your onboarding.</p>;
  }

  if (!instance) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-12 text-center">
          <p className="font-medium text-slate-900">You have no onboarding in progress</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Anything assigned to you will show up here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const complete = instance.status === "completed";

  return (
    <div className="flex w-full flex-col gap-6">
      <StatsHeader
        title="My Onboarding"
        subtitle="Your checklist to get fully set up"
        stats={stats}
        scrolled={scrolled}
        ClassName="w-full"
      />

      <div className="flex flex-col gap-6 px-6 pb-6">
        {complete && (
          <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
            <CardContent className="flex items-center gap-3 p-5">
              <PartyPopper className="size-5 shrink-0 text-emerald-600" />
              <p className="text-sm text-emerald-900">
                Everything is done. Your manager and HR have been notified.
              </p>
            </CardContent>
          </Card>
        )}

        {mine.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Your action items
            </h2>
            {mine.map((task) => (
              <TaskRow key={task.id} task={task} canManage={false} isMine />
            ))}
          </section>
        )}

        {others.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Being handled for you
            </h2>
            {others.map((task) => (
              <TaskRow key={task.id} task={task} canManage={false} isMine={false} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
