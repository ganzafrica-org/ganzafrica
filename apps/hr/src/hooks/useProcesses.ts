"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  processesService,
  type AssigneeClass,
  type ProcessType,
  type TaskKind,
} from "@/services/processes.service";
import { toast } from "@/lib/toast";

const LIST = "processes";
const ONE = "process";
const MINE = "my-process";
const MY_TASKS = "my-process-tasks";
const TEMPLATES = "process-templates";

/** Anything that mutates a task can change progress, the list, and the onboardee's own view. */
function invalidateProcessViews(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: [LIST] });
  qc.invalidateQueries({ queryKey: [ONE] });
  qc.invalidateQueries({ queryKey: [MINE] });
  qc.invalidateQueries({ queryKey: [MY_TASKS] });
}

export function useProcesses(
  params: { type?: ProcessType; status?: string; employee_id?: string } = {},
  enabled = true,
) {
  return useQuery({
    queryKey: [LIST, params],
    queryFn: () => processesService.list(params),
    enabled,
  });
}

export function useProcess(id: number | null) {
  return useQuery({
    queryKey: [ONE, id],
    queryFn: () => processesService.get(id!),
    enabled: id != null,
  });
}

/** enabled defaults to true for the self-service dashboard; the employee sheet passes isSelf so the HR-gated useProcesses() above runs instead when viewing someone else. */
export function useMyProcess(type: ProcessType = "onboarding", enabled = true) {
  return useQuery({
    queryKey: [MINE, type],
    queryFn: () => processesService.getMine(type),
    enabled,
  });
}

export function useMyTasks() {
  return useQuery({ queryKey: [MY_TASKS], queryFn: () => processesService.myTasks() });
}

export function useStartProcess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      ...payload
    }: {
      employeeId: string;
      type: ProcessType;
      template_id?: number;
    }) => processesService.start(employeeId, payload),
    onSuccess: () => {
      invalidateProcessViews(qc);
      toast.success("Process started");
    },
  });
}

export function useCancelProcess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => processesService.cancel(id),
    onSuccess: () => {
      invalidateProcessViews(qc);
      toast.success("Process cancelled");
    },
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, notes }: { taskId: number; notes?: string }) =>
      processesService.completeTask(taskId, notes),
    onSuccess: () => {
      invalidateProcessViews(qc);
      toast.success("Task completed");
    },
  });
}

export function useSkipTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, notes }: { taskId: number; notes: string }) =>
      processesService.skipTask(taskId, notes),
    onSuccess: () => {
      invalidateProcessViews(qc);
      toast.success("Task skipped");
    },
  });
}

export function usePatchTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      ...patch
    }: {
      taskId: number;
      assignee_user_id?: number | null;
      due_date?: string | null;
      link_ref?: Record<string, unknown>;
    }) => processesService.patchTask(taskId, patch),
    onSuccess: () => invalidateProcessViews(qc),
  });
}

export function useProcessTemplates(type?: ProcessType) {
  return useQuery({
    queryKey: [TEMPLATES, type],
    queryFn: () => processesService.listTemplates(type),
  });
}

export function useProcessTemplate(id: number | null) {
  return useQuery({
    queryKey: [TEMPLATES, "detail", id],
    queryFn: () => processesService.getTemplate(id!),
    enabled: id != null,
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      type: ProcessType;
      name: string;
      employment_types?: string[] | null;
    }) => processesService.createTemplate(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TEMPLATES] });
      toast.success("Template created");
    },
  });
}

export function useDeactivateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => processesService.deactivateTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TEMPLATES] });
      toast.success("Template deactivated");
    },
  });
}

export function useAddTemplateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      templateId,
      ...payload
    }: {
      templateId: number;
      title: string;
      description?: string;
      default_assignee: AssigneeClass;
      visibility?: "all" | "staff_only";
      due_offset_days?: number | null;
      is_blocking?: boolean;
      kind?: TaskKind;
    }) => processesService.addTemplateTask(templateId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEMPLATES] }),
  });
}

export function useRemoveTemplateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, taskId }: { templateId: number; taskId: number }) =>
      processesService.removeTemplateTask(templateId, taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEMPLATES] }),
  });
}
