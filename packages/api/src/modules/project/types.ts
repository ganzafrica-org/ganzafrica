// src/modules/project/project.ts

import { z } from 'zod';
import { 
    projectStatusEnum, 
    projectMemberRoleEnum,
    mediaTypeEnum
} from '../../db/schema/enums';

// Media type
export interface Media {
    url: string;
    type: typeof mediaTypeEnum.enumValues[number];
    cover?: boolean;
}

// Project category
export interface ProjectCategory {
    id: number;
    name: string;
    description?: string | null;
    created_at: Date;
    updated_at: Date;
}

// Project type
export interface Project {
    id: number;
    name: string;
    description?: string | null;
    status: typeof projectStatusEnum.enumValues[number];
    category_id?: number | null;
    location?: string | null;
    impacted_people?: number | null;
    media?: Media | null;
    start_date: Date;
    end_date?: Date | null;
    created_by: number;
    created_at: Date;
    updated_at: Date;
    
    // Relations
    category?: ProjectCategory;
    members?: ProjectMember[];
    updates?: ProjectUpdate[];
}

// Project member
export interface ProjectMember {
    id: number;
    project_id: number;
    user_id: number;
    role: typeof projectMemberRoleEnum.enumValues[number];
    start_date: Date;
    end_date?: Date | null;
    created_at: Date;
    updated_at: Date;
    
    user?: any; 
    project?: Project;
}

// Project update
export interface ProjectUpdate {
    id: number;
    project_id: number;
    author_id: number;
    title?: string | null;
    content: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    
    // Relations
    author?: any; // User type would be defined elsewhere
    project?: Project;
}

// Zod schema for project creation
export const createProjectSchema = z.object({
    name: z.string().min(3, 'Project name must be at least 3 characters'),
    description: z.string().optional(),
    status: z.enum(projectStatusEnum.enumValues),
    category_id: z.number().optional(),
    location: z.string().optional(),
    impacted_people: z.number().optional(),
    cover_image: z.string().optional(),
    start_date: z.string().or(z.date()).transform(val => new Date(val)),
    end_date: z.string().or(z.date()).transform(val => new Date(val)).optional(),
    budget: z.number().optional(),
    team_members: z.array(z.number()).optional(),
});

// Zod schema for project category creation
export const createProjectCategorySchema = z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters'),
    description: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateProjectCategoryInput = z.infer<typeof createProjectCategorySchema>;