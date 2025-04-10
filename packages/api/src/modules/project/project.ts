// modules/project/project.ts
import { z } from 'zod';

export type ProjectStatus = 'planned' | 'active' | 'completed';

export type ProjectMemberRole = 'lead' | 'member' | 'supervisor';

// In your project.ts interface file
export interface ProjectMedia {
  url: string;
  type: 'image' | 'video';
  cover: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectCategory {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  category_id?: number;
  location?: string;
  impacted_people?: number;
  media?: ProjectMedia;
  start_date: Date;
  end_date?: Date;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  members?: ProjectMember[];
  category?: ProjectCategory;
  updates?: ProjectUpdate[];
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: ProjectMemberRole;
  is_team_lead?: boolean;
  start_date: Date;
  end_date?: Date;
  created_at: Date;
  updated_at: Date;
  user?: User;
  project?: Project;
}

export interface ProjectUpdate {
  id: number;
  project_id: number;
  author_id: number;
  title?: string;
  content: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  author?: User;
  project?: Project;
}

// Add Zod schemas for validation
export const createProjectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(['planned', 'active', 'completed']),
  category_id: z.number().optional(),
  location: z.string().optional(),
  impacted_people: z.number().optional(),
  cover_image: z.string().optional(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().optional(),
  team_members: z.array(z.number()).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters").optional(),
  description: z.string().optional(),
  status: z.enum(['planned', 'active', 'completed']).optional(),
  category_id: z.number().optional(),
  location: z.string().optional(),
  impacted_people: z.number().optional(),
  cover_image: z.string().optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
});

export const createProjectCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateProjectCategoryInput = z.infer<typeof createProjectCategorySchema>;