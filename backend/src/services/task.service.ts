import { db } from "../db/client";
import {
  tasks,
  task_assignees,
  task_comments,
  task_team_projects,
  task_project_members,
  users,
  roles,
} from "../db/schema";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { AppError } from "../middlewares";
import { Logger } from "../config";

const logger = new Logger("TaskService");

// Type definitions
export type CreateTaskInput = {
  project_id?: number; // Made optional to allow tasks without projects
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
 * Check if a task is overdue (past due date and not completed)
 */
export const isTaskOverdue = (task: any): boolean => {
  if (!task.due_date || task.status === 'done') {
    return false;
  }
  
  const dueDate = new Date(task.due_date);
  const now = new Date();
  
  return dueDate < now;
};

/**
 * Automatically update task status to overdue if past due date
 */
export const updateOverdueTasks = async (): Promise<void> => {
  try {
    const now = new Date();
    
    // Find tasks that are past due date and not completed
    const overdueTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          sql`${tasks.due_date} < ${now}`,
          sql`${tasks.status} != 'done'`
        )
      );
    
    // Update their status to overdue
    for (const task of overdueTasks) {
      await db
        .update(tasks)
        .set({ status: 'overdue' as any })
        .where(eq(tasks.id, task.id));
    }
    
    logger.info(`Updated ${overdueTasks.length} tasks to overdue status`);
  } catch (error) {
    logger.error("Error updating overdue tasks", error);
  }
};

/**
 * Check if user has management role (admin, manager, staff, mentor)
 */
export const isUserManager = async (userId: number): Promise<boolean> => {
  try {
    const [user] = await db
      .select({
        role_id: users.role_id,
        role_name: roles.name,
      })
      .from(users)
      .leftJoin(roles, eq(users.role_id, roles.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return false;

    const roleName = user.role_name?.toLowerCase() || '';
    
    // Check for management roles
    const isManagerRole = roleName.includes('admin') || 
                         roleName.includes('manager') || 
                         roleName.includes('staff') || 
                         roleName.includes('mentor') ||
                         (user.role_id && user.role_id < 1000); // Assuming admin/manager roles have IDs < 1000

    return !!isManagerRole;
  } catch (error) {
    logger.error("Error checking user management role", error);
    return false;
  }
};

/**
 * Check if user can access project
 * User can access if they are:
 * 1. A member of the project
 * 2. Have management role (role_id for management roles)
 * 3. If projectId is null/undefined, allow access (for tasks without projects)
 * 4. All logged-in users can create tasks in any project (for task creation flexibility)
 */
export const canAccessProject = async (userId: number, projectId?: number): Promise<boolean> => {
  try {
    // If no project ID, allow access (for tasks without projects)
    if (!projectId) {
      return true;
    }

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
    const isManager = await isUserManager(userId);
    if (isManager) {
      return true;
    }

    // Allow all logged-in users to create tasks in any project
    // This enables task creation for all authenticated users
    return true;
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
    // Validate due date is not in the past
    if (input.due_date) {
      const dueDate = new Date(input.due_date);
      const now = new Date();
      
      if (dueDate < now) {
        throw new AppError("Cannot create task with past due date. Please select today or a future date.", 400);
      }
    }
    
    // Check if user can access the project (if project_id is provided)
    if (input.project_id) {
      const hasAccess = await canAccessProject(userId, input.project_id);
      if (!hasAccess) {
        throw new AppError("You don't have permission to create tasks in this project", 403);
      }
    }

    // Create the task
    const [task] = await db
      .insert(tasks)
      .values({
        project_id: input.project_id || null,
        title: input.title,
        description: input.description,
        deliverables: input.deliverables,
        status: (input.status || "todo") as any,
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
    // Validate due date is not in the past
    if (input.due_date) {
      const dueDate = new Date(input.due_date);
      const now = new Date();
      
      if (dueDate < now) {
        throw new AppError("Cannot create task with past due date. Please select today or a future date.", 400);
      }
    }
    
    // Create the task without permission checks
    const [task] = await db
      .insert(tasks)
      .values({
        project_id: input.project_id || null,
        title: input.title,
        description: input.description,
        deliverables: input.deliverables,
        status: (input.status || "todo") as any,
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
    // First, update any overdue tasks
    await updateOverdueTasks();
    
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

    // Check if user can access this task's project (if it has one)
    const hasProjectAccess = await canAccessProject(userId, task.project_id || undefined);
    
    // Also check if user is assigned to this task
    const [taskAssignee] = await db
      .select()
      .from(task_assignees)
      .where(
        and(
          eq(task_assignees.task_id, taskId),
          eq(task_assignees.user_id, userId)
        )
      )
      .limit(1);
    
    const isAssignedToTask = !!taskAssignee;
    
    // Allow access if:
    // 1. User has project access (or task has no project)
    // 2. User is assigned to the task
    // 3. User created the task
    const isTaskCreator = task.created_by === userId;
    
    if (!hasProjectAccess && !isAssignedToTask && !isTaskCreator) {
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
    // First, update any overdue tasks
    await updateOverdueTasks();
    
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

    // Get detailed information for each task (assignees, comments)
    const tasksWithDetails = await Promise.all(
      userTasks.map(async (task) => {
        // Get assignees with user details
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
          .where(eq(task_assignees.task_id, task.id));

        // Get comments with user details
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
          .where(eq(task_comments.task_id, task.id))
          .orderBy(desc(task_comments.created_at));

        return {
          ...task,
          assignees,
          comments,
        };
      })
    );

    return tasksWithDetails;
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
    // First, update any overdue tasks
    await updateOverdueTasks();
    
    // Get all tasks without any permission checks, including creator role information
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
        // Include creator role information
        creator_role_id: users.role_id,
        creator_role_name: roles.name,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.created_by, users.id))
      .leftJoin(roles, eq(users.role_id, roles.id))
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
    // Validate due date is not in the past (if being updated)
    if (input.due_date) {
      const dueDate = new Date(input.due_date);
      const now = new Date();
      
      if (dueDate < now) {
        throw new AppError("Cannot update task with past due date. Please select today or a future date.", 400);
      }
    }
    
    // Get the task first to check permissions
    const [existingTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!existingTask) {
      throw new AppError("Task not found", 404);
    }

    // Check if user is a manager (can edit all tasks)
    const isManager = await isUserManager(userId);
    
    // Check if user is the task creator
    const isTaskCreator = existingTask.created_by === userId;
    
    // Check if user is assigned to this task
    const [taskAssignee] = await db
      .select()
      .from(task_assignees)
      .where(
        and(
          eq(task_assignees.task_id, taskId),
          eq(task_assignees.user_id, userId)
        )
      )
      .limit(1);
    
    const isAssignedToTask = !!taskAssignee;
    
    // Allow access if:
    // 1. User is a manager (admin, manager, staff, mentor)
    // 2. User created the task
    // 3. User is assigned to the task
    if (!isManager && !isTaskCreator && !isAssignedToTask) {
      throw new AppError("You don't have permission to update this task. Only managers, task creators, or assigned users can edit tasks.", 403);
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
 * Get task by ID without permission checks (for board view)
 */
export const getTaskByIdUnrestricted = async (taskId: number) => {
  try {
    // First, update any overdue tasks
    await updateOverdueTasks();
    
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

    return {
      ...task,
      assignees,
      comments,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Get task unrestricted error", error);
    throw new AppError("Failed to get task", 500);
  }
};

/**
 * Update task without permission checks (for board view)
 */
export const updateTaskUnrestricted = async (taskId: number, input: UpdateTaskInput) => {
  try {
    // Validate due date is not in the past (if being updated)
    if (input.due_date) {
      const dueDate = new Date(input.due_date);
      const now = new Date();
      
      if (dueDate < now) {
        throw new AppError("Cannot update task with past due date. Please select today or a future date.", 400);
      }
    }
    
    // Check if task exists
    const [existingTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!existingTask) {
      throw new AppError("Task not found", 404);
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

    return await getTaskByIdUnrestricted(taskId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Update task unrestricted error", error);
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

    // Check if user is a manager (can delete all tasks)
    const isManager = await isUserManager(userId);
    
    // Check if user is the task creator
    const isTaskCreator = task.created_by === userId;
    
    // Allow access if:
    // 1. User is a manager (admin, manager, staff, mentor)
    // 2. User created the task
    if (!isManager && !isTaskCreator) {
      throw new AppError("You don't have permission to delete this task. Only managers or task creators can delete tasks.", 403);
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
 * Delete task without permission checks (for board view)
 */
export const deleteTaskUnrestricted = async (taskId: number) => {
  try {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    await db.delete(tasks).where(eq(tasks.id, taskId));

    return { message: "Task deleted successfully" };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Delete task unrestricted error", error);
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

    // Check if user can access the project (if it has one)
    const hasProjectAccess = await canAccessProject(userId, task.project_id || undefined);
    
    // Also check if user is assigned to this task
    const [taskAssignee] = await db
      .select()
      .from(task_assignees)
      .where(
        and(
          eq(task_assignees.task_id, taskId),
          eq(task_assignees.user_id, userId)
        )
      )
      .limit(1);
    
    const isAssignedToTask = !!taskAssignee;
    
    // Allow access if:
    // 1. User has project access (or task has no project)
    // 2. User is assigned to the task
    // 3. User created the task
    const isTaskCreator = task.created_by === userId;
    
    if (!hasProjectAccess && !isAssignedToTask && !isTaskCreator) {
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

/**
 * Update a comment (author only)
 */
export const updateTaskComment = async (taskId: number, commentId: number, content: string, userId: number) => {
  try {
    // Ensure task exists
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
    if (!task) throw new AppError("Task not found", 404);

    // Load the comment
    const [existing] = await db
      .select()
      .from(task_comments)
      .where(and(eq(task_comments.id, commentId), eq(task_comments.task_id, taskId)))
      .limit(1);
    if (!existing) throw new AppError("Comment not found", 404);
    if (existing.user_id !== userId) throw new AppError("You can only edit your own comment", 403);

    const [updated] = await db
      .update(task_comments)
      .set({ content, updated_at: new Date() as any })
      .where(and(eq(task_comments.id, commentId), eq(task_comments.task_id, taskId)))
      .returning();

    return updated;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Update task comment error", error);
    throw new AppError("Failed to update comment", 500);
  }
};

/**
 * Delete a comment (author only)
 */
export const deleteTaskComment = async (taskId: number, commentId: number, userId: number) => {
  try {
    // Ensure task exists
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
    if (!task) throw new AppError("Task not found", 404);

    // Load the comment
    const [existing] = await db
      .select()
      .from(task_comments)
      .where(and(eq(task_comments.id, commentId), eq(task_comments.task_id, taskId)))
      .limit(1);
    if (!existing) throw new AppError("Comment not found", 404);
    if (existing.user_id !== userId) throw new AppError("You can only delete your own comment", 403);

    await db.delete(task_comments).where(and(eq(task_comments.id, commentId), eq(task_comments.task_id, taskId)));
    return { success: true };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Delete task comment error", error);
    throw new AppError("Failed to delete comment", 500);
  }
};

// Export service object
export const taskService = {
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
  canAccessProject,
  isUserManager,
  getAllTasks,
  getTaskTeamProjects,
  getTasksByUser,
};

export default taskService;

