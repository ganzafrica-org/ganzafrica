// modules/project/project.ts

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