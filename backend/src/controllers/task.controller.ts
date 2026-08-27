import { Request, Response } from "express";
import { taskService } from "../services/task.service";
import * as userService from "../services/user.service";
import { AppError } from "../middlewares";
import { constants, Logger } from "../config";
import { getFileSubdirectory } from "../middlewares/upload";
import { getPresignedDownload } from "../services/storage.service";

const logger = new Logger("TaskController");

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         project_id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         deliverables:
 *           type: string
 *         status:
 *           type: string
 *           enum: [backlog, todo, inprogress, review, done]
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *         due_date:
 *           type: string
 *           format: date-time
 *         labels:
 *           type: array
 *         attachments:
 *           type: array
 *         assignees:
 *           type: array
 *         created_by:
 *           type: integer
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 */

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - created_by
 *             properties:
 *               project_id:
 *                 type: integer
 *                 description: Optional project ID. If not provided, task will be created without a project.
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deliverables:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [backlog, todo, inprogress, review, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               labels:
 *                 type: array
 *               attachments:
 *                 type: array
 *               assignees:
 *                 type: array
 *                 items:
 *                   type: integer
 *               created_by:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Task created successfully
 *       403:
 *         description: Forbidden - no access to project
 *       500:
 *         description: Server error
 */
export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.id);
    const task = await taskService.createTask(req.body, userId);

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    logger.error("Create task error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Task Creation Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Task Creation Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /tasks/unrestricted:
 *   post:
 *     summary: Create a new task without permission checks (for board view)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskInput'
 *     responses:
 *       201:
 *         description: Task created successfully
 *       500:
 *         description: Server error
 */
export const createTaskUnrestricted = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.id);
    const task = await taskService.createTaskUnrestricted(req.body, userId);

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    logger.error("Create task unrestricted error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Task Creation Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Task Creation Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = parseInt((req as any).user.id);

    const task = await taskService.getTaskById(taskId, userId);

    res.status(200).json({
      message: "Task retrieved successfully",
      task,
    });
  } catch (error) {
    logger.error("Get task error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Get Task Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Get Task Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /tasks/{id}/unrestricted:
 *   get:
 *     summary: Get task by ID without permission checks (for board view)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
export const getTaskByIdUnrestricted = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);

    const task = await taskService.getTaskByIdUnrestricted(taskId);

    res.status(200).json({
      message: "Task retrieved successfully",
      task,
    });
  } catch (error) {
    logger.error("Get task unrestricted error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Get Task Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Get Task Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /tasks/project/{projectId}:
 *   get:
 *     summary: List tasks for a project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
export const listTasksByProject = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const userId = parseInt((req as any).user.id);

    const tasks = await taskService.listTasksByProject(projectId, userId);

    res.status(200).json({
      message: "Tasks retrieved successfully",
      tasks,
    });
  } catch (error) {
    logger.error("List tasks error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "List Tasks Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "List Tasks Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /tasks/user/assigned:
 *   get:
 *     summary: Get all tasks assigned to the current user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *       500:
 *         description: Server error
 */
export const getTasksByUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.id);

    const tasks = await taskService.getTasksByUser(userId);

    res.status(200).json({
      message: "User tasks retrieved successfully",
      tasks,
    });
  } catch (error) {
    logger.error("Get user tasks error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Get User Tasks Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Get User Tasks Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await taskService.getAllTasks();

    res.status(200).json({
      message: "All tasks retrieved successfully",
      tasks,
    });
  } catch (error) {
    logger.error("Get all tasks error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Get All Tasks Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Get All Tasks Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /tasks/projects:
 *   get:
 *     summary: Get all task team projects (for task creation)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task team projects retrieved successfully
 *       500:
 *         description: Server error
 */
export const getTaskTeamProjects = async (req: Request, res: Response) => {
  try {
    // Get user_id from query parameter if provided (for filtering projects by user membership)
    const userId = req.query.user_id ? parseInt(req.query.user_id as string) : undefined;
    const projects = await taskService.getTaskTeamProjects(userId);

    res.status(200).json({
      message: "Task team projects retrieved successfully",
      projects,
    });
  } catch (error) {
    logger.error("Get task team projects error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Get Task Team Projects Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Get Task Team Projects Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deliverables:
 *                 type: string
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *               due_date:
 *                 type: string
 *               labels:
 *                 type: array
 *               attachments:
 *                 type: array
 *               assignees:
 *                 type: array
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
export const updateTask = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = parseInt((req as any).user.id);

    const task = await taskService.updateTask(taskId, req.body, userId);

    res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    logger.error("Update task error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Update Task Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Update Task Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /tasks/{id}/unrestricted:
 *   put:
 *     summary: Update task without permission checks (for board view)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deliverables:
 *                 type: string
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *               due_date:
 *                 type: string
 *               labels:
 *                 type: array
 *               attachments:
 *                 type: array
 *               assignees:
 *                 type: array
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
export const updateTaskUnrestricted = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);

    const task = await taskService.updateTaskUnrestricted(taskId, req.body);

    res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    logger.error("Update task unrestricted error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Update Task Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Update Task Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = parseInt((req as any).user.id);

    const result = await taskService.deleteTask(taskId, userId);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Delete task error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Delete Task Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Delete Task Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /tasks/{id}/unrestricted:
 *   delete:
 *     summary: Delete task without permission checks (for board view)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
export const deleteTaskUnrestricted = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);

    const result = await taskService.deleteTaskUnrestricted(taskId);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Delete task unrestricted error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Delete Task Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Delete Task Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /tasks/{id}/comments:
 *   post:
 *     summary: Add comment to task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
export const addTaskComment = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = parseInt((req as any).user.id);
    const { content } = req.body;

    const comment = await taskService.addTaskComment(taskId, content, userId);

    res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    logger.error("Add task comment error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Add Comment Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Add Comment Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * Update task comment
 */
export const updateTaskComment = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const commentId = parseInt(req.params.commentId);
    const userId = parseInt((req as any).user.id);
    const { content } = req.body;

    const comment = await taskService.updateTaskComment(taskId, commentId, content, userId);

    res.status(200).json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    logger.error("Update task comment error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Task Comment Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Task Comment Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * Delete task comment
 */
export const deleteTaskComment = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const commentId = parseInt(req.params.commentId);
    const userId = parseInt((req as any).user.id);

    await taskService.deleteTaskComment(taskId, commentId, userId);

    res.status(200).json({
      message: "Comment deleted successfully",
      success: true,
    });
  } catch (error) {
    logger.error("Delete task comment error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Task Comment Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Task Comment Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /tasks/{id}/upload:
 *   post:
 *     summary: Upload attachments to task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /tasks/project/{projectId}/files:
 *   get:
 *     summary: Get all files from tasks in a project with role-based filtering
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Files retrieved successfully with role-based filtering
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
export const getProjectFilesWithRoleFilter = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const userId = parseInt((req as any).user.id);

    // Get current user's roles
    const userRoles = (req as any).user.roles || [];
    const isManager = userRoles.some(
      (role: string) =>
        role.toLowerCase().includes("admin") ||
        role.toLowerCase().includes("manager") ||
        role.toLowerCase().includes("staff") ||
        role.toLowerCase().includes("mentor"),
    );

    // Get all tasks for the project
    const tasks = await taskService.listTasksByProject(projectId, userId);

    // Collect all unique user IDs from attachments and task creators
    const userIds = new Set<number>();
    for (const task of tasks) {
      if (task.attachments && Array.isArray(task.attachments)) {
        for (const attachment of task.attachments) {
          if (attachment.uploaded_by) {
            userIds.add(attachment.uploaded_by);
          }
        }
      }
      if (task.created_by) {
        userIds.add(task.created_by);
      }
    }

    // Fetch all users in one go
    const usersMap = new Map<number, { name: string; email: string }>();
    for (const uid of userIds) {
      try {
        const user = await userService.getUserById(uid);
        usersMap.set(uid, {
          name: user.name || "Unknown",
          email: user.email || "unknown@example.com",
        });
      } catch (error) {
        // If user not found, use default
        usersMap.set(uid, {
          name: "Unknown",
          email: "unknown@example.com",
        });
      }
    }

    // Extract all attachments from all tasks
    const allFiles = [];
    for (const task of tasks) {
      if (task.attachments && Array.isArray(task.attachments)) {
        for (const attachment of task.attachments) {
          // Check if this attachment should be visible to current user
          let shouldShow = true;

          // If attachment has uploader info, check uploader's role
          if (attachment.uploaded_by && !isManager) {
            // For non-managers, check if the uploader was a manager
            // We need to check the uploader's role
            const uploaderIsManager = await taskService.isUserManager(attachment.uploaded_by);
            if (uploaderIsManager) {
              shouldShow = false; // Hide manager files from non-managers
            }
          }

          if (shouldShow) {
            const uploaderId = attachment.uploaded_by || task.created_by;
            const uploader = usersMap.get(uploaderId) || {
              name: "Unknown",
              email: "unknown@example.com",
            };

            // Extract file type from filename if not available
            let fileType = (attachment as any).type?.split("/")[1] || "unknown";
            if (fileType === "unknown" && attachment.filename) {
              const match = attachment.filename.match(/\.([^.]+)$/);
              if (match) {
                fileType = match[1].toLowerCase();
              }
            }

            allFiles.push({
              id: `task-${task.id}-${attachment.id}`,
              filename: attachment.filename,
              original_filename: attachment.filename,
              file_type: fileType,
              file_size: (attachment as any).sizeKB
                ? (attachment as any).sizeKB * 1024
                : (attachment as any).size || 0,
              file_url: attachment.url,
              created_at: attachment.uploaded_at || task.created_at,
              metadata: {
                description: `Attachment from task: ${task.title}`,
                tags: ["task-attachment"],
                task_id: task.id,
                task_title: task.title,
                uploaded_by: attachment.uploaded_by || task.created_by,
              },
              uploader: uploader,
            });
          }
        }
      }
    }

    res.status(200).json({
      message: "Files retrieved successfully",
      files: allFiles,
    });
  } catch (error) {
    logger.error("Get project files error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Get Files Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Get Files Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

export const uploadTaskAttachments = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = parseInt((req as any).user.id);

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        error: "Upload Error",
        message: "No files provided",
      });
    }

    // Get current task to check access and get existing attachments
    const task = await taskService.getTaskById(taskId, userId);

    // Attachments are private: store the blob key and mint a fresh SAS link on read.
    const uploadedFiles = (req.files as Express.Multer.File[]).map((file) => {
      const key = file.key!;
      return {
        id: Math.random().toString(36).slice(2),
        filename: file.originalname,
        key,
        size: file.size,
        type: file.mimetype,
        category: getFileSubdirectory(file.mimetype),
        uploaded_by: userId,
        uploaded_at: new Date().toISOString(),
      };
    });

    // Merge new attachments with existing ones
    const existingAttachments = task.attachments || [];
    const allAttachments = [...existingAttachments, ...uploadedFiles];

    // Update task with new attachments
    await taskService.updateTask(taskId, { attachments: allAttachments }, userId);

    // Return each new file with a ready-to-use short-lived download URL.
    const filesWithUrls = await Promise.all(
      uploadedFiles.map(async (f) => ({ ...f, url: await getPresignedDownload(f.key, 300) })),
    );

    res.status(200).json({
      message: "Files uploaded successfully",
      files: filesWithUrls,
    });
  } catch (error) {
    logger.error("Upload task attachments error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Upload Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Upload Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

// Export all controller functions
export const taskController = {
  createTask,
  createTaskUnrestricted,
  getTaskById,
  getTaskByIdUnrestricted,
  listTasksByProject,
  updateTask,
  updateTaskUnrestricted,
  deleteTask,
  deleteTaskUnrestricted,
  addTaskComment,
  updateTaskComment,
  deleteTaskComment,
  uploadTaskAttachments,
  getTasksByUser,
  getAllTasks,
  getTaskTeamProjects,
};

export default taskController;
