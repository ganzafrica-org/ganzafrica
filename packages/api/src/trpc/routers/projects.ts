import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import { db } from '../../db/client';
import { 
    projects, 
    project_categories, 
    project_members, 
    project_updates 
} from '../../db/schema';
import { eq, and, like, desc, asc, or, count } from 'drizzle-orm';
import { createLogger } from '../../config';
import type { Project, ProjectCategory, ProjectMember, ProjectUpdate } from '../../modules/project/project';
import { projectStatusEnum, projectMemberRoleEnum, baseRoleEnum } from '../../db/enums';

// Define allowed user roles from the imported enum
type UserRole = typeof baseRoleEnum.enumValues[number];

const logger = createLogger('projects-router');

// Create project schema
const createProjectSchema = z.object({
    name: z.string().min(3, 'Project name must be at least 3 characters'),
    description: z.string().optional(),
    status: z.enum(projectStatusEnum.enumValues),
    category_id: z.number().optional(),
    location: z.string().optional(),
    impacted_people: z.number().optional(),
    cover_image: z.string().optional(),
    start_date: z.date(),
    end_date: z.date().optional(),
});

// Update project schema
const updateProjectSchema = createProjectSchema.partial().extend({
    id: z.number()
});

// Project filters schema
const projectFiltersSchema = z.object({
    search: z.string().optional(),
    status: z.enum(projectStatusEnum.enumValues).optional(),
    category_id: z.number().optional(),
    location: z.string().optional(),
    created_by: z.number().optional()
});

// Add project member schema
const addProjectMemberSchema = z.object({
    project_id: z.number().refine((val) => typeof val === 'number', {
        message: 'Project ID must be a number',
    }),
    user_id: z.number(),
    role: z.enum(projectMemberRoleEnum.enumValues),
    start_date: z.date().optional().default(() => new Date()),
    end_date: z.date().optional()
});

// Create project update schema
const createProjectUpdateSchema = z.object({
    project_id: z.number(),
    title: z.string().optional(),
    content: z.record(z.any())
});

// Standardized response type
interface ProjectResponse<T = null> {
    success: boolean;
    message: string;
    data?: T;
    error?: {
        code: string;
        details?: any;
    };
}

export const projectsRouter = router({
    // Create a new project (available to all authenticated users)
    createProject: protectedProcedure
        .input(createProjectSchema)
        .mutation(async ({ input, ctx }): Promise<ProjectResponse<{ project: Project }>> => {
            try {
                const userId = Number(ctx.user.id);
                
                // Allow any authenticated user to create a project
                const [newProject] = await db.insert(projects)
                .values({
                    name: input.name,
                    description: input.description,
                    status: input.status,
                    category_id: input.category_id,
                    location: input.location,
                    impacted_people: input.impacted_people,
                    media: input.cover_image ? {
                        url: input.cover_image,
                        type: "image",
                        cover: true
                    } : undefined,
                    start_date: input.start_date,
                    end_date: input.end_date,
                    created_by: userId,
                    created_at: new Date(),
                    updated_at: new Date()
                })
                .returning();
                
                if (!newProject) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to create project'
                    });
                }
                
                // Add creator as project lead
                await db.insert(project_members)
                    .values({
                        project_id: newProject.id,
                        user_id: userId,
                        role: 'lead',
                        start_date: new Date(),
                        created_at: new Date(),
                        updated_at: new Date()
                    });
                
                return {
                    success: true,
                    message: 'Project created successfully',
                    data: {
                        project: newProject as Project
                    }
                };
            } catch (error) {
                logger.error('Create project error', { error });
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create project. Please try again later.',
                    cause: error
                });
            }
        }),
    
    // Get a project by ID (public)
    getProject: publicProcedure
        .input(z.object({
            id: z.number()
        }))
        .query(async ({ input }): Promise<ProjectResponse<{ project: Project }>> => {
            try {
                const project = await db.query.projects.findFirst({
                    where: eq(projects.id, input.id),
                    with: {
                        category: true,
                        members: {
                            with: {
                                user: true
                            }
                        },
                        updates: {
                            orderBy: desc(project_updates.created_at),
                            with: {
                                author: true
                            }
                        }
                    }
                });
                
                if (!project) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Project not found'
                    });
                }
                
                return {
                    success: true,
                    message: 'Project retrieved successfully',
                    data: {
                        project: project as Project
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                
                logger.error('Get project error', { error, id: input.id });
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to retrieve project. Please try again later.',
                    cause: error
                });
            }
        }),
    
    // Get a list of projects with filters and pagination (public)
    getProjects: publicProcedure
        .input(z.object({
            page: z.number().default(1),
            limit: z.number().default(10),
            filters: projectFiltersSchema.optional()
        }))
        .query(async ({ input }): Promise<ProjectResponse<{
            projects: Project[];
            totalProjects: number;
            totalPages: number;
            currentPage: number;
        }>> => {
            try {
                const offset = (input.page - 1) * input.limit;
                const filters = input.filters || {};
                
                // Build where conditions
                const conditions = [];
                
                // Apply filters
                if (filters.search) {
                    conditions.push(or(
                        like(projects.name, `%${filters.search}%`),
                        like(projects.description, `%${filters.search}%`),
                        like(projects.location, `%${filters.search}%`)
                    ));
                }
                
                if (filters.status) {
                    if (filters.status) {
                        conditions.push(eq(projects.status, filters.status as "planned" | "active" | "completed"));
                    }
                }
                
                if (filters.category_id) {
                    if (typeof filters.category_id === 'number') {
                        conditions.push(eq(projects.category_id, filters.category_id));
                    }
                }
                
                if (filters.location) {
                    conditions.push(like(projects.location, `%${filters.location}%`));
                }
                
                if (filters.created_by) {
                    if (typeof filters.created_by === 'number') {
                        conditions.push(eq(projects.created_by, filters.created_by));
                    }
                }
                
                // Get total count
                const totalCountResult = await db.select({ count: count() })
                    .from(projects)
                    .where(conditions.length ? and(...conditions) : undefined);
                
                const totalProjects = totalCountResult[0]?.count || 0;
                
                // Get projects with pagination
                const projectsList = await db.query.projects.findMany({
                    where: conditions.length ? and(...conditions) : undefined,
                    with: {
                        category: true
                    },
                    orderBy: desc(projects.created_at),
                    offset,
                    limit: input.limit
                });
                
                return {
                    success: true,
                    message: 'Projects retrieved successfully',
                    data: {
                        projects: projectsList as Project[],
                        totalProjects,
                        totalPages: Math.ceil(totalProjects / input.limit),
                        currentPage: input.page
                    }
                };
            } catch (error) {
                logger.error('Get projects error', { error, filters: input.filters });
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to retrieve projects. Please try again later.',
                    cause: error
                });
            }
        }),
    
    // Update a project
    updateProject: protectedProcedure
        .input(updateProjectSchema)
        .mutation(async ({ input, ctx }): Promise<ProjectResponse<{ project: Project }>> => {
            try {
                const userId = Number(ctx.user.id);
                
                // Check if project exists and user has permission to update
                const existingProject = await db.query.projects.findFirst({
                    where: eq(projects.id, input.id),
                    with: {
                        members: {
                            where: eq(project_members.user_id, userId)
                        }
                    }
                });
                
                if (!existingProject) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Project not found'
                    });
                }
                
                // Check if user has permission (lead, supervisor, or creator)
                const userMember = existingProject.members?.[0] as { role: string } | undefined;
                const isCreator = existingProject.created_by === userId;
                
                if (!userMember && !isCreator) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'You do not have permission to update this project'
                    });
                }
                
                if (userMember && !['lead', 'supervisor'].includes(userMember.role) && !isCreator) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'You do not have permission to update this project'
                    });
                }
                
                // Update the project
                const [updatedProject] = await db.update(projects)
                    .set({
                        ...(typeof input.name === 'string' && { name: input.name }),
                        ...(input.description !== undefined && { description: input.description }),
                        ...(typeof input.status === 'string' ? { status: input.status } : {}),
                        ...(input.category_id !== undefined && { category_id: input.category_id }),
                        ...(input.location !== undefined && { location: input.location }),
                        ...(input.impacted_people !== undefined && { impacted_people: input.impacted_people }),
                        ...(input.cover_image !== undefined && { 
                            media: input.cover_image ? {
                                url: input.cover_image,
                                type: "image",
                                cover: true
                            } : null 
                        }),
                        start_date: input.start_date ? input.start_date : undefined,
                        ...(input.end_date !== undefined && { end_date: input.end_date }),
                        updated_at: new Date()
                    })
                    .where(eq(projects.id, input.id))
                    .returning();
                
                if (!updatedProject) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to update project'
                    });
                }
                
                return {
                    success: true,
                    message: 'Project updated successfully',
                    data: {
                        project: updatedProject as Project
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                
                logger.error('Update project error', { error, projectId: input.id });
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update project. Please try again later.',
                    cause: error
                });
            }
        }),
    
    // Delete a project
    deleteProject: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }): Promise<ProjectResponse> => {
            try {
                const userId = Number(ctx.user.id);
                
                // Check if project exists and user has permission to delete
                const existingProject = await db.query.projects.findFirst({
                    where: eq(projects.id, input.id),
                    with: {
                        members: {
                            where: eq(project_members.user_id, userId)
                        }
                    }
                });
                
                if (!existingProject) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Project not found'
                    });
                }
                
                // Check if user has permission (lead or creator)
                const userMember = existingProject.members?.[0] as { role: string } | undefined;
                const isCreator = existingProject.created_by === userId;
                
                if ((!userMember || userMember.role !== 'lead') && !isCreator) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'You do not have permission to delete this project'
                    });
                }
                
                // Delete related records
                await db.delete(project_updates).where(eq(project_updates.project_id, input.id));
                await db.delete(project_members).where(eq(project_members.project_id, input.id));
                
                // Delete the project
                await db.delete(projects).where(eq(projects.id, input.id));
                
                return {
                    success: true,
                    message: 'Project deleted successfully'
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                
                logger.error('Delete project error', { error, projectId: input.id });
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to delete project. Please try again later.',
                    cause: error
                });
            }
        }),
    
    // Add a member to a project
    addProjectMember: protectedProcedure
        .input(addProjectMemberSchema)
        .mutation(async ({ input, ctx }): Promise<ProjectResponse<{ member: ProjectMember }>> => {
            try {
                const userId = Number(ctx.user.id);
                
                // Check if project exists and user has permission to add members
                const existingProject = await db.query.projects.findFirst({
                    where: eq(projects.id, input.project_id),
                    with: {
                        members: {
                            where: eq(project_members.user_id, userId)
                        }
                    }
                });
                
                if (!existingProject) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Project not found'
                    });
                }
                
                // Check if user has permission (lead, supervisor, or creator)
                const userMember = existingProject.members?.[0] as { role: string } | undefined;
                const isCreator = existingProject.created_by === userId;
                
                if (!userMember && !isCreator) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'You do not have permission to add members to this project'
                    });
                }
                
                if (userMember?.role && !['lead', 'supervisor'].includes(userMember.role) && !isCreator) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'You do not have permission to add members to this project'
                    });
                }
                
                // Check if user already a member
                const existingMember = await db.query.project_members.findFirst({
                    where: and(
                        eq(project_members.project_id, input.project_id),
                        eq(project_members.user_id, input.user_id)
                    )
                });
                
                if (existingMember) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'User is already a member of this project'
                    });
                }
                
                // Add the new member
                const [newMember] = await db.insert(project_members)
                    .values({
                        id: input.project_id,
                        user_id: input.user_id,
                        role: input.role as "lead" | "member" | "supervisor",
                        start_date: input.start_date || new Date(),
                        end_date: input.end_date,
                        created_at: new Date(),
                        updated_at: new Date()
                    })
                    .returning();
                
                if (!newMember) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to add project member'
                    });
                }
                
                return {
                    success: true,
                    message: 'Project member added successfully',
                    data: {
                        member: newMember as ProjectMember
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                
                logger.error('Add project member error', { error, ...input });
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to add project member. Please try again later.',
                    cause: error
                });
            }
        }),
    
    // Remove a member from a project
    removeProjectMember: protectedProcedure
        .input(z.object({
            project_id: z.number(),
            user_id: z.number()
        }))
        .mutation(async ({ input, ctx }): Promise<ProjectResponse> => {
            try {
                const userId = Number(ctx.user.id);
                
                // Check if the project exists and has the member
                const existingProject = await db.query.projects.findFirst({
                    where: eq(projects.id, input.project_id),
                    with: {
                        members: true
                    }
                });
                
                if (!existingProject) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Project not found'
                    });
                }
                
                // Get member to remove
                const memberToRemove = existingProject.members?.find(m => m.user_id === input.user_id);
                if (!memberToRemove) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Member not found in this project'
                    });
                }
                
                const currentUserMember: ProjectMember | undefined = (existingProject.members as ProjectMember[] || []).find((m: ProjectMember) => m.user_id === userId);
                const isCreator = existingProject.created_by === userId;
                const isSelf = input.user_id === userId;
                
                // Permission checks
                const canRemove = 
                    isSelf || 
                    isCreator || 
                    (currentUserMember?.role === 'lead' && memberToRemove.role !== 'lead') ||
                    (currentUserMember?.role === 'supervisor' && memberToRemove.role === 'member');
                
                if (!canRemove) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'You do not have permission to remove this member'
                    });
                }
                
                // Remove the member
                await db.delete(project_members)
                    .where(and(
                        eq(project_members.project_id, input.project_id),
                        eq(project_members.user_id, input.user_id)
                    ));
                
                return {
                    success: true,
                    message: 'Project member removed successfully'
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                
                logger.error('Remove project member error', { error, ...input });
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to remove project member. Please try again later.',
                    cause: error
                });
            }
        }),
    
    // Update a member's role in a project
    updateProjectMember: protectedProcedure
        .input(z.object({
            project_id: z.number(),
            user_id: z.number(),
            role: z.enum(projectMemberRoleEnum.enumValues)
        }))
        .mutation(async ({ input, ctx }): Promise<ProjectResponse<{ member: ProjectMember }>> => {
            try {
                const userId = Number(ctx.user.id);
                
                // Check if project exists
                const existingProject = await db.query.projects.findFirst({
                    where: eq(projects.id, input.project_id),
                    with: {
                        members: true
                    }
                });
                
                if (!existingProject) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Project not found'
                    });
                }
                
                // Get member to update
                const memberToUpdate = existingProject.members?.find(m => m.user_id === input.user_id);
                if (!memberToUpdate) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Member not found in this project'
                    });
                }
                
                // Get current user's role in the project
                const currentUserMember = existingProject.members?.find(m => m.user_id === userId);
                const isCreator = existingProject.created_by === userId;
                
                // Check if user has permission (leads can change roles)
                if (!currentUserMember && !isCreator) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'You do not have permission to update project members'
                    });
                }
                
                if (currentUserMember && currentUserMember.role !== 'lead' && !isCreator) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Only project leads can update member roles'
                    });
                }
                
                // Special case: Only project creators can make someone a lead
                if (input.role === 'lead' && !isCreator) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Only the project creator can assign lead roles'
                    });
                }
                
                // Update the member
                const [updatedMember] = await db.update(project_members)
                    .set({
                        role: input.role,
                        updated_at: new Date()
                    })
                    .where(and(
                        eq(project_members.project_id, input.project_id),
                        eq(project_members.user_id, input.user_id)
                    ))
                    .returning();
                
                if (!updatedMember) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to update project member'
                    });
                }
                
                return {
                    success: true,
                    message: 'Project member updated successfully',
                    data: {
                        member: updatedMember as ProjectMember
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                
                logger.error('Update project member error', { error, ...input });
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update project member. Please try again later.',
                    cause: error
                });
            }
        }),
    
    // Create a project update
    createProjectUpdate: protectedProcedure
        .input(createProjectUpdateSchema)
        .mutation(async ({ input, ctx }): Promise<ProjectResponse<{ update: ProjectUpdate }>> => {
            try {
                const userId = Number(ctx.user.id);
                
                // Check if project exists and user has permission
                const existingProject = await db.query.projects.findFirst({
                    where: eq(projects.id, input.project_id),
                    with: {
                        members: {
                            where: eq(project_members.user_id, userId)
                        }
                    }
                });
                
                if (!existingProject) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Project not found'
                    });
                }
                
                // Check if user has permission to create updates
                const userMember = existingProject.members?.[0] as { role: string } | undefined;
                const isCreator = existingProject.created_by === userId;
                
                if (!userMember && !isCreator) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'You do not have permission to post updates to this project'
                    });
                }
                
                // Members, supervisors, leads, and creator can post updates
                
                // Add the update
                const [newUpdate] = await db.insert(project_updates)
                    .values({
                        project_id: input.project_id,
                        author_id: userId,
                        title: input.title,
                        content: input.content,
                        created_at: new Date(),
                        updated_at: new Date()
                    })
                    .returning();
                
                if (!newUpdate) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to create project update'
                    });
                }
                
                return {
                    success: true,
                    message: 'Update posted to project successfully',
                    data: {
                        update: newUpdate as ProjectUpdate
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                
                logger.error('Create project update error', { error, ...input });
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to post update to project. Please try again later.',
                    cause: error
                });
            }
        }),
    
    // Delete a project update
    deleteProjectUpdate: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }): Promise<ProjectResponse> => {
            try {
                const userId = Number(ctx.user.id);
                
                // Get the update
                const update = await db.query.project_updates.findFirst({
                    where: eq(project_updates.id, input.id),
                    with: {
                        project: {
                            with: {
                                members: {
                                    where: eq(project_members.user_id, userId)
                                }
                            }
                        }
                    }
                });
                
                if (!update) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Update not found'
                    });
                }
                
                const project = update.project as { created_by: number; members?: { user_id: number; role: string }[] };
                
                // Check if user has permission to delete update
                const userMember = (project as { members?: { user_id: number; role: string }[] }).members?.[0];
                const isCreator = project.created_by === userId;
                const isAuthor = update.author_id === userId;
                
                if (!userMember && !isCreator && !isAuthor) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'You do not have permission to delete this update'
                    });
                }
                
                if (userMember && !['lead', 'supervisor'].includes(userMember.role) && !isCreator && !isAuthor) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'You do not have permission to delete this update'
                    });
                }
                
                // Delete the update
                await db.delete(project_updates).where(eq(project_updates.id, input.id));
                
                return {
                    success: true,
                    message: 'Project update deleted successfully'
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                
                logger.error('Delete project update error', { error, updateId: input.id });
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to delete project update. Please try again later.',
                    cause: error
                });
            }
        }),
    
    // Get project categories
    getProjectCategories: publicProcedure
        .query(async (): Promise<ProjectResponse<{ categories: ProjectCategory[] }>> => {
            try {
                const categories = await db.query.project_categories.findMany({
                    orderBy: asc(project_categories.name)
                });
                
                return {
                    success: true,
                    message: 'Project categories retrieved successfully',
                    data: {
                        categories: categories as ProjectCategory[]
                    }
                };
            } catch (error) {
                logger.error('Get project categories error', { error });
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to retrieve project categories. Please try again later.',
                    cause: error
                });
            }
        }),
    
    // Create a new project category (for fellows and employees)
    createProjectCategory: protectedProcedure
        .input(z.object({
            name: z.string().min(2, 'Category name must be at least 2 characters'),
            description: z.string().optional()
        }))
        .mutation(async ({ input, ctx }): Promise<ProjectResponse<{ category: ProjectCategory }>> => {
            try {
                // Check if user is fellow or employee
                if (!['fellow', 'employee'].includes(ctx.user.role as string)) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Only fellows and employees can create project categories'
                    });
                }
                
                // Check if category name already exists
                const existingCategory = await db.query.project_categories.findFirst({
                    where: eq(project_categories.name, input.name)
                });
                
                if (existingCategory) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'A category with this name already exists'
                    });
                }
                
                // Create the category
                const [newCategory] = await db.insert(project_categories)
                    .values({
                        name: input.name,
                        description: input.description,
                        created_at: new Date(),
                        updated_at: new Date()
                    })
                    .returning();
                
                if (!newCategory) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to create project category'
                    });
                }
                
                return {
                    success: true,
                    message: 'Project category created successfully',
                    data: {
                        category: newCategory as ProjectCategory
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                
                logger.error('Create project category error', { error, ...input });
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create project category. Please try again later.',
                    cause: error
                });
            }
        }),
    
    // Update a project category (for fellows and employees)
    updateProjectCategory: protectedProcedure
        .input(z.object({
            id: z.number(),
            name: z.string().min(2, 'Category name must be at least 2 characters').optional(),
            description: z.string().optional()
        }))
        .mutation(async ({ input, ctx }): Promise<ProjectResponse<{ category: ProjectCategory }>> => {
            try {
                // Check if user is fellow or employee
                if (!['fellow', 'employee'].includes(ctx.user.role as string)) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Only fellows and employees can update project categories'
                    });
                }
                
                // Check if category exists
                const existingCategory = await db.query.project_categories.findFirst({
                    where: eq(project_categories.id, input.id)
                });
                
                if (!existingCategory) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Category not found'
                    });
                }
                
                // If name is changing, check for duplicates
                if (input.name && input.name !== existingCategory.name) {
                    const duplicateName = await db.query.project_categories.findFirst({
                        where: and(
                            eq(project_categories.name, input.name),
                            eq(project_categories.id, input.id, true)
                        )
                    });
                    
                    if (duplicateName) {
                        throw new TRPCError({
                            code: 'CONFLICT',
                            message: 'A category with this name already exists'
                        });
                    }
                }
                
                // Update the category
                const [updatedCategory] = await db.update(project_categories)
                    .set({
                        ...(input.name && { name: input.name }),
                        ...(input.description !== undefined && { description: input.description }),
                        updated_at: new Date()
                    })
                    .where(eq(project_categories.id, input.id))
                    .returning();
                
                if (!updatedCategory) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to update project category'
                    });
                }
                
                return {
                    success: true,
                    message: 'Project category updated successfully',
                    data: {
                        category: updatedCategory as ProjectCategory
                    }
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                
                logger.error('Update project category error', { error, ...input });
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update project category. Please try again later.',
                    cause: error
                });
            }
        }),
    
    // Delete a project category (for fellows and employees)
    deleteProjectCategory: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }): Promise<ProjectResponse> => {
            try {
                // Check if user is fellow or employee
                if (!['fellow', 'employee'].includes(ctx.user.role as string)) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Only fellows and employees can delete project categories'
                    });
                }
                
                // Check if category exists
                const existingCategory = await db.query.project_categories.findFirst({
                    where: eq(project_categories.id, input.id)
                });
                
                if (!existingCategory) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Category not found'
                    });
                }
                
                // Check if any projects are using this category
                const projectsCount = await db.select({ count: count() })
                    .from(projects)
                    .where(eq(projects.category_id, input.id))
                    .then(result => result[0]?.count || 0);
                
                if (projectsCount > 0) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: `This category is used by ${projectsCount} projects and cannot be deleted`
                    });
                }
                
                // Delete the category
                await db.delete(project_categories).where(eq(project_categories.id, input.id));
                
                return {
                    success: true,
                    message: 'Project category deleted successfully'
                };
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                
                logger.error('Delete project category error', { error, categoryId: input.id });
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to delete project category. Please try again later.',
                    cause: error
                });
            }
        }),
    
    // Get user's projects
    getUserProjects: protectedProcedure
        .input(z.object({
            user_id: z.number().optional(),
            page: z.number().default(1),
            limit: z.number().default(10),
            status: z.enum(projectStatusEnum.enumValues).optional()
        }))
        .query(async ({ input, ctx }): Promise<ProjectResponse<{
            projects: Project[];
            totalProjects: number;
            totalPages: number;
            currentPage: number;
        }>> => {
            try {
                const userId = input.user_id || Number(ctx.user.id);
                const offset = (input.page - 1) * input.limit;
                
                // Build conditions
                const conditions = [
                    eq(project_members.user_id, userId)
                ];
                
                if (input.status) {
                    conditions.push(eq(projects.status, input.status));
                }
                
                // Query projects where user is a member
                const projectsWithMembership = await db.query.project_members.findMany({
                    where: and(...conditions),
                    with: {
                        project: {
                            with: {
                                category: true
                            }
                        }
                    },
                    orderBy: desc(project_members.created_at),
                    offset,
                    limit: input.limit
                });
                
                // Extract projects from the results
                const userProjects = projectsWithMembership.map(pm => pm.project).filter(Boolean) as Project[];
                
                // Get total count for pagination
                const totalCountResult = await db.select({ count: count() })
                    .from(project_members)
                    .where(and(...conditions));
                
                const totalProjects = totalCountResult[0]?.count || 0;
                
                return {
                    success: true,
                    message: 'User projects retrieved successfully',
                    data: {
                        projects: userProjects,
                        totalProjects,
                        totalPages: Math.ceil(totalProjects / input.limit),
                        currentPage: input.page
                    }
                };
            } catch (error) {
                logger.error('Get user projects error', { error, userId: input.user_id || ctx.user.id });
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to retrieve user projects. Please try again later.',
                    cause: error
                });
            }
        })
});