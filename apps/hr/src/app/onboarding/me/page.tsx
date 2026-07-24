"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PartyPopper } from "lucide-react";
import { TaskRow } from "@/components/processes/task-row";
import { useMyProcess, useMyTasks } from "@/hooks/useProcesses";

function ProgressRing({ percent }: { percent: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      viewBox="0 0 100 100"
      className="size-28 shrink-0"
      role="img"
      aria-label={`${percent}% complete`}
    >
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        className="text-slate-200"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        className="text-emerald-500 transition-all"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - (percent / 100) * circumference}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="56" textAnchor="middle" className="fill-slate-800 text-[22px] font-semibold">
        {percent}%
      </text>
    </svg>
  );
}

export default function MyOnboardingPage() {
  const { data, isLoading, isError } = useMyProcess("onboarding");
  const { data: myTasks = [] } = useMyTasks();

  if (isLoading) {
    return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  }
  if (isError) {
    return <p className="py-12 text-center text-red-500">Could not load your onboarding.</p>;
  }

  if (!data?.instance) {
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

  const { instance, tasks, progress } = data;
  const myTaskIds = new Set(myTasks.map((t) => t.id));

  // The server already stripped staff-only rows; split what is mine to act on from the rest.
  const mine = tasks.filter((t) => myTaskIds.has(t.id) && t.status === "pending");
  const others = tasks.filter((t) => !myTaskIds.has(t.id) || t.status !== "pending");
  const complete = instance.status === "completed";

  return (
    <div className="flex w-full flex-col gap-6">
      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-center gap-5 p-6 sm:flex-row">
          <ProgressRing percent={progress?.percent ?? 0} />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {complete ? "You're all set" : "Welcome to GanzAfrica"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {complete
                ? "Your onboarding is complete and your account is fully active."
                : "A few steps to get you set up. We'll handle the rest behind the scenes."}
            </p>
          </div>
        </CardContent>
      </Card>

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
  );
}
