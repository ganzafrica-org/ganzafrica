export type Status = "overdue" | "todo" | "inprogress" | "review" | "done" | "backlog"; // "backlog" is legacy, will be migrated to "overdue"
export type Priority = "high" | "medium" | "low";

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  color: string; // tailwind color class e.g. bg-purple-500
  initials: string;
}

export interface AttachmentItem {
  id: string;
  filename: string;
  url?: string; // URL to the file
  sizeKB: number;
  uploadedAt: string; // ISO string
}

export interface CommentItem {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string; // Activities to do
  deliverables?: string; // Expected deliverables
  teamId?: string; // Team this task belongs to (for management)
  team?: { id: string; name: string; color: string; memberIds: string[] }; // Selected team info
  projectId?: number; // Project this task belongs to (for project tasks)
  status: Status;
  priority: Priority;
  dueDate?: string; // ISO
  createdAt?: string; // ISO - when the task was created
  updatedAt?: string; // ISO - when the task was last updated
  labels: { id: string; name: string; color: string }[];
  assignees: string[]; // user ids
  comments: CommentItem[];
  attachments: AttachmentItem[];
  // Creator information for permissions
  created_by?: number; // ID of user who created the task
  creator_role_id?: number;
  creator_role_name?: string;
}

/**
 * Check if a task is overdue (past due date and not completed)
 */
export const isTaskOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.status === 'done') {
    return false;
  }
  
  const dueDate = new Date(task.dueDate);
  const now = new Date();
  
  return dueDate < now;
};

/**
 * Update task status to overdue if it's past due date and not completed
 */
export const updateTaskStatusIfOverdue = (task: Task): Task => {
  if (isTaskOverdue(task)) {
    return { ...task, status: 'overdue' };
  }
  return task;
};


