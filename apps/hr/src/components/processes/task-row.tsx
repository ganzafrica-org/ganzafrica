"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarClock,
  Check,
  CircleDot,
  EyeOff,
  FileSignature,
  Laptop,
  Lock,
  SkipForward,
  Umbrella,
  Upload,
} from "lucide-react";
import { useCompleteTask, useSkipTask } from "@/hooks/useProcesses";
import type { ProcessTask, TaskKind } from "@/services/processes.service";

const KIND_ICON: Record<TaskKind, React.ComponentType<{ className?: string }>> = {
  checklist: CircleDot,
  contract_signing: FileSignature,
  document_upload: Upload,
  asset_assignment: Laptop,
  leave_setup: Umbrella,
};

const KIND_HINT: Partial<Record<TaskKind, string>> = {
  contract_signing: "Completes once the linked contract is signed and active.",
  document_upload: "Upload the document, then mark this done.",
  asset_assignment: "Assign the asset in Assets, then mark this done.",
  leave_setup: "Creates this year's leave balances from the org policy.",
};

function isOverdue(task: ProcessTask) {
  return (
    task.status === "pending" &&
    task.due_date != null &&
    task.due_date < new Date().toISOString().slice(0, 10)
  );
}

interface Props {
  task: ProcessTask;
  /** Viewer holds processes:manage — unlocks skip and shows staff-only chips. */
  canManage: boolean;
  /** Viewer is the assignee, so they may complete it. */
  isMine: boolean;
}

export function TaskRow({ task, canManage, isMine }: Props) {
  const [skipOpen, setSkipOpen] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const complete = useCompleteTask();
  const skip = useSkipTask();

  const Icon = KIND_ICON[task.kind] ?? CircleDot;
  const resolved = task.status !== "pending";
  const actionable = !resolved && (isMine || canManage);

  async function onComplete() {
    setError(null);
    try {
      await complete.mutateAsync({ taskId: task.id });
    } catch (e) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Could not complete this task.",
      );
    }
  }

  async function onSkip() {
    setError(null);
    try {
      await skip.mutateAsync({ taskId: task.id, notes: note });
      setSkipOpen(false);
      setNote("");
    } catch (e) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Could not skip this task.",
      );
    }
  }

  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${
        resolved ? "border-slate-200 bg-slate-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <Icon
          className={`mt-0.5 size-5 shrink-0 ${
            task.status === "done"
              ? "text-emerald-600"
              : task.status === "skipped"
                ? "text-slate-400"
                : "text-slate-500"
          }`}
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={`font-medium ${
                resolved ? "text-slate-500 line-through" : "text-slate-900"
              }`}
            >
              {task.title}
            </p>
            {task.is_blocking && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="size-3" /> Blocking
              </Badge>
            )}
            {task.visibility === "staff_only" && (
              <Badge variant="outline" className="gap-1 text-slate-500">
                <EyeOff className="size-3" /> Staff only
              </Badge>
            )}
            {task.status === "skipped" && <Badge variant="outline">Skipped</Badge>}
          </div>

          {task.description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{task.description}</p>
          )}
          {!resolved && KIND_HINT[task.kind] && (
            <p className="mt-0.5 text-xs text-muted-foreground">{KIND_HINT[task.kind]}</p>
          )}
          {task.notes && task.status === "skipped" && (
            <p className="mt-1 text-sm text-slate-600">Note: {task.notes}</p>
          )}

          {task.due_date && (
            <p
              className={`mt-1 flex items-center gap-1.5 text-xs ${
                isOverdue(task) ? "font-medium text-red-600" : "text-muted-foreground"
              }`}
            >
              <CalendarClock className="size-3.5" />
              Due {task.due_date}
              {isOverdue(task) && " — overdue"}
            </p>
          )}

          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {actionable && (
        <div className="flex shrink-0 gap-2">
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSkipOpen(true)}
              disabled={skip.isPending}
            >
              <SkipForward className="mr-1.5 size-4" /> Skip
            </Button>
          )}
          <Button size="sm" onClick={onComplete} disabled={complete.isPending}>
            <Check className="mr-1.5 size-4" /> Done
          </Button>
        </div>
      )}

      <Dialog open={skipOpen} onOpenChange={setSkipOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Skip this task</DialogTitle>
            <DialogDescription>
              Skipped tasks stay on the record. Explain why so the checklist remains auditable.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Contractor already holds a signed master agreement"
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSkipOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSkip} disabled={!note.trim() || skip.isPending}>
              Skip task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
