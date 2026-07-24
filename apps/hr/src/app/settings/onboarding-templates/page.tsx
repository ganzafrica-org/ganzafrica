"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EyeOff, Lock, Plus, Trash2 } from "lucide-react";
import {
  useProcessTemplates,
  useProcessTemplate,
  useCreateTemplate,
  useDeactivateTemplate,
  useAddTemplateTask,
  useRemoveTemplateTask,
} from "@/hooks/useProcesses";
import type { AssigneeClass, TaskKind } from "@/services/processes.service";

const ASSIGNEES: AssigneeClass[] = ["hr", "it", "manager", "finance", "employee"];
const KINDS: TaskKind[] = [
  "checklist",
  "contract_signing",
  "document_upload",
  "asset_assignment",
  "leave_setup",
];

function TaskEditor({ templateId }: { templateId: number }) {
  const { data: template } = useProcessTemplate(templateId);
  const addTask = useAddTemplateTask();
  const removeTask = useRemoveTemplateTask();

  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState<AssigneeClass>("hr");
  const [kind, setKind] = useState<TaskKind>("checklist");
  const [offset, setOffset] = useState("");
  const [blocking, setBlocking] = useState(true);
  const [staffOnly, setStaffOnly] = useState(false);

  function submit() {
    addTask.mutate(
      {
        templateId,
        title,
        default_assignee: assignee,
        kind,
        is_blocking: blocking,
        visibility: staffOnly ? "staff_only" : "all",
        due_offset_days: offset === "" ? null : Number(offset),
      },
      { onSuccess: () => setTitle("") },
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {template?.tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No steps yet. A template with no steps produces an empty checklist.
          </p>
        )}
        {template?.tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-slate-900">{task.title}</span>
                <Badge variant="outline" className="capitalize">
                  {task.default_assignee}
                </Badge>
                {task.kind !== "checklist" && (
                  <Badge variant="secondary">{task.kind.replace(/_/g, " ")}</Badge>
                )}
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
              </div>
              {task.due_offset_days != null && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Due {task.due_offset_days} day(s) after start
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove ${task.title}`}
              onClick={() => removeTask.mutate({ templateId, taskId: task.id })}
            >
              <Trash2 className="size-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      <div className="grid gap-3 rounded-lg border border-dashed border-slate-300 p-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="task-title">Step</Label>
          <Input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sign employment contract"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="task-assignee">Assigned to</Label>
          <Select value={assignee} onValueChange={(v) => setAssignee(v as AssigneeClass)}>
            <SelectTrigger id="task-assignee">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSIGNEES.map((a) => (
                <SelectItem key={a} value={a} className="capitalize">
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="task-kind">Type</Label>
          <Select value={kind} onValueChange={(v) => setKind(v as TaskKind)}>
            <SelectTrigger id="task-kind">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KINDS.map((k) => (
                <SelectItem key={k} value={k}>
                  {k.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="task-offset">Due (days after start)</Label>
          <Input
            id="task-offset"
            type="number"
            value={offset}
            onChange={(e) => setOffset(e.target.value)}
            placeholder="Leave blank for no due date"
          />
        </div>

        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={blocking} onCheckedChange={(v) => setBlocking(Boolean(v))} />
            Required
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={staffOnly} onCheckedChange={(v) => setStaffOnly(Boolean(v))} />
            Hide from employee
          </label>
        </div>

        <div className="sm:col-span-2">
          <Button onClick={submit} disabled={!title.trim() || addTask.isPending}>
            <Plus className="mr-1.5 size-4" /> Add step
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingTemplatesPage() {
  const { data: templates = [], isLoading } = useProcessTemplates("onboarding");
  const createTemplate = useCreateTemplate();
  const deactivate = useDeactivateTemplate();

  const [name, setName] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Onboarding templates</h1>
        <p className="text-sm text-muted-foreground">
          Edits apply to future hires only — checklists already in progress keep the steps they
          started with.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[240px] flex-1 space-y-1.5">
              <Label htmlFor="template-name">New template</Label>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fellow onboarding"
              />
            </div>
            <Button
              onClick={() =>
                createTemplate.mutate(
                  { type: "onboarding", name, employment_types: null },
                  { onSuccess: () => setName("") },
                )
              }
              disabled={!name.trim() || createTemplate.isPending}
            >
              <Plus className="mr-1.5 size-4" /> Create
            </Button>
          </div>

          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

          <div className="space-y-2">
            {templates.map((template) => (
              <div key={template.id} className="rounded-lg border border-slate-200">
                <div className="flex items-center justify-between gap-3 p-3">
                  <button
                    type="button"
                    className="min-w-0 text-left"
                    onClick={() => setSelected(selected === template.id ? null : template.id)}
                  >
                    <span className="font-medium text-slate-900">{template.name}</span>
                    {!template.is_active && (
                      <Badge variant="outline" className="ml-2">
                        Inactive
                      </Badge>
                    )}
                    {template.employment_types && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {template.employment_types.join(", ")}
                      </span>
                    )}
                  </button>
                  {template.is_active && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deactivate.mutate(template.id)}
                    >
                      Deactivate
                    </Button>
                  )}
                </div>

                {selected === template.id && (
                  <div className="border-t border-slate-200 p-4">
                    <TaskEditor templateId={template.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
