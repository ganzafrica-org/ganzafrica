"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Ban } from "lucide-react";
import { TaskRow } from "@/components/processes/task-row";
import { useProcess, useCancelProcess } from "@/hooks/useProcesses";

export default function OnboardingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data, isLoading, isError } = useProcess(Number.isNaN(id) ? null : id);
  const cancel = useCancelProcess();

  if (isLoading) {
    return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  }
  if (isError || !data?.instance) {
    return <p className="py-12 text-center text-red-500">Could not load this process.</p>;
  }

  const { instance, tasks, progress, can_manage } = data;
  const pending = tasks.filter((t) => t.status === "pending");
  const resolved = tasks.filter((t) => t.status !== "pending");

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link href="/onboarding">
            <ArrowLeft className="mr-1.5 size-4" /> All onboarding
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Onboarding checklist</h1>
            <p className="text-sm text-muted-foreground">
              Started {instance.started_at.slice(0, 10)}
              {progress && ` · ${progress.done} of ${progress.total} required steps done`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={instance.status === "completed" ? "secondary" : "default"}>
              {instance.status.replace("_", " ")}
            </Badge>
            {can_manage && instance.status === "in_progress" && (
              <Button
                variant="outline"
                onClick={() => cancel.mutate(instance.id)}
                disabled={cancel.isPending}
              >
                <Ban className="mr-1.5 size-4" /> Cancel process
              </Button>
            )}
          </div>
        </div>
      </div>

      {progress && progress.total > 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {progress.percent}% complete — the employee becomes active once every required step is
              done.
            </p>
          </CardContent>
        </Card>
      )}

      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Outstanding
          </h2>
          {pending.map((task) => (
            <TaskRow key={task.id} task={task} canManage={can_manage} isMine={false} />
          ))}
        </section>
      )}

      {resolved.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Completed
          </h2>
          {resolved.map((task) => (
            <TaskRow key={task.id} task={task} canManage={can_manage} isMine={false} />
          ))}
        </section>
      )}
    </div>
  );
}
