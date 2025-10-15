export type Status = "backlog" | "todo" | "inprogress" | "review" | "done";
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
  projectId?: number; // Project this task belongs to (for project tasks)
  status: Status;
  priority: Priority;
  dueDate?: string; // ISO
  labels: { id: string; name: string; color: string }[];
  assignees: string[]; // user ids
  comments: CommentItem[];
  attachments: AttachmentItem[];
}


