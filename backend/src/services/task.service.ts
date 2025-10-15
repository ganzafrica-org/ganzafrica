import { db } from "../db/client";
import {
  tasks,
  task_assignees,
  task_comments,
  task_team_projects,
  task_project_members,
  users,
} from "../db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { AppError } from "../middlewares";
import { Logger } from "../config";

const logger = new Logger("TaskService");

// Type definitions
export type CreateTaskInput = {
  project_id: number;
  title: string;
  description?: string;
  deliverables?: string;
  status?: string;
  priority?: string;
  due_date?: Date;
  labels?: Array<{ id: string; name: string; color: string }>;
  attachments?: Array<{ id: string; filename: string; url: string }>;
  assignees?: number[]; // User IDs
  created_by: number;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  deliverables?: string;
  status?: string;
  priority?: string;
  due_date?: Date;
  labels?: Array<{ id: string; name: string; color: string }>;
  attachments?: Array<{ id: string; filename: string; url: string }>;
  assignees?: number[];
};

/**
 * Check if user can access project
 * User can access if they are:
 * 1. A member of the project
 * 2. Have management role (role_id for management roles)
 */
export const canAccessProject = async (userId: number, projectId: number): Promise<boolean> => {
  try {
    // Check if user is a project member
    const [projectMember] = await db
      .select()
      .from(task_project_members)
      .where(
        and(
          eq(task_project_members.project_id, projectId),
          eq(task_project_members.user_id, userId)
        )
      )
      .limit(1);

    if (projectMember) {
      return true;
    }

    // Check if user has management role
    // Assuming role_ids for management: adjust these based on your actual role IDs
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user && user.role_id) {
      // Check if role is management (role_id < 1000 are typically admin/management roles)
      // Adjust this logic based on your role structure
      if (user.role_id < 1000) {
        return true;
      }
    }

    return false;
  } catch (error) {
    logger.error("Error checking project access", error);
    return false;
  }
};

/**
 * Create a new task
 */
export const createTask = async (input: CreateTaskInput, userId: number) => {
  try {
    // Check if user can access the project
    const hasAccess = await canAccessProject(userId, input.project_id);
    if (!hasAccess) {
      throw new AppError("You don't have permission to create tasks in this project", 403);
    }

    // Create the task
    const [task] = await db
      .insert(tasks)
      .values({
        project_id: input.project_id,
        title: input.title,
        description: input.description,
        deliverables: input.deliverables,
        status: (input.status || "backlog") as any,
        priority: (input.priority || "medium") as any,
        due_date: input.due_date ? new Date(input.due_date) : null,
        labels: input.labels || [],
        attachments: input.attachments || [],
        created_by: input.created_by,
      } as any)
      .returning();

    // Add assignees if provided
    if (input.assignees && input.assignees.length > 0) {
      const assigneesToInsert = input.assignees.map(assigneeId => ({
        task_id: task.id,
        user_id: assigneeId,
      }));
      
      await db.insert(task_assignees).values(assigneesToInsert as any);
    }

    return await getTaskById(task.id, userId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Create task error", error);
    throw new AppError("Failed to create task", 500);
  }
};

/**
 * Create a new task without permission checks (for board view)
 */
export const createTaskUnrestricted = async (input: CreateTaskInput, userId: number) => {
  try {
    // Create the task without permission checks
    const [task] = await db
      .insert(tasks)
      .values({
        project_id: input.project_id,
        title: input.title,
        description: input.description,
        deliverables: input.deliverables,
        status: (input.status || "backlog") as any,
        priority: (input.priority || "medium") as any,
        due_date: input.due_date ? new Date(input.due_date) : null,
        labels: input.labels || [],
        attachments: input.attachments || [],
        created_by: input.created_by,
      } as any)
      .returning();

    // Add assignees if provided
    if (input.assignees && input.assignees.length > 0) {
      const assigneesToInsert = input.assignees.map(assigneeId => ({
        task_id: task.id,
        user_id: assigneeId,
      }));
      
      await db.insert(task_assignees).values(assigneesToInsert as any);
    }

    // Get the full task with assignees
    const fullTask = await db
      .select({
        id: tasks.id,
        project_id: tasks.project_id,
        title: tasks.title,
        description: tasks.description,
        deliverables: tasks.deliverables,
        status: tasks.status,
        priority: tasks.priority,
        due_date: tasks.due_date,
        labels: tasks.labels,
        attachments: tasks.attachments,
        created_by: tasks.created_by,
        created_at: tasks.created_at,
        updated_at: tasks.updated_at,
      })
      .from(tasks)
      .where(eq(tasks.id, task.id))
      .limit(1);

    // Get assignees for the task
    const assignees = await db
      .select({
        user_id: task_assignees.user_id,
      })
      .from(task_assignees)
      .where(eq(task_assignees.task_id, task.id));

    return {
      ...fullTask[0],
      assignees: assignees.map(a => a.user_id),
    };
  } catch (error) {
    logger.error("Create task unrestricted error", error);
    throw new AppError("Failed to create task", 500);
  }
};

/**
 * Get task by ID with authorization check
 */
export const getTaskById = async (taskId: number, userId: number) => {
  try {
    const [task] = await db
      .select({
        id: tasks.id,
        project_id: tasks.project_id,
        title: tasks.title,
        description: tasks.description,
        deliverables: tasks.deliverables,
        status: tasks.status,
        priority: tasks.priority,
        due_date: tasks.due_date,
        labels: tasks.labels,
        attachments: tasks.attachments,
        created_by: tasks.created_by,
        created_at: tasks.created_at,
        updated_at: tasks.updated_at,
      })
      .from(tasks)
      .where(eq(tasks.id, taskId));

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Check if user can access this task's project
    const hasAccess = await canAccessProject(userId, task.project_id);
    if (!hasAccess) {
      throw new AppError("You don't have permission to view this task", 403);
    }

    // Get assignees
    const assignees = await db
      .select({
        id: task_assignees.id,
        user_id: task_assignees.user_id,
        assigned_at: task_assignees.assigned_at,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar_url: users.avatar_url,
        },
      })
      .from(task_assignees)
      .leftJoin(users, eq(task_assignees.user_id, users.id))
      .where(eq(task_assignees.task_id, taskId));

    // Get comments
    const comments = await db
      .select({
        id: task_comments.id,
        content: task_comments.content,
        user_id: task_comments.user_id,
        created_at: task_comments.created_at,
        user: {
          id: users.id,
          name: users.name,
          avatar_url: users.avatar_url,
        },
      })
      .from(task_comments)
      .leftJoin(users, eq(task_comments.user_id, users.id))
      .where(eq(task_comments.task_id, taskId))
      .orderBy(desc(task_comments.created_at));

    // Debug logs removed - issue identified and fixed
    
    return {
      ...task,
      assignees,
      comments,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Get task error", error);
    throw new AppError("Failed to get task", 500);
  }
};

/**
 * List tasks for a project
 */
export const listTasksByProject = async (projectId: number, userId: number) => {
  try {
    // Check if user can access the project
    const hasAccess = await canAccessProject(userId, projectId);
    if (!hasAccess) {
      throw new AppError("You don't have permission to view tasks in this project", 403);
    }

    const projectTasks = await db
      .select({
        id: tasks.id,
        project_id: tasks.project_id,
        title: tasks.title,
        description: tasks.description,
        deliverables: tasks.deliverables,
        status: tasks.status,
        priority: tasks.priority,
        due_date: tasks.due_date,
        labels: tasks.labels,
        attachments: tasks.attachments,
        created_by: tasks.created_by,
        created_at: tasks.created_at,
        updated_at: tasks.updated_at,
      })
      .from(tasks)
      .where(eq(tasks.project_id, projectId))
      .orderBy(desc(tasks.created_at));

    // Get assignees for each task
    const tasksWithAssignees = await Promise.all(
      projectTasks.map(async (task) => {
        const assignees = await db
          .select({
            user_id: task_assignees.user_id,
          })
          .from(task_assignees)
          .where(eq(task_assignees.task_id, task.id));

        return {
          ...task,
          assignees: assignees.map(a => a.user_id),
        };
      })
    );

    return tasksWithAssignees;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("List tasks error", error);
    throw new AppError("Failed to list tasks", 500);
  }
};

/**
 * Get all tasks assigned to a user
 */
export const getTasksByUser = async (userId: number) => {
  try {
    // Get all tasks where the user is assigned
    const userTasks = await db
      .select({
        id: tasks.id,
        project_id: tasks.project_id,
        title: tasks.title,
        description: tasks.description,
        deliverables: tasks.deliverables,
        status: tasks.status,
        priority: tasks.priority,
        due_date: tasks.due_date,
        labels: tasks.labels,
        attachments: tasks.attachments,
        created_by: tasks.created_by,
        created_at: tasks.created_at,
        updated_at: tasks.updated_at,
      })
      .from(tasks)
      .innerJoin(task_assignees, eq(tasks.id, task_assignees.task_id))
      .where(eq(task_assignees.user_id, userId))
      .orderBy(desc(tasks.created_at));

    // Get assignees for each task
    const tasksWithAssignees = await Promise.all(
      userTasks.map(async (task) => {
        const assignees = await db
          .select({
            user_id: task_assignees.user_id,
          })
          .from(task_assignees)
          .where(eq(task_assignees.task_id, task.id));

        return {
          ...task,
          assignees: assignees.map(a => a.user_id),
        };
      })
    );

    return tasksWithAssignees;
  } catch (error) {
    logger.error("Get tasks by user error", error);
    throw new AppError("Failed to get user tasks", 500);
  }
};

/**
 * Get ALL tasks from database without permission checks (for admin/board view)
 */
export const getAllTasks = async () => {
  try {
    // Get all tasks without any permission checks
    const allTasks = await db
      .select({
        id: tasks.id,
        project_id: tasks.project_id,
        title: tasks.title,
        description: tasks.description,
        deliverables: tasks.deliverables,
        status: tasks.status,
        priority: tasks.priority,
        due_date: tasks.due_date,
        labels: tasks.labels,
        attachments: tasks.attachments,
        created_by: tasks.created_by,
        created_at: tasks.created_at,
        updated_at: tasks.updated_at,
      })
      .from(tasks)
      .orderBy(desc(tasks.created_at));

    // Get assignees for each task
    const tasksWithAssignees = await Promise.all(
      allTasks.map(async (task) => {
        const assignees = await db
          .select({
            user_id: task_assignees.user_id,
          })
          .from(task_assignees)
          .where(eq(task_assignees.task_id, task.id));

        return {
          ...task,
          assignees: assignees.map(a => a.user_id),
        };
      })
    );

    return tasksWithAssignees;
  } catch (error) {
    logger.error("Get all tasks error", error);
    throw new AppError("Failed to get all tasks", 500);
  }
};

/**
 * Get all task team projects (for task creation)
 */
export const getTaskTeamProjects = async () => {
  try {
    const taskTeamProjects = await db
      .select({
        id: task_team_projects.id,
        team_id: task_team_projects.team_id,
        name: task_team_projects.name,
        description: task_team_projects.description,
        status: task_team_projects.status,
        start_date: task_team_projects.start_date,
        end_date: task_team_projects.end_date,
        color: task_team_projects.color,
        created_by: task_team_projects.created_by,
        created_at: task_team_projects.created_at,
        updated_at: task_team_projects.updated_at,
      })
      .from(task_team_projects)
      .orderBy(desc(task_team_projects.created_at));

    return taskTeamProjects;
  } catch (error) {
    logger.error("Get task team projects error", error);
    throw new AppError("Failed to get task team projects", 500);
  }
};

/**
 * Update task
 */
export const updateTask = async (taskId: number, input: UpdateTaskInput, userId: number) => {
  try {
    // Get the task first to check project access
    const [existingTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!existingTask) {
      throw new AppError("Task not found", 404);
    }

    // Check if user can access the project
    const hasAccess = await canAccessProject(userId, existingTask.project_id);
    if (!hasAccess) {
      throw new AppError("You don't have permission to update this task", 403);
    }

    const updateData: any = {};
    
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.deliverables !== undefined) updateData.deliverables = input.deliverables;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.due_date !== undefined) updateData.due_date = input.due_date ? new Date(input.due_date) : null;
    if (input.labels !== undefined) updateData.labels = input.labels;
    if (input.attachments !== undefined) {
      updateData.attachments = input.attachments;
    }
    
    updateData.updated_at = new Date();

    const result = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning();

    // Update assignees if provided
    if (input.assignees !== undefined) {
      // Remove all existing assignees
      await db.delete(task_assignees).where(eq(task_assignees.task_id, taskId));
      
      // Add new assignees
      if (input.assignees.length > 0) {
        const assigneesToInsert = input.assignees.map(assigneeId => ({
          task_id: taskId,
          user_id: assigneeId,
        }));
        
        await db.insert(task_assignees).values(assigneesToInsert as any);
      }
    }

    return await getTaskById(taskId, userId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Update task error", error);
    throw new AppError("Failed to update task", 500);
  }
};

/**
 * Delete task
 */
export const deleteTask = async (taskId: number, userId: number) => {
  try {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Check if user can access the project
    const hasAccess = await canAccessProject(userId, task.project_id);
    if (!hasAccess) {
      throw new AppError("You don't have permission to delete this task", 403);
    }

    await db.delete(tasks).where(eq(tasks.id, taskId));

    return { message: "Task deleted successfully" };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Delete task error", error);
    throw new AppError("Failed to delete task", 500);
  }
};

/**
 * Add comment to task
 */
export const addTaskComment = async (taskId: number, content: string, userId: number) => {
  try {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Check if user can access the project
    const hasAccess = await canAccessProject(userId, task.project_id);
    if (!hasAccess) {
      throw new AppError("You don't have permission to comment on this task", 403);
    }

    const [comment] = await db
      .insert(task_comments)
      .values({
        task_id: taskId,
        user_id: userId,
        content,
      } as any)
      .returning();

    return comment;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Add task comment error", error);
    throw new AppError("Failed to add comment", 500);
  }
};

// Export service object
export const taskService = {
  createTask,
  createTaskUnrestricted,
  getTaskById,
  listTasksByProject,
  updateTask,
  deleteTask,
  addTaskComment,
  canAccessProject,
  getAllTasks,
  getTaskTeamProjects,
};

export default taskService;

