// Add member to project
export async function addProjectMember(projectId: string | bigint, memberData: ProjectMemberInput): Promise<ProjectMemberOutput> {
    try {
        const pId = typeof projectId === 'string' ? BigInt(projectId) : projectId;

        // Check if project exists
        const existingProject = await db.select().from(projects)
            .where(eq(projects.id, pId))
            .limit(1);

        if (!existingProject.length) {
            throw new AppError('Project not found', 404);
        }

        // Check if member is already in the project
        const existingMember = await db.select().from(project_members)
            .where(
                and(
                    eq(project_members.project_id, pId),
                    eq(project_members.user_id, BigInt(memberData.user_id))
                )
            )
            .limit(1);

        if (existingMember.length > 0) {
            throw new AppError('User is already a member of this project', 409);
        }

        // Add member to project
        const memberId = newId();
        await db.insert(project_members).values({
            id: memberId,
            project_id: pId,
            user_id: BigInt(memberData.user_id),
            role: memberData.role,
            start_date: memberData.start_date,
            end_date: memberData.end_date || null
        });

        // Get the added member
        const addedMember = await db.select().from(project_members)
            .where(eq(project_members.id, memberId))
            .limit(1);

        if (!addedMember.length) {
            throw new AppError('Failed to add project member', 500);
        }

        return mapToProjectMemberOutput(addedMember[0]);
    } catch (error) {
        logger.error(`Error adding member to project: ${projectId}`, error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Failed to add project member', 500);
    }
}

// Remove member from project
export async function removeProjectMember(projectId: string | bigint, userId: string | bigint): Promise<boolean> {
    try {
        const pId = typeof projectId === 'string' ? BigInt(projectId) : projectId;
        const uId = typeof userId === 'string' ? BigInt(userId) : userId;

        // Check if the member exists in the project
        const existingMember = await db.select().from(project_members)
            .where(
                and(
                    eq(project_members.project_id, pId),
                    eq(project_members.user_id, uId)
                )
            )
            .limit(1);

        if (!existingMember.length) {
            throw new AppError('Member not found in this project', 404);
        }

        // Remove member from project
        await db.delete(project_members)
            .where(
                and(
                    eq(project_members.project_id, pId),
                    eq(project_members.user_id, uId)
                )
            );

        return true;
    } catch (error) {
        logger.error(`Error removing member from project: ${projectId}`, error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Failed to remove project member', 500);
    }
}

// Bulk import projects
export async function importProjects(projectsData: CreateProjectInput[]): Promise<{ successful: number, failed: number, errors: { name: string, reason: string }[] }> {
    try {
        const result = {
            successful: 0,
            failed: 0,
            errors: [] as { name: string; reason: string }[]
        };

        await withDbTransaction(async (txDb) => {
            // Process each project
            for (const projectData of projectsData) {
                try {
                    // Generate project ID
                    const projectId = newId();

                    // Convert string IDs to bigint
                    const createdById = BigInt(projectData.created_by);

                    // Insert the project
                    await txDb.insert(projects).values({
                        id: projectId,
                        name: projectData.name,
                        description: projectData.description || null,
                        status: projectData.status,
                        start_date: projectData.start_date,
                        end_date: projectData.end_date || null,
                        created_by: createdById,
                        created_at: new Date(),
                        updated_at: new Date()
                    });

                    // Add project members if provided
                    if (projectData.members && projectData.members.length > 0) {
                        for (const member of projectData.members) {
                            await txDb.insert(project_members).values({
                                id: newId(),
                                project_id: projectId,
                                user_id: BigInt(member.user_id),
                                role: member.role,
                                start_date: member.start_date,
                                end_date: member.end_date || null
                            });
                        }
                    }

                    // Always add creator as a member with 'lead' role if not already added
                    const creatorAlreadyAdded = projectData.members?.some(
                        member => member.user_id === projectData.created_by
                    );

                    if (!creatorAlreadyAdded) {
                        await txDb.insert(project_members).values({
                            id: newId(),
                            project_id: projectId,
                            user_id: createdById,
                            role: 'lead',
                            start_date: new Date()
                        });
                    }

                    result.successful++;
                } catch (error) {
                    logger.error(`Error importing project: ${projectData.name}`, error);
                    result.failed++;
                    result.errors.push({
                        name: projectData.name,
                        reason: error instanceof AppError ? error.message : 'Unknown error'
                    });
                }
            }
        });

        return result;
    } catch (error) {
        logger.error('Error importing projects', error);
        throw new AppError('Failed to import projects', 500);
    }
}

// Helper function to map database project to ProjectOutput type
function mapToProjectOutput(project: any): ProjectOutput {
    return {
        id: project.id.toString(),
        name: project.name,
        description: project.description,
        status: project.status,
        start_date: project.start_date,
        end_date: project.end_date,
        created_by: project.created_by.toString(),
        created_at: project.created_at,
        updated_at: project.updated_at
    };
}

// Helper function to map database project member to ProjectMemberOutput type
function mapToProjectMemberOutput(member: any): ProjectMemberOutput {
    return {
        id: member.id.toString(),
        project_id: member.project_id.toString(),
        user_id: member.user_id.toString(),
        role: member.role,
        start_date: member.start_date,
        end_date: member.end_date
    };
}// Delete project
export async function deleteProject(id: string | bigint): Promise<boolean> {
    try {
        const projectId = typeof id === 'string' ? BigInt(id) : id;

        // Check if project exists
        const existingProject = await db.select().from(projects)
            .where(eq(projects.id, projectId))
            .limit(1);

        if (!existingProject.length) {
            throw new AppError('Project not found', 404);
        }

        return await withDbTransaction(async (txDb) => {
            // Delete project members first (foreign key constraint)
            await txDb.delete(project_members)
                .where(eq(project_members.project_id, projectId));

            // Delete project updates (foreign key constraint)
            await txDb.delete(project_updates)
                .where(eq(project_updates.project_id, projectId));

            // Delete the project
            await txDb.delete(projects)
                .where(eq(projects.id, projectId));

            return true;
        });
    } catch (error) {
        logger.error(`Error deleting project: ${id}`, error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Failed to delete project', 500);
    }
}

// List projects with pagination and filtering
export async function listProjects(params: ProjectSearchParams): Promise<{ projects: ProjectOutput[], total: number }> {
    try {
        const { page = 1, limit = 10, search, sort_by = 'created_at', sort_order = 'desc', status, created_by, member_id } = params;
        const offset = (page - 1) * limit;

        // Build query conditions
        const whereConditions = [];

        if (search) {
            whereConditions.push(
                sql`(${projects.name} ILIKE ${`%${search}%`} OR ${projects.description} ILIKE ${`%${search}%`})`
            );
        }

        if (status) {
            whereConditions.push(eq(projects.status, status));
        }

        if (created_by) {
            whereConditions.push(eq(projects.created_by, BigInt(created_by)));
        }

        // Combine base conditions
        let whereClause = whereConditions.length > 0
            ? and(...whereConditions)
            : undefined;

        // Handle member filtering separately if needed
        let projectIds: bigint[] | null = null;
        if (member_id) {
            const memberProjects = await db.select({ project_id: project_members.project_id })
                .from(project_members)
                .where(eq(project_members.user_id, BigInt(member_id)));

            projectIds = memberProjects.map(p => p.project_id);

            if (projectIds.length === 0) {
                // No projects found for this member
                return { projects: [], total: 0 };
            }

            // Add member project IDs to where clause
            const memberCondition = inArray(projects.id, projectIds);
            whereClause = whereClause ? and(whereClause, memberCondition) : memberCondition;
        }

        // Get total count for pagination
        const totalResult = await db.select({ count: sql<number>`COUNT(*)` })
            .from(projects)
            .where(whereClause);

        const total = totalResult[0]?.count || 0;

        // Sort order
        const sortDirection = sort_order === 'asc' ? asc : desc;
        let orderBy;

        // Determine sort column
        switch (sort_by) {
            case 'name':
                orderBy = sortDirection(projects.name);
                break;
            case 'status':
                orderBy = sortDirection(projects.status);
                break;
            case 'start_date':
                orderBy = sortDirection(projects.start_date);
                break;
            case 'created_at':
            default:
                orderBy = sortDirection(projects.created_at);
        }

        // Get paginated results
        const result = await db.select().from(projects)
            .where(whereClause)
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);

        // Get all project members for these projects
        const projectMemberMap = new Map<string, ProjectMemberOutput[]>();
        if (result.length > 0) {
            const projectIdsToFetch = result.map(p => p.id);
            const allMembers = await db.select().from(project_members)
                .where(inArray(project_members.project_id, projectIdsToFetch));

            // Group members by project_id
            for (const member of allMembers) {
                const projectIdStr = member.project_id.toString();
                if (!projectMemberMap.has(projectIdStr)) {
                    projectMemberMap.set(projectIdStr, []);
                }
                projectMemberMap.get(projectIdStr)!.push(mapToProjectMemberOutput(member));
            }
        }

        // Map results and include members
        const projectList = result.map(project => {
            const projectId = project.id.toString();
            return {
                ...mapToProjectOutput(project),
                members: projectMemberMap.get(projectId) || []
            };
        });

        return {
            projects: projectList,
            total
        };
    } catch (error) {
        logger.error('Error listing projects', error);
        throw new AppError('Failed to list projects', 500);
    }
}import { db, newId, withDbTransaction } from '../db/client';
import { projects, project_members, project_updates } from '../db/schema';
import { eq, and, inArray, like, desc, asc, sql } from 'drizzle-orm';
import { AppError } from '../middlewares';
import { Logger } from '../config';

const logger = new Logger('ProjectService');

// Project types for service input/output
export type CreateProjectInput = {
    name: string;
    description?: string;
    status: string;
    start_date: Date;
    end_date?: Date;
    created_by: string;
    members?: ProjectMemberInput[];
};

export type UpdateProjectInput = {
    name?: string;
    description?: string;
    status?: string;
    start_date?: Date;
    end_date?: Date;
};

export type ProjectOutput = {
    id: string;
    name: string;
    description: string | null;
    status: string;
    start_date: Date;
    end_date: Date | null;
    created_by: string;
    created_at: Date;
    updated_at: Date;
    members?: ProjectMemberOutput[];
};

export type ProjectMemberInput = {
    user_id: string;
    role: string;
    start_date: Date;
    end_date?: Date;
};

export type ProjectMemberOutput = {
    id: string;
    project_id: string;
    user_id: string;
    role: string;
    start_date: Date;
    end_date?: Date | null;
};

type ProjectSearchParams = {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    status?: string;
    created_by?: string;
    member_id?: string;
};

// Create a new project
export async function createProject(projectData: CreateProjectInput): Promise<ProjectOutput> {
    try {
        return await withDbTransaction(async (txDb) => {
            // Generate project ID
            const projectId = newId();

            // Convert string IDs to bigint
            const createdById = BigInt(projectData.created_by);

            // Insert the project
            await txDb.insert(projects).values({
                id: projectId,
                name: projectData.name,
                description: projectData.description || null,
                status: projectData.status,
                start_date: projectData.start_date,
                end_date: projectData.end_date || null,
                created_by: createdById,
                created_at: new Date(),
                updated_at: new Date()
            });

            // Add project members if provided
            if (projectData.members && projectData.members.length > 0) {
                for (const member of projectData.members) {
                    await txDb.insert(project_members).values({
                        id: newId(),
                        project_id: projectId,
                        user_id: BigInt(member.user_id),
                        role: member.role,
                        start_date: member.start_date,
                        end_date: member.end_date || null
                    });
                }
            }

            // Always add creator as a member with 'lead' role if not already added
            const creatorAlreadyAdded = projectData.members?.some(
                member => member.user_id === projectData.created_by
            );

            if (!creatorAlreadyAdded) {
                await txDb.insert(project_members).values({
                    id: newId(),
                    project_id: projectId,
                    user_id: createdById,
                    role: 'lead',
                    start_date: new Date()
                });
            }

            // Get the created project
            const createdProject = await txDb.select().from(projects)
                .where(eq(projects.id, projectId))
                .limit(1);

            if (!createdProject.length) {
                throw new AppError('Failed to create project', 500);
            }

            // Get project members
            const members = await txDb.select().from(project_members)
                .where(eq(project_members.project_id, projectId));

            return {
                ...mapToProjectOutput(createdProject[0]),
                members: members.map(mapToProjectMemberOutput)
            };
        });
    } catch (error) {
        logger.error('Error creating project', error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Failed to create project', 500);
    }
}

// Get project by ID
export async function getProjectById(id: string | bigint): Promise<ProjectOutput> {
    try {
        const projectId = typeof id === 'string' ? BigInt(id) : id;

        const result = await db.select().from(projects)
            .where(eq(projects.id, projectId))
            .limit(1);

        if (!result.length) {
            throw new AppError('Project not found', 404);
        }

        // Get project members
        const members = await db.select().from(project_members)
            .where(eq(project_members.project_id, projectId));

        return {
            ...mapToProjectOutput(result[0]),
            members: members.map(mapToProjectMemberOutput)
        };
    } catch (error) {
        logger.error(`Error getting project by ID: ${id}`, error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Failed to get project', 500);
    }
}

// Update project
export async function updateProject(id: string | bigint, projectData: UpdateProjectInput): Promise<ProjectOutput> {
    try {
        const projectId = typeof id === 'string' ? BigInt(id) : id;

        // Check if project exists
        const existingProject = await db.select().from(projects)
            .where(eq(projects.id, projectId))
            .limit(1);

        if (!existingProject.length) {
            throw new AppError('Project not found', 404);
        }

        // Update project
        await db.update(projects)
            .set({
                ...projectData,
                updated_at: new Date()
            })
            .where(eq(projects.id, projectId));

        // Get updated project
        const updatedProject = await db.select().from(projects)
            .where(eq(projects.id, projectId))
            .limit(1);

        // Get project members
        const members = await db.select().from(project_members)
            .where(eq(project_members.project_id, projectId));

        return {
            ...mapToProjectOutput(updatedProject[0]),
            members: members.map(mapToProjectMemberOutput)
        };
    } catch (error) {
        logger.error(`Error updating project: ${id}`, error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Failed to update project', 500);
    }
}