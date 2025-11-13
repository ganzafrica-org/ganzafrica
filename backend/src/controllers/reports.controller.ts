import { Request, Response } from "express";
import { db } from "../db/client";
import { 
  report_files, 
  project_deliverables, 
  report_analytics,
  report_templates,
  report_categories,
  task_teams,
  task_team_projects,
  tasks,
  users
} from "../db/schema";
import { eq, and, gte, lte, desc, asc, sql, inArray } from "drizzle-orm";
import upload from "../middlewares/upload";
import { getFileSubdirectory, getFileUrl } from "../middlewares/upload";
import { Logger } from "../config";

const logger = new Logger("ReportsController");

// Get reports with filtering by date range, team, and project
export const getReports = async (req: Request, res: Response) => {
  try {
    const { 
      dateRange, 
      teamId, 
      projectId, 
      fileType, 
      page = 1, 
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Build where conditions
    const whereConditions = [];
    
    if (teamId) {
      whereConditions.push(eq(report_files.team_id, Number(teamId)));
    }
    
    if (projectId) {
      whereConditions.push(eq(report_files.project_id, Number(projectId)));
    }
    
    if (fileType) {
      whereConditions.push(eq(report_files.file_type, String(fileType)));
    }

    // Handle date range filtering
    if (dateRange) {
      const { start, end } = JSON.parse(String(dateRange));
      if (start) {
        whereConditions.push(gte(report_files.created_at, new Date(start)));
      }
      if (end) {
        whereConditions.push(lte(report_files.created_at, new Date(end)));
      }
    }

    // Get files with related data
    const files = await db
      .select({
        id: report_files.id,
        filename: report_files.filename,
        original_filename: report_files.original_filename,
        file_type: report_files.file_type,
        file_size: report_files.file_size,
        file_url: report_files.file_url,
        mime_type: report_files.mime_type,
        uploaded_by: report_files.uploaded_by,
        created_at: report_files.created_at,
        team: {
          id: task_teams.id,
          name: task_teams.name,
          color: task_teams.color,
        },
        project: {
          id: task_team_projects.id,
          name: task_team_projects.name,
          status: task_team_projects.status,
        },
        uploader: {
          id: users.id,
          name: users.name,
          email: users.email,
        }
      })
      .from(report_files)
      .leftJoin(task_teams, eq(report_files.team_id, task_teams.id))
      .leftJoin(task_team_projects, eq(report_files.project_id, task_team_projects.id))
      .leftJoin(users, eq(report_files.uploaded_by, users.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(
        sortOrder === 'asc' ? asc(report_files.created_at) : 
        desc(report_files.created_at)
      )
      .limit(Number(limit))
      .offset(offset);

    // Get total count
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(report_files)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    res.json({
      success: true,
      data: {
        files,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount[0].count,
          pages: Math.ceil(totalCount[0].count / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
};

// Get teams with their projects and file counts
export const getTeamsWithProjects = async (req: Request, res: Response) => {
  try {
    const { dateRange } = req.query;

    const whereConditions = [];
    
    // Handle date range filtering
    if (dateRange) {
      const { start, end } = JSON.parse(String(dateRange));
      if (start) {
        whereConditions.push(gte(report_files.created_at, new Date(start)));
      }
      if (end) {
        whereConditions.push(lte(report_files.created_at, new Date(end)));
      }
    }

    // Get teams with project and file counts
    const teams = await db
      .select({
        id: task_teams.id,
        name: task_teams.name,
        description: task_teams.description,
        color: task_teams.color,
        status: task_teams.status,
        created_at: task_teams.created_at,
        project_count: sql<number>`count(distinct ${task_team_projects.id})`,
        file_count: sql<number>`count(distinct ${report_files.id})`,
        total_file_size: sql<number>`coalesce(sum(${report_files.file_size}), 0)`
      })
      .from(task_teams)
      .leftJoin(task_team_projects, eq(task_teams.id, task_team_projects.team_id))
      .leftJoin(report_files, and(
        eq(report_files.team_id, task_teams.id),
        whereConditions.length > 0 ? and(...whereConditions) : undefined
      ))
      .groupBy(task_teams.id, task_teams.name, task_teams.description, task_teams.color, task_teams.status, task_teams.created_at)
      .orderBy(desc(task_teams.created_at));

    res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    logger.error('Error fetching teams with projects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teams with projects' });
  }
};

// Get projects for a specific team
export const getTeamProjects = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { dateRange } = req.query;

    const whereConditions = [eq(task_team_projects.team_id, Number(teamId))];
    
    // Handle date range filtering for files
    if (dateRange) {
      const { start, end } = JSON.parse(String(dateRange));
      if (start) {
        whereConditions.push(gte(report_files.created_at, new Date(start)));
      }
      if (end) {
        whereConditions.push(lte(report_files.created_at, new Date(end)));
      }
    }

    // Get projects with file counts from report_files
    const projects = await db
      .select({
        id: task_team_projects.id,
        name: task_team_projects.name,
        description: task_team_projects.description,
        status: task_team_projects.status,
        start_date: task_team_projects.start_date,
        end_date: task_team_projects.end_date,
        color: task_team_projects.color,
        created_at: task_team_projects.created_at,
        file_count: sql<number>`count(distinct ${report_files.id})`,
        total_file_size: sql<number>`coalesce(sum(${report_files.file_size}), 0)`,
        deliverable_count: sql<number>`count(distinct ${project_deliverables.id})`
      })
      .from(task_team_projects)
      .leftJoin(report_files, and(
        eq(report_files.project_id, task_team_projects.id),
        whereConditions.length > 1 ? and(...whereConditions.slice(1)) : undefined
      ))
      .leftJoin(project_deliverables, eq(project_deliverables.project_id, task_team_projects.id))
      .where(eq(task_team_projects.team_id, Number(teamId)))
      .groupBy(
        task_team_projects.id, 
        task_team_projects.name, 
        task_team_projects.description,
        task_team_projects.status,
        task_team_projects.start_date,
        task_team_projects.end_date,
        task_team_projects.color,
        task_team_projects.created_at
      )
      .orderBy(desc(task_team_projects.created_at));

    // Get task attachment counts for each project
    const projectIds = projects.map(p => p.id);
    
    const taskAttachmentCounts = await db
      .select({
        project_id: tasks.project_id,
        attachment_count: sql<number>`sum(jsonb_array_length(${tasks.attachments}))`
      })
      .from(tasks)
      .where(
        and(
          inArray(tasks.project_id, projectIds),
          sql`${tasks.attachments} IS NOT NULL AND jsonb_array_length(${tasks.attachments}) > 0`
        )
      )
      .groupBy(tasks.project_id);

    // Combine file counts from report_files and task attachments
    const projectsWithTotalFiles = projects.map(project => {
      const taskAttachments = taskAttachmentCounts.find(t => t.project_id === project.id);
      const taskAttachmentCount = taskAttachments ? taskAttachments.attachment_count : 0;
      
      return {
        ...project,
        file_count: project.file_count + taskAttachmentCount
      };
    });

    res.json({
      success: true,
      data: projectsWithTotalFiles
    });
  } catch (error) {
    logger.error('Error fetching team projects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch team projects' });
  }
};

// Get files for a specific project
export const getProjectFiles = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { dateRange, fileType, page = 1, limit = 20 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const whereConditions = [eq(report_files.project_id, Number(projectId))];
    
    if (fileType) {
      whereConditions.push(eq(report_files.file_type, String(fileType)));
    }

    // Handle date range filtering
    if (dateRange) {
      const { start, end } = JSON.parse(String(dateRange));
      if (start) {
        whereConditions.push(gte(report_files.created_at, new Date(start)));
      }
      if (end) {
        whereConditions.push(lte(report_files.created_at, new Date(end)));
      }
    }

    // Get files from report_files table
    const reportFiles = await db
      .select({
        id: report_files.id,
        filename: report_files.filename,
        original_filename: report_files.original_filename,
        file_type: report_files.file_type,
        file_size: report_files.file_size,
        file_url: report_files.file_url,
        created_at: report_files.created_at,
        metadata: report_files.metadata,
        uploader: {
          id: users.id,
          name: users.name,
          email: users.email,
        }
      })
      .from(report_files)
      .leftJoin(users, eq(report_files.uploaded_by, users.id))
      .where(and(...whereConditions))
      .orderBy(desc(report_files.created_at));


    // Get files from task attachments
    const taskFiles = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        attachments: tasks.attachments,
        created_at: tasks.created_at,
        uploader: {
          id: users.id,
          name: users.name,
          email: users.email,
        }
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.created_by, users.id))
      .where(eq(tasks.project_id, Number(projectId)));


    // Process task attachments into individual files
    const allTaskFiles = [];
    for (const task of taskFiles) {
      if (task.attachments && Array.isArray(task.attachments)) {
        for (const attachment of task.attachments) {
          allTaskFiles.push({
            id: `task-${task.id}-${attachment.id}`,
            filename: attachment.filename,
            original_filename: attachment.filename,
            file_type: 'unknown', // Task attachments don't store file type
            file_size: 0, // Task attachments don't store file size
            file_url: attachment.url,
            created_at: task.created_at,
            metadata: {
              description: `Attachment from task: ${task.title}`,
              tags: ['task-attachment'],
              task_id: task.id,
              task_title: task.title
            },
            uploader: task.uploader
          });
        }
      }
    }


    // Combine and sort all files
    const allFiles = [...reportFiles, ...allTaskFiles]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());


    // Apply pagination
    const paginatedFiles = allFiles.slice(offset, offset + Number(limit));

    res.json({
      success: true,
      data: {
        files: paginatedFiles,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: allFiles.length,
          pages: Math.ceil(allFiles.length / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching project files:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch project files' });
  }
};

// Upload file to a project
export const uploadProjectFile = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { teamId, taskId, categoryId, description, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Get file details - multer-s3 provides different properties
    const file = req.file as any; // multer-s3 extends the standard multer file object
    const { key, originalname, size, mimetype, location } = file;
    
    // Get subdirectory based on file type
    const subdir = getFileSubdirectory(mimetype);
    
    // Extract filename from the key (removes the uploads/subdir/ prefix)
    const filename = key.split('/').pop();
    
    // Get the public URL (uses CDN if configured, otherwise direct Spaces URL)
    const fileUrl = getFileUrl(location);

    // Create file record
    const fileRecord = await db.insert(report_files).values({
      team_id: teamId ? Number(teamId) : undefined,
      project_id: Number(projectId),
      task_id: taskId ? Number(taskId) : undefined,
      filename: filename,
      original_filename: originalname,
      file_type: mimetype.split('/')[1] || 'unknown',
      file_size: Number(size),
      file_path: key, // S3 key acts as the path
      file_url: fileUrl, // Use the S3 URL
      mime_type: mimetype,
      uploaded_by: Number(userId),
      category_id: categoryId ? Number(categoryId) : undefined,
      metadata: {
        description,
        tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
        original_filename: originalname,
        checksum: filename, // You might want to calculate actual checksum
        category: subdir
      }
    }).returning();

    res.json({
      success: true,
      data: fileRecord[0],
      message: 'File uploaded successfully'
    });
  } catch (error) {
    logger.error('Error uploading file:', error);
    res.status(500).json({ success: false, message: 'Failed to upload file' });
  }
};

// Mark file as final deliverable
export const markAsDeliverable = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const { projectId, title, description, version = "1.0" } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Get file details
    const file = await db
      .select()
      .from(report_files)
      .where(eq(report_files.id, Number(fileId)))
      .limit(1);

    if (!file.length) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Create deliverable record
    const deliverable = await db.insert(project_deliverables).values({
      project_id: Number(projectId),
      title: title || file[0].original_filename,
      description,
      file_type: file[0].file_type,
      file_size: Number(file[0].file_size),
      file_path: file[0].file_path,
      file_url: file[0].file_url,
      version,
      is_final: true,
      uploaded_by: Number(userId),
      metadata: file[0].metadata
    }).returning();

    res.json({
      success: true,
      data: deliverable[0],
      message: 'File marked as final deliverable'
    });
  } catch (error) {
    logger.error('Error marking as deliverable:', error);
    res.status(500).json({ success: false, message: 'Failed to mark as deliverable' });
  }
};

// Get project deliverables
export const getProjectDeliverables = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const deliverables = await db
      .select({
        id: project_deliverables.id,
        title: project_deliverables.title,
        description: project_deliverables.description,
        file_type: project_deliverables.file_type,
        file_size: project_deliverables.file_size,
        file_url: project_deliverables.file_url,
        version: project_deliverables.version,
        is_final: project_deliverables.is_final,
        created_at: project_deliverables.created_at,
        uploader: {
          id: users.id,
          name: users.name,
          email: users.email,
        }
      })
      .from(project_deliverables)
      .leftJoin(users, eq(project_deliverables.uploaded_by, users.id))
      .where(eq(project_deliverables.project_id, Number(projectId)))
      .orderBy(desc(project_deliverables.created_at));

    res.json({
      success: true,
      data: deliverables
    });
  } catch (error) {
    logger.error('Error fetching deliverables:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch deliverables' });
  }
};

// Download file
export const downloadFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    const file = await db
      .select()
      .from(report_files)
      .where(eq(report_files.id, Number(fileId)))
      .limit(1);

    if (!file.length) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const filePath = file[0].file_path;
    
    // For S3 files, we don't need to check if file exists on disk
    // The file URL should be used directly
    res.redirect(file[0].file_url || filePath);
  } catch (error) {
    logger.error('Error downloading file:', error);
    res.status(500).json({ success: false, message: 'Failed to download file' });
  }
};

// Get report analytics
export const getReportAnalytics = async (req: Request, res: Response) => {
  try {
    const { dateRange, teamId, projectId } = req.query;

    const whereConditions = [];
    
    if (teamId) {
      whereConditions.push(eq(report_files.team_id, Number(teamId)));
    }
    
    if (projectId) {
      whereConditions.push(eq(report_files.project_id, Number(projectId)));
    }

    // Handle date range filtering
    if (dateRange) {
      const { start, end } = JSON.parse(String(dateRange));
      if (start) {
        whereConditions.push(gte(report_files.created_at, new Date(start)));
      }
      if (end) {
        whereConditions.push(lte(report_files.created_at, new Date(end)));
      }
    }

    // Get analytics data
    const analytics = await db
      .select({
        total_files: sql<number>`count(*)`,
        total_size: sql<number>`sum(${report_files.file_size})`,
        file_types: sql<string>`array_agg(distinct ${report_files.file_type})`,
        uploads_by_month: sql<string>`to_char(${report_files.created_at}, 'YYYY-MM')`,
        uploads_count: sql<number>`count(*)`
      })
      .from(report_files)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(sql`to_char(${report_files.created_at}, 'YYYY-MM')`);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};

export { upload };
