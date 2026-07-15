import { db, withDbTransaction } from "../db/client";
import {
  projects,
  project_members,
  project_partners,
  partners,
  teams,
  project_documents,
} from "../db/schema";
import { eq, and, inArray, like, desc, asc, sql } from "drizzle-orm";
import { AppError } from "../middlewares";
import { Logger } from "../config";

const logger = new Logger("ProjectService");

// Project types for service input/output
export type CreateProjectInput = {
  name: string;
  description?: string;
  status: string;
  start_date: Date;
  end_date?: Date;
  category_id: number;
  partner_id?: number;
  members?: ProjectMemberInput[];
  partners?: ProjectPartnerInput[];
  documents?: ProjectDocumentInput[];
  location?: string;

  goals?: {
    items: Array<{
      id: string;
      title: string;
      description: string;
      completed?: boolean;
      order?: number;
    }>;
  };

  outcomes?: {
    items: Array<{
      id: string;
      title: string;
      description: string;
      status?: string;
      order?: number;
    }>;
  };

  media?: {
    items: Array<{
      id: string;
      type: "image" | "video";
      url: string;
      cover: boolean;
      tag?: "feature" | "description" | "others";
      title?: string;
      description?: string;
      size?: number;
      duration?: number;
      thumbnailUrl?: string;
      order?: number;
    }>;
  };

  other_information?: {
    [key: string]: any;
  };
  is_published?: boolean;
};

export type UpdateProjectInput = {
  name?: string;
  description?: string;
  status?: string;
  start_date?: Date;
  end_date?: Date;
  category_id?: number;
  partner_id?: number;
  location?: string;

  goals?: {
    items: Array<{
      id: string;
      title: string;
      description: string;
      completed?: boolean;
      order?: number;
    }>;
  };

  outcomes?: {
    items: Array<{
      id: string;
      title: string;
      description: string;
      status?: string;
      order?: number;
    }>;
  };

  media?: {
    items: Array<{
      id: string;
      type: "image" | "video";
      url: string;
      cover: boolean;
      tag?: "feature" | "description" | "others";
      title?: string;
      description?: string;
      size?: number;
      duration?: number;
      thumbnailUrl?: string;
      order?: number;
    }>;
  };

  other_information?: {
    [key: string]: any;
  };
  is_published?: boolean;
};

export type ProjectOutput = {
  id: number;
  name: string;
  description: string | null;
  status: string;
  start_date: Date;
  end_date: Date | null;
  category_id: number;
  partner_id: number | null;
  created_at: Date;
  updated_at: Date;
  location?: string | null;
  is_published?: boolean;

  goals?: {
    items: Array<{
      id: string;
      title: string;
      description: string;
      completed?: boolean;
      order?: number;
    }>;
  };

  outcomes?: {
    items: Array<{
      id: string;
      title: string;
      description: string;
      status?: string;
      order?: number;
    }>;
  };

  media?: {
    items: Array<{
      id: string;
      type: "image" | "video";
      url: string;
      cover: boolean;
      tag?: "feature" | "description" | "others";
      title?: string;
      description?: string;
      size?: number;
      duration?: number;
      thumbnailUrl?: string;
      order?: number;
    }>;
  };

  other_information?: {
    [key: string]: any;
  };

  members?: ProjectMemberOutput[];
  documents?: ProjectDocumentOutput[];
  partners?: ProjectPartnerOutput[];
};

export type ProjectMemberInput = {
  team_id: number;
  role: string;
  start_date: Date;
  end_date?: Date;
};

export type ProjectMemberOutput = {
  id: number;
  project_id: number;
  team_id: number;
  role: string;
  start_date: Date;
  end_date?: Date | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  team?: {
    id: number;
    name: string;
    position?: string | null;
    photo_url?: string | null;
    bio?: string | null;
    email?: string | null;
  };
};

export type ProjectDocumentInput = {
  name: string;
  file_url: string;
  file_size?: number;
};

export type ProjectDocumentOutput = {
  id: number;
  project_id: number;
  name: string;
  file_url: string;
  file_size?: number | null;
  created_at: Date;
  updated_at: Date;
};

export type ProjectPartnerInput = {
  partner_id: number;
};

export type ProjectPartnerOutput = {
  id: number;
  project_id: number;
  partner_id: number;
  created_at: Date;
  updated_at: Date;
  partner?: {
    id: number;
    name: string;
    logo?: string | null;
    website_url?: string | null;
    location?: string | null;
  };
};

type ProjectSearchParams = {
  page: number;
  limit: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  status?: string;
  team_id?: number;
  category_id?: number;
  partner_id?: number;
  is_published?: boolean;
};

// Define types for database results
type MembershipResultItem = {
  membership: {
    id: number;
    project_id: number;
    team_id: number;
    role: string;
    start_date: Date;
    end_date: Date | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  };
  team: {
    id: number;
    name: string;
    position: string | null;
    photo_url: string | null;
    bio: string | null;
    email: string | null;
  } | null;
};

type PartnershipResultItem = {
  partnership: {
    id: number;
    project_id: number;
    partner_id: number;
    created_at: Date;
    updated_at: Date;
  };
  partner: {
    id: number;
    name: string;
    logo: string | null;
    website_url: string | null;
    location: string | null;
  } | null;
};

interface TeamDetails {
  id: number;
  name: string;
  position?: string | null;
  photo_url?: string | null;
  bio?: string | null;
  email?: string | null;
}

interface ProjectMemberDetails {
  id: number;
  project_id: number;
  team_id: number;
  role: string;
  start_date: Date;
  end_date?: Date | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  team?: TeamDetails;
}

interface PartnerDetails {
  id: number;
  name: string;
  logo?: string | null;
  website_url?: string | null;
  location?: string | null;
}

interface ProjectPartnerDetails {
  id: number;
  project_id: number;
  partner_id: number;
  created_at: Date;
  updated_at: Date;
  partner?: PartnerDetails;
}

interface ProjectDocumentDetails {
  id: number;
  project_id: number;
  name: string;
  file_url: string;
  file_size?: number | null;
  created_at: Date;
  updated_at: Date;
}

// In projectService.ts, modify the createProject function:

export async function createProject(projectData: CreateProjectInput): Promise<ProjectOutput> {
  try {
    return await withDbTransaction(async (txDb) => {
      // Validate dates before inserting
      if (
        projectData.start_date &&
        (isNaN(projectData.start_date.getTime()) || !(projectData.start_date instanceof Date))
      ) {
        throw new AppError(
          "Invalid start date: The date provided is not valid. Please use YYYY-MM-DD format.",
          400,
        );
      }

      // Check if a project with the same name already exists
      const existingProject = await txDb
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.name, projectData.name))
        .limit(1);

      if (existingProject.length > 0) {
        throw new AppError(`Project with name "${projectData.name}" already exists`, 409);
      }

      // Insert the project and get the auto-generated ID
      // Status defaults to 'active' when creating a project
      // end_date is not set during creation - it will be set automatically when status changes to 'completed'
      const insertResult = await txDb
        .insert(projects)
        .values({
          name: projectData.name,
          description: projectData.description || null,
          status: (projectData.status || "active") as
            | "planned"
            | "active"
            | "completed"
            | "cancelled"
            | "on_hold",
          start_date: projectData.start_date || new Date(), // Default to current date if not provided
          end_date: null, // Not set during creation
          category_id: projectData.category_id,
          partner_id: projectData.partner_id || null,
          location: projectData.location || null,

          goals: projectData.goals || null,
          outcomes: projectData.outcomes || null,
          media: projectData.media || null,
          other_information: projectData.other_information || null,
          is_published: projectData.is_published ?? false,

          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning(); // Return the full record, not just the ID

      if (!insertResult.length) {
        throw new AppError("Failed to create project", 500);
      }

      const projectId = insertResult[0].id;
      const createdProject = insertResult[0];

      // Add project team members if provided
      if (projectData.members && projectData.members.length > 0) {
        for (let i = 0; i < projectData.members.length; i++) {
          const member = projectData.members[i];

          // Validate member dates
          if (
            !member.start_date ||
            isNaN(member.start_date.getTime()) ||
            !(member.start_date instanceof Date)
          ) {
            throw new AppError(
              `Invalid member start date: The start date for team member ${i + 1} is not valid. Please use YYYY-MM-DD format.`,
              400,
            );
          }

          if (
            member.end_date &&
            (isNaN(member.end_date.getTime()) || !(member.end_date instanceof Date))
          ) {
            throw new AppError(
              `Invalid member end date: The end date for team member ${i + 1} is not valid. Please use YYYY-MM-DD format.`,
              400,
            );
          }

          await txDb.insert(project_members).values({
            project_id: projectId,
            team_id: member.team_id,
            role: member.role,
            start_date: member.start_date,
            end_date: member.end_date || null,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }

      // Add project partners if provided
      if (projectData.partners && projectData.partners.length > 0) {
        for (const partner of projectData.partners) {
          await txDb.insert(project_partners).values({
            project_id: projectId,
            partner_id: partner.partner_id,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }

      // Add project documents if provided
      if (projectData.documents && projectData.documents.length > 0) {
        for (const document of projectData.documents) {
          await txDb.insert(project_documents).values({
            project_id: projectId,
            name: document.name,
            file_url: document.file_url,
            file_size: document.file_size || null,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }

      // Fetch team members within the transaction
      const membersResult = await txDb
        .select({
          membership: project_members,
          team: teams,
        })
        .from(project_members)
        .leftJoin(teams, eq(project_members.team_id, teams.id))
        .where(eq(project_members.project_id, projectId));

      const projectMembers: ProjectMemberDetails[] = membersResult.map(
        (item: MembershipResultItem): ProjectMemberDetails => ({
          id: item.membership.id,
          project_id: item.membership.project_id,
          team_id: item.membership.team_id,
          role: item.membership.role,
          start_date: item.membership.start_date,
          end_date: item.membership.end_date,
          is_active: item.membership.is_active,
          created_at: item.membership.created_at,
          updated_at: item.membership.updated_at,
          team: item.team
            ? {
                id: item.team.id,
                name: item.team.name,
                position: item.team.position,
                photo_url: item.team.photo_url,
                bio: item.team.bio,
                email: item.team.email,
              }
            : undefined,
        }),
      );

      // Fetch partners within the transaction
      const partnersResult = await txDb
        .select({
          partnership: project_partners,
          partner: partners,
        })
        .from(project_partners)
        .leftJoin(partners, eq(project_partners.partner_id, partners.id))
        .where(eq(project_partners.project_id, projectId));

      const projectPartners: ProjectPartnerDetails[] = partnersResult.map(
        (item: PartnershipResultItem): ProjectPartnerDetails => ({
          id: item.partnership.id,
          project_id: item.partnership.project_id,
          partner_id: item.partnership.partner_id,
          created_at: item.partnership.created_at,
          updated_at: item.partnership.updated_at,
          partner: item.partner
            ? {
                id: item.partner.id,
                name: item.partner.name,
                logo: item.partner.logo,
                website_url: item.partner.website_url,
                location: item.partner.location,
              }
            : undefined,
        }),
      );

      // Fetch documents within the transaction
      const documents = await txDb
        .select()
        .from(project_documents)
        .where(eq(project_documents.project_id, projectId));

      const projectDocuments: ProjectDocumentDetails[] = documents.map(
        (doc: {
          id: number;
          project_id: number;
          name: string;
          file_url: string;
          file_size?: number | null;
          created_at: Date;
          updated_at: Date;
        }): ProjectDocumentDetails => ({
          id: doc.id,
          project_id: doc.project_id,
          name: doc.name,
          file_url: doc.file_url,
          file_size: doc.file_size,
          created_at: doc.created_at,
          updated_at: doc.updated_at,
        }),
      );

      // Return the complete project with its relationships
      return {
        ...mapToProjectOutput(createdProject),
        members: projectMembers,
        partners: projectPartners,
        documents: projectDocuments,
      };
    });
  } catch (error) {
    logger.error("Error creating project", error);
    if (error instanceof AppError) {
      throw error;
    }

    // Check for date-related errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes("invalid time value") || errorMessage.includes("rangeerror")) {
        throw new AppError(
          "Invalid date: One or more dates provided are invalid. Please ensure all dates are in YYYY-MM-DD format and are valid dates.",
          400,
        );
      }
    }

    throw new AppError(
      "Failed to create project. Please check that all required fields are provided and dates are in the correct format (YYYY-MM-DD).",
      500,
    );
  }
}

// Get project by ID
export async function getProjectById(id: number): Promise<ProjectOutput> {
  try {
    // First, update any overdue projects
    await updateOverdueProjects();

    // Add a log statement to track project retrieval attempts
    logger.info(`Attempting to retrieve project with ID: ${id}`);

    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);

    if (!result.length) {
      logger.info(`Project with ID: ${id} not found in database`);
      throw new AppError("Project not found", 404);
    }

    logger.info(`Successfully retrieved project with ID: ${id}`);

    // Get project team members with their details
    const membersResult = await db
      .select({
        membership: project_members,
        team: {
          id: teams.id,
          name: teams.name,
          position: teams.position,
          photo_url: teams.photo_url,
          bio: teams.bio,
          email: teams.email,
        },
      })
      .from(project_members)
      .leftJoin(teams, eq(project_members.team_id, teams.id))
      .where(eq(project_members.project_id, id));

    const projectMembers = membersResult.map((item: { membership: any; team: any }) => ({
      id: item.membership.id,
      project_id: item.membership.project_id,
      team_id: item.membership.team_id,
      role: item.membership.role,
      start_date: item.membership.start_date,
      end_date: item.membership.end_date,
      is_active: item.membership.is_active,
      created_at: item.membership.created_at,
      updated_at: item.membership.updated_at,
      team: item.team
        ? {
            id: item.team.id,
            name: item.team.name,
            position: item.team.position,
            photo_url: item.team.photo_url,
            bio: item.team.bio,
            email: item.team.email,
          }
        : undefined,
    }));

    // Get project partners with their details
    const partnersResult = await db
      .select({
        partnership: project_partners,
        partner: partners,
      })
      .from(project_partners)
      .leftJoin(partners, eq(project_partners.partner_id, partners.id))
      .where(eq(project_partners.project_id, id));

    const projectPartners = partnersResult.map((item: { partnership: any; partner: any }) => ({
      id: item.partnership.id,
      project_id: item.partnership.project_id,
      partner_id: item.partnership.partner_id,
      created_at: item.partnership.created_at,
      updated_at: item.partnership.updated_at,
      partner: item.partner
        ? {
            id: item.partner.id,
            name: item.partner.name,
            logo: item.partner.logo,
            website_url: item.partner.website_url,
            location: item.partner.location,
          }
        : undefined,
    }));

    // Get project documents
    const documents = await db
      .select()
      .from(project_documents)
      .where(eq(project_documents.project_id, id));

    const projectDocuments = documents.map((doc: any) => ({
      id: doc.id,
      project_id: doc.project_id,
      name: doc.name,
      file_url: doc.file_url,
      file_size: doc.file_size,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    }));

    return {
      ...mapToProjectOutput(result[0]),
      members: projectMembers,
      partners: projectPartners,
      documents: projectDocuments,
    };
  } catch (error) {
    logger.error(`Error getting project by ID: ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to get project", 500);
  }
}

// Update project
export async function updateProject(
  id: number,
  projectData: UpdateProjectInput,
): Promise<ProjectOutput> {
  try {
    // Check if project exists
    const existingProject = await db.select().from(projects).where(eq(projects.id, id)).limit(1);

    if (!existingProject.length) {
      throw new AppError("Project not found", 404);
    }

    // Check if name is being updated and if it conflicts with an existing project
    if (projectData.name && projectData.name !== existingProject[0].name) {
      const nameExists = await db
        .select({ id: projects.id })
        .from(projects)
        .where(and(eq(projects.name, projectData.name), sql`${projects.id} != ${id}`))
        .limit(1);

      if (nameExists.length > 0) {
        throw new AppError(`Project with name "${projectData.name}" already exists`, 409);
      }
    }

    // Prepare update data
    const updateData: any = {
      ...projectData,
      updated_at: new Date(),
    };

    // If status is being changed to 'completed', automatically set end_date to current date
    if (projectData.status === "completed" && existingProject[0].status !== "completed") {
      // Only set end_date if it's not already set
      if (!existingProject[0].end_date) {
        updateData.end_date = new Date();
      }
    }

    // Update project
    await db
      .update(projects)
      .set({
        ...updateData,
        status: projectData.status as
          | "planned"
          | "active"
          | "completed"
          | "cancelled"
          | "on_hold"
          | undefined,
      })
      .where(eq(projects.id, id));

    // Get updated project with all related data
    return getProjectById(id);
  } catch (error) {
    logger.error(`Error updating project: ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to update project", 500);
  }
}

// Direct SQL-based project deletion function
export async function deleteProject(id: number): Promise<boolean> {
  try {
    logger.info(`Starting direct SQL deletion process for project ID: ${id}`);

    // First check if project exists
    const existingProject = await db.select().from(projects).where(eq(projects.id, id)).limit(1);

    if (!existingProject.length) {
      logger.warn(`Project with ID: ${id} not found for deletion`);
      throw new AppError("Project not found", 404);
    }

    logger.info(`Project with ID: ${id} found, proceeding with direct SQL deletion`);

    // Additional checks for potentially unidentified foreign key relationships
    // Log the structure of the project record to help identify other relationships
    logger.info(`Project record structure:`, JSON.stringify(existingProject[0]));

    // First, let's check for any other tables that might reference this project
    // These are queries we can use to manually find references in common tables
    // Add queries for any other tables you suspect might have relationships

    // We need to use raw SQL for more complex operations
    try {
      // APPROACH 1: Force delete using CASCADE in a single transaction
      // Note: This is a more aggressive approach but ensures deletion

      // Start transaction
      await db.execute(sql`BEGIN`);

      // Try using more aggressive deletion approach
      try {
        // Explicitly delete from all known related tables first
        await db.execute(sql`DELETE FROM project_members WHERE project_id = ${id}`);
        logger.info(`Deleted project members for project ID: ${id}`);

        await db.execute(sql`DELETE FROM project_partners WHERE project_id = ${id}`);
        logger.info(`Deleted project partners for project ID: ${id}`);

        await db.execute(sql`DELETE FROM project_documents WHERE project_id = ${id}`);
        logger.info(`Deleted project documents for project ID: ${id}`);

        // Additional tables that might reference projects - add as needed
        // Example: await db.execute(sql`DELETE FROM project_tasks WHERE project_id = ${id}`);

        // Now delete the project with an explicit transaction and force flag if database supports it
        // PostgreSQL
        await db.execute(sql`DELETE FROM projects WHERE id = ${id}`);
        logger.info(`Deleted project record with ID: ${id}`);

        // Commit transaction
        await db.execute(sql`COMMIT`);
        logger.info(`Transaction committed for project deletion ID: ${id}`);
      } catch (txError: any) {
        // Rollback on error
        await db.execute(sql`ROLLBACK`);
        logger.error(`Transaction rolled back due to error: ${txError.message}`, txError);
        throw txError;
      }

      // Verify project was deleted
      const checkResult = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.id, id));

      if (checkResult.length > 0) {
        logger.error(`Project with ID: ${id} still exists after forced deletion`);

        // APPROACH 2: If still fails, try database-specific force delete
        // For PostgreSQL, try disabling triggers temporarily
        try {
          await db.execute(sql`BEGIN`);

          // Temporarily disable triggers (requires superuser privileges)
          // This is a last resort and should be used with caution
          await db.execute(sql`SET session_replication_role = 'replica'`);

          // Delete project
          await db.execute(sql`DELETE FROM projects WHERE id = ${id}`);

          // Re-enable triggers
          await db.execute(sql`SET session_replication_role = 'origin'`);

          await db.execute(sql`COMMIT`);
          logger.info(`Completed alternate deletion approach for project ID: ${id}`);

          // Final verification
          const finalCheck = await db
            .select({ id: projects.id })
            .from(projects)
            .where(eq(projects.id, id));

          if (finalCheck.length > 0) {
            throw new AppError("Failed to delete project after multiple approaches", 500);
          }
        } catch (altError: any) {
          await db.execute(sql`ROLLBACK`);
          logger.error(`Alternative deletion approach failed: ${altError.message}`, altError);
          throw new AppError(
            `Failed to delete project after multiple attempts: ${altError.message}`,
            500,
          );
        }
      }

      logger.info(`Project with ID: ${id} successfully deleted and verified`);
      return true;
    } catch (sqlError: any) {
      logger.error(`SQL Error while deleting project: ${id}`, sqlError);
      throw new AppError(
        `Failed to delete project - SQL error: ${sqlError.message || "Unknown SQL error"}`,
        500,
      );
    }
  } catch (error: any) {
    logger.error(`Error deleting project: ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(`Failed to delete project: ${error.message || "Unknown error"}`, 500);
  }
}
// List projects with pagination and filtering
export async function listProjects(
  params: ProjectSearchParams,
): Promise<{ projects: ProjectOutput[]; total: number }> {
  try {
    // First, update any overdue projects
    await updateOverdueProjects();

    const {
      page = 1,
      limit = 10,
      search,
      sort_by = "created_at",
      sort_order = "desc",
      status,
      team_id,
      category_id,
      partner_id,
      is_published,
    } = params;
    const offset = (page - 1) * limit;

    // Build query conditions
    const whereConditions = [];

    if (search) {
      whereConditions.push(
        sql`(${projects.name} ILIKE ${`%${search}%`} OR ${projects.description} ILIKE ${`%${search}%`})`,
      );
    }

    if (status) {
      if (["planned", "active", "completed", "cancelled", "on_hold"].includes(status)) {
        whereConditions.push(
          eq(
            projects.status,
            status as "planned" | "active" | "completed" | "cancelled" | "on_hold",
          ),
        );
      }
    }

    if (category_id) {
      whereConditions.push(eq(projects.category_id, category_id));
    }

    // Filter by published status if specified
    if (is_published !== undefined) {
      whereConditions.push(eq(projects.is_published, is_published));
    }

    // Combine base conditions
    let whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Handle team member filtering
    if (team_id) {
      const teamProjects = await db
        .select({ project_id: project_members.project_id })
        .from(project_members)
        .where(eq(project_members.team_id, team_id));

      const projectIds = teamProjects.map((p) => p.project_id);

      if (projectIds.length === 0) {
        // No projects found for this team member
        return { projects: [], total: 0 };
      }

      // Add team member project IDs to where clause
      const teamCondition = inArray(projects.id, projectIds);
      whereClause = whereClause ? and(whereClause, teamCondition) : teamCondition;
    }

    // Handle partner filtering
    if (partner_id) {
      // Get projects with this partner as direct partner_id
      const directPartnerProjects = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.partner_id, partner_id));

      // Get projects with this partner in the project_partners table
      const linkedPartnerProjects = await db
        .select({ project_id: project_partners.project_id })
        .from(project_partners)
        .where(eq(project_partners.partner_id, partner_id));

      // Combine both lists
      const partnerProjectIds = [
        ...directPartnerProjects.map((p) => p.id),
        ...linkedPartnerProjects.map((p) => p.project_id),
      ];

      if (partnerProjectIds.length === 0) {
        // No projects found with this partner
        return { projects: [], total: 0 };
      }

      // Add partner project IDs to where clause
      const partnerCondition = inArray(projects.id, partnerProjectIds);
      whereClause = whereClause ? and(whereClause, partnerCondition) : partnerCondition;
    }

    // Get total count for pagination
    const [totalResult] = whereClause
      ? await db
          .select({ count: sql<number>`count(*)::int` })
          .from(projects)
          .where(whereClause)
      : await db.select({ count: sql<number>`count(*)::int` }).from(projects);

    const total = totalResult?.count || 0;

    // Sort order
    const sortDirection = sort_order === "asc" ? asc : desc;
    let orderBy;

    // Determine sort column
    switch (sort_by) {
      case "name":
        orderBy = sortDirection(projects.name);
        break;
      case "status":
        orderBy = sortDirection(projects.status);
        break;
      case "start_date":
        orderBy = sortDirection(projects.start_date);
        break;
      case "created_at":
      default:
        orderBy = sortDirection(projects.created_at);
    }

    // Get paginated results - explicitly select columns to avoid schema mismatches
    const result = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        start_date: projects.start_date,
        end_date: projects.end_date,
        category_id: projects.category_id,
        partner_id: projects.partner_id,
        location: projects.location,
        goals: projects.goals,
        outcomes: projects.outcomes,
        media: projects.media,
        other_information: projects.other_information,
        is_published: projects.is_published,
        created_at: projects.created_at,
        updated_at: projects.updated_at,
      })
      .from(projects)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Fetch detailed project information for each result
    const projectList = await Promise.all(result.map((project) => getProjectById(project.id)));

    return {
      projects: projectList,
      total,
    };
  } catch (error) {
    logger.error("Error listing projects", error);
    if (error instanceof AppError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new AppError(`Failed to list projects: ${errorMessage}`, 500);
  }
}

// Helper function to map database project to ProjectOutput type
function mapToProjectOutput(project: any): ProjectOutput {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    start_date: project.start_date,
    end_date: project.end_date,
    category_id: project.category_id,
    partner_id: project.partner_id,
    location: project.location,

    goals: project.goals,
    outcomes: project.outcomes,
    media: project.media,
    other_information: project.other_information,
    is_published: project.is_published ?? false,

    created_at: project.created_at,
    updated_at: project.updated_at,
  };
}

// Publish project
export async function publishProject(id: number): Promise<ProjectOutput> {
  try {
    // Check if project exists
    const existingProject = await db.select().from(projects).where(eq(projects.id, id)).limit(1);

    if (!existingProject.length) {
      throw new AppError("Project not found", 404);
    }

    // Update the is_published status
    await db
      .update(projects)
      .set({
        is_published: true,
        updated_at: new Date(),
      })
      .where(eq(projects.id, id));

    // Return the updated project
    return getProjectById(id);
  } catch (error) {
    logger.error(`Error publishing project: ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to publish project", 500);
  }
}

/**
 * Check if a project is overdue (past end date and not completed)
 */
export const isProjectOverdue = (project: any): boolean => {
  if (!project.end_date || project.status === "completed") {
    return false;
  }

  const endDate = new Date(project.end_date);
  const now = new Date();

  return endDate < now;
};

/**
 * Automatically update project status to overdue if past end date
 */
export const updateOverdueProjects = async (): Promise<void> => {
  try {
    const now = new Date();

    // Find projects that are past end date and not completed
    const overdueProjects = await db
      .select()
      .from(projects)
      .where(and(sql`${projects.end_date} < ${now}`, sql`${projects.status} != 'completed'`));

    // Update their status to overdue
    for (const project of overdueProjects) {
      await db
        .update(projects)
        .set({
          status: "overdue" as any,
          updated_at: new Date(),
        })
        .where(eq(projects.id, project.id));
    }

    logger.info(`Updated ${overdueProjects.length} projects to overdue status`);
  } catch (error) {
    logger.error("Error updating overdue projects", error);
  }
};

// Export all service functions in an object
export const projectService = {
  createProject,
  getProjectById,
  updateProject,
  publishProject,
  deleteProject,
  listProjects,
  isProjectOverdue,
  updateOverdueProjects,
};

export default projectService;
