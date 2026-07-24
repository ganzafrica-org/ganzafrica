import apiClient from "../api-client";

// Types
export interface Task {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  deliverables?: string;
  status: "backlog" | "todo" | "inprogress" | "review" | "done";
  priority: "low" | "medium" | "high";
  due_date?: string;
  labels?: Array<{ id: string; name: string; color: string }>;
  attachments?: Array<{ id: string; filename: string; url: string }>;
  assignees?:
    | number[]
    | Array<{
        id: number;
        user_id: number;
        assigned_at: string;
        user: {
          id: number;
          name: string;
          email: string;
          avatar_url?: string;
        };
      }>;
  comments?: Array<{
    id: number;
    content: string;
    user_id: number;
    created_at: string;
    user: {
      id: number;
      name: string;
      avatar_url?: string;
    };
  }>;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  project_id: number;
  title: string;
  description?: string;
  deliverables?: string;
  status?: "backlog" | "todo" | "inprogress" | "review" | "done";
  priority?: "low" | "medium" | "high";
  due_date?: string;
  labels?: Array<{ id: string; name: string; color: string }>;
  attachments?: Array<{ id: string; filename: string; url: string }>;
  assignees?: number[];
  created_by: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  deliverables?: string;
  status?: "backlog" | "todo" | "inprogress" | "review" | "done";
  priority?: "low" | "medium" | "high";
  due_date?: string;
  labels?: Array<{ id: string; name: string; color: string }>;
  attachments?: Array<{ id: string; filename: string; url: string }>;
  assignees?: number[];
}

// Tasks API
export const tasksApi = {
  // Create task
  async createTask(data: CreateTaskInput) {
    const response = await apiClient.post("/tasks", data);
    return response.data;
  },

  // Get task by ID
  async getTaskById(id: number) {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  },

  // Get tasks assigned to current user
  async getTasksByUser() {
    const response = await apiClient.get("/tasks/user/assigned");
    return response.data;
  },

  // List tasks for a project
  async listTasksByProject(projectId: number) {
    const response = await apiClient.get(`/tasks/project/${projectId}`);
    return response.data;
  },

  // Update task
  async updateTask(id: number, data: UpdateTaskInput) {
    const response = await apiClient.put(`/tasks/${id}`, data);
    return response.data;
  },

  // Delete task
  async deleteTask(id: number) {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  },

  // Add comment to task
  async addComment(taskId: number, content: string) {
    const response = await apiClient.post(`/tasks/${taskId}/comments`, { content });
    return response.data;
  },

  // Upload attachments to task
  async uploadAttachments(taskId: number, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await apiClient.post(`/tasks/${taskId}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
