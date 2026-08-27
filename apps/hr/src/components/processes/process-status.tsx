"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TaskRow } from "@/components/processes/task-row";
import type { ProcessTask, Progress } from "@/services/processes.service";

interface Props {
  tasks: ProcessTask[];
  progress: Progress | null;
  /** Viewer holds processes:manage — unlocks skip and shows staff-only chips on task rows. */
  canManage: boolean;
  /** full: progress bar + per-task Outstanding/Completed sections with actions (the onboarding
   *  detail page). summary: compact progress + a plain list of what's still missing, no actions
   *  (the employee detail Overview card and any other embed). Same completed/missing breakdown
   *  either way — just how much of it renders. */
  variant?: "full" | "summary";
  /** Forwarded to TaskRow — only relevant in "full" (HR can link a contract to a contract_signing
   *  task from here). */
  employeeId?: string;
}

/**
 * The per-employee "what's done, what's missing" breakdown — shared by the nested
 * Employees→Onboarding detail page and the employee detail Overview tab's onboarding card, so
 * there's exactly one place this logic lives (per MOD-01's onboarding-embed follow-up).
 */
export function ProcessStatus({ tasks, progress, canManage, variant = "full", employeeId }: Props) {
  const pending = tasks.filter((t) => t.status === "pending");
  const resolved = tasks.filter((t) => t.status !== "pending");

  if (variant === "summary") {
    return (
      <div className="space-y-2">
        {progress && progress.total > 0 && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        )}
        {pending.length === 0 ? (
          <p className="text-xs text-emerald-700">Nothing missing — all steps complete.</p>
        ) : (
          <ul className="space-y-1">
            {pending.map((task) => (
              <li key={task.id} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="size-1.5 shrink-0 rounded-full bg-amber-400" />
                {task.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            <TaskRow
              key={task.id}
              task={task}
              canManage={canManage}
              isMine={false}
              employeeId={employeeId}
            />
          ))}
        </section>
      )}

      {resolved.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Completed
          </h2>
          {resolved.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              canManage={canManage}
              isMine={false}
              employeeId={employeeId}
            />
          ))}
        </section>
      )}
    </div>
  );
}
