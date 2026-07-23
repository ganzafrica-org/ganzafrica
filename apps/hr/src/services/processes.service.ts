import { httpClient } from "@/services/http.service";

export type ProcessType = "onboarding" | "offboarding";
export type AssigneeClass = "hr" | "it" | "manager" | "finance" | "employee";
export type TaskKind =
  | "checklist"
  | "contract_signing"
  | "document_upload"
  | "asset_assignment"
  | "leave_setup";

export interface ProcessTask {
  id: number;
  instance_id: number;
  title: string;
  description: string | null;
  sort_order: number;
  assignee_user_id: number | null;
  visibility: "all" | "staff_only";
  is_blocking: boolean;
  kind: TaskKind;
  status: "pending" | "done" | "skipped";
  due_date: string | null;
  completed_at: string | null;
  completed_by: number | null;
  notes: string | null;
  link_ref: Record<string, unknown> | null;
}

export interface ProcessInstance {
  id: number;
  template_id: number | null;
  type: ProcessType;
  employee_id: string;
  status: "in_progress" | "completed" | "cancelled";
  started_at: string;
  due_date: string | null;
  completed_at: string | null;
}

export interface Progress {
  done: number;
  total: number;
  percent: number;
}

/** Server-filtered by viewer: staff_only rows are absent unless you manage or own them. */
export interface ProcessView {
  instance: ProcessInstance | null;
  tasks: ProcessTask[];
  progress: Progress | null;
  can_manage: boolean;
}

export interface ProcessListRow extends ProcessInstance {
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    job_title: string | null;
    employment_type: string;
  };
  progress: Progress;
  overdue_count: number;
}

export interface ProcessTemplate {
  id: number;
  type: ProcessType;
  name: string;
  employment_types: string[] | null;
  is_active: boolean;
}

export interface TemplateTask {
  id: number;
  template_id: number;
  title: string;
  description: string | null;
  sort_order: number;
  default_assignee: AssigneeClass;
  visibility: "all" | "staff_only";
  due_offset_days: number | null;
  is_blocking: boolean;
  kind: TaskKind;
}

export const processesService = {
  async list(params: { type?: ProcessType; status?: string; employee_id?: string } = {}) {
    const { data } = await httpClient.get<{ processes: ProcessListRow[] }>("/hr/processes", {
      params,
    });
    return data.processes;
  },

  async get(id: number) {
    const { data } = await httpClient.get<ProcessView>(`/hr/processes/${id}`);
    return data;
  },

  async getMine(type: ProcessType = "onboarding") {
    const { data } = await httpClient.get<ProcessView>("/hr/me/process", { params: { type } });
    return data;
  },

  async myTasks() {
    const { data } = await httpClient.get<{ tasks: ProcessTask[] }>("/hr/me/tasks");
    return data.tasks;
  },

  async start(employeeId: string, payload: { type: ProcessType; template_id?: number }) {
    const { data } = await httpClient.post<{ process: ProcessInstance }>(
      `/hr/employees/${employeeId}/processes`,
      payload,
    );
    return data.process;
  },

  async cancel(id: number) {
    const { data } = await httpClient.post<{ process: ProcessInstance }>(
      `/hr/processes/${id}/cancel`,
    );
    return data.process;
  },

  async completeTask(taskId: number, notes?: string) {
    const { data } = await httpClient.post<{ task: ProcessTask }>(
      `/hr/process-tasks/${taskId}/complete`,
      { notes },
    );
    return data.task;
  },

  async skipTask(taskId: number, notes: string) {
    const { data } = await httpClient.post<{ task: ProcessTask }>(
      `/hr/process-tasks/${taskId}/skip`,
      { notes },
    );
    return data.task;
  },

  async patchTask(
    taskId: number,
    patch: {
      assignee_user_id?: number | null;
      due_date?: string | null;
      link_ref?: Record<string, unknown>;
    },
  ) {
    const { data } = await httpClient.patch<{ task: ProcessTask }>(
      `/hr/process-tasks/${taskId}`,
      patch,
    );
    return data.task;
  },

  async listTemplates(type?: ProcessType) {
    const { data } = await httpClient.get<{ templates: ProcessTemplate[] }>(
      "/hr/process-templates",
      { params: type ? { type } : undefined },
    );
    return data.templates;
  },

  async getTemplate(id: number) {
    const { data } = await httpClient.get<ProcessTemplate & { tasks: TemplateTask[] }>(
      `/hr/process-templates/${id}`,
    );
    return data;
  },

  async createTemplate(payload: {
    type: ProcessType;
    name: string;
    employment_types?: string[] | null;
  }) {
    const { data } = await httpClient.post<{ template: ProcessTemplate }>(
      "/hr/process-templates",
      payload,
    );
    return data.template;
  },

  async updateTemplate(
    id: number,
    patch: { name?: string; employment_types?: string[] | null; is_active?: boolean },
  ) {
    const { data } = await httpClient.patch<{ template: ProcessTemplate }>(
      `/hr/process-templates/${id}`,
      patch,
    );
    return data.template;
  },

  /** Deactivates rather than deleting — instances keep referencing the template. */
  async deactivateTemplate(id: number) {
    const { data } = await httpClient.delete<{ template: ProcessTemplate }>(
      `/hr/process-templates/${id}`,
    );
    return data.template;
  },

  async addTemplateTask(
    templateId: number,
    payload: {
      title: string;
      description?: string;
      default_assignee: AssigneeClass;
      visibility?: "all" | "staff_only";
      due_offset_days?: number | null;
      is_blocking?: boolean;
      kind?: TaskKind;
    },
  ) {
    const { data } = await httpClient.post<{ task: TemplateTask }>(
      `/hr/process-templates/${templateId}/tasks`,
      payload,
    );
    return data.task;
  },

  async removeTemplateTask(templateId: number, taskId: number) {
    await httpClient.delete(`/hr/process-templates/${templateId}/tasks/${taskId}`);
  },
};
