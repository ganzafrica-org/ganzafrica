import { Request, Response } from "express";
import { taskTeamService } from "../services/task-team.service";
import { AppError } from "../middlewares";
import { constants, Logger } from "../config";

const logger = new Logger("TaskTeamController");

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskTeam:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         avatar_url:
 *           type: string
 *         color:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive, archived]
 *         created_by:
 *           type: integer
 *         settings:
 *           type: object
 *         members:
 *           type: array
 *           items:
 *             type: object
 *         member_count:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     TaskProject:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         team_id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [planning, active, on_hold, completed, cancelled]
 *         start_date:
 *           type: string
 *           format: date-time
 *         end_date:
 *           type: string
 *           format: date-time
 *         color:
 *           type: string
 *         created_by:
 *           type: integer
 *         members:
 *           type: array
 *           items:
 *             type: object
 *         member_count:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /task-teams:
 *   post:
 *     summary: Create a new task team with members and projects
 *     tags: [Task Teams]
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
 *               - name
 *               - created_by
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *               color:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, archived]
 *               created_by:
 *                 type: integer
 *               settings:
 *                 type: object
 *               members:
 *                 type: array
 *                 description: Array of members to add to the team
 *                 items:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       description: ID from the portal teams table (Fellows/Team members)
 *                     name:
 *                       type: string
 *                       description: Actual name of the team member
 *                     position:
 *                       type: string
 *                       description: Actual position of the team member (use 'none' if no position)
 *               projects:
 *                 type: array
 *                 description: Array of projects to create for the team
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [planning, active, on_hold, completed, cancelled]
 *                     start_date:
 *                       type: string
 *                       format: date-time
 *                     end_date:
 *                       type: string
 *                       format: date-time
 *                     color:
 *                       type: string
 *     responses:
 *       201:
 *         description: Task team created successfully with members and projects
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const createTaskTeam = async (req: Request, res: Response) => {
  try {
    const team = await taskTeamService.createTaskTeam(req.body);

    res.status(201).json({
      message: "Task team created successfully",
      team,
    });
  } catch (error) {
    logger.error("Create task team error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Task Team Creation Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Task Team Creation Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /task-teams/{id}:
 *   get:
 *     summary: Get task team by ID
 *     tags: [Task Teams]
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
 *         description: Task team found
 *       404:
 *         description: Task team not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getTaskTeamById = async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.id);
    const team = await taskTeamService.getTaskTeamById(teamId);

    res.status(200).json({
      message: "Task team retrieved successfully",
      team,
    });
  } catch (error) {
    logger.error("Get task team error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Get Task Team Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Get Task Team Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /task-teams:
 *   get:
 *     summary: List all task teams
 *     tags: [Task Teams]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, archived]
 *       - in: query
 *         name: created_by
 *         schema:
 *           type: integer
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter teams where user is a member
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of task teams
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const listTaskTeams = async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      created_by: req.query.created_by ? parseInt(req.query.created_by as string) : undefined,
      user_id: req.query.user_id ? parseInt(req.query.user_id as string) : undefined,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    const result = await taskTeamService.listTaskTeams(filters);

    res.status(200).json({
      message: "Task teams retrieved successfully",
      ...result,
    });
  } catch (error) {
    logger.error("List task teams error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "List Task Teams Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "List Task Teams Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /task-teams/{id}:
 *   put:
 *     summary: Update task team
 *     tags: [Task Teams]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *               color:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, archived]
 *               settings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Task team updated successfully
 *       404:
 *         description: Task team not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const updateTaskTeam = async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.id);
    const team = await taskTeamService.updateTaskTeam(teamId, req.body);

    res.status(200).json({
      message: "Task team updated successfully",
      team,
    });
  } catch (error) {
    logger.error("Update task team error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Update Task Team Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Update Task Team Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /task-teams/{id}:
 *   delete:
 *     summary: Delete task team
 *     tags: [Task Teams]
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
 *         description: Task team deleted successfully
 *       404:
 *         description: Task team not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const deleteTaskTeam = async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.id);
    const result = await taskTeamService.deleteTaskTeam(teamId);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Delete task team error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Delete Task Team Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Delete Task Team Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /task-teams/{id}/members:
 *   post:
 *     summary: Add member to task team
 *     tags: [Task Teams]
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
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *               role:
 *                 type: string
 *                 enum: [owner, admin, member, viewer]
 *     responses:
 *       201:
 *         description: Member added successfully
 *       400:
 *         description: User already a member
 *       404:
 *         description: Task team not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const addTeamMember = async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.id);
    const { user_id, role, name, position } = req.body;

    // Validate that user_id is provided
    if (!user_id) {
      return res.status(400).json({
        error: "Add Team Member Error",
        message: "user_id is required",
      });
    }

    // Map user_id to portal_team_id (they are the same - user ID from portal)
    const member = await taskTeamService.addTeamMember({
      team_id: teamId,
      portal_team_id: user_id,
      role: role || "member",
      name: name || null,
      position: position || null,
    });

    res.status(201).json({
      message: "Team member added successfully",
      member,
    });
  } catch (error) {
    logger.error("Add team member error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Add Team Member Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Add Team Member Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /task-teams/{id}/members/{userId}:
 *   delete:
 *     summary: Remove member from task team
 *     tags: [Task Teams]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       404:
 *         description: Team member not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const removeTeamMember = async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    const result = await taskTeamService.removeTeamMember(teamId, userId);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Remove team member error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Remove Team Member Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Remove Team Member Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /task-teams/{id}/members/{userId}/role:
 *   patch:
 *     summary: Update team member role
 *     tags: [Task Teams]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [owner, admin, member, viewer]
 *     responses:
 *       200:
 *         description: Member role updated successfully
 *       404:
 *         description: Team member not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const updateTeamMemberRole = async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    const { role } = req.body;

    const member = await taskTeamService.updateTeamMemberRole(teamId, userId, role);

    res.status(200).json({
      message: "Team member role updated successfully",
      member,
    });
  } catch (error) {
    logger.error("Update team member role error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Update Team Member Role Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Update Team Member Role Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /task-teams/{id}/projects:
 *   post:
 *     summary: Create a project for a task team
 *     tags: [Task Projects]
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
 *               - name
 *               - created_by
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [planning, active, on_hold, completed, cancelled]
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               color:
 *                 type: string
 *               created_by:
 *                 type: integer
 *               settings:
 *                 type: object
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const createTaskProject = async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.id);
    const project = await taskTeamService.createTaskProject({
      team_id: teamId,
      ...req.body,
    });

    res.status(201).json({
      message: "Task project created successfully",
      project,
    });
  } catch (error) {
    logger.error("Create task project error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Task Project Creation Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Task Project Creation Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /task-teams/{id}/projects/{projectId}:
 *   post:
 *     summary: Add existing project to task team
 *     tags: [Task Teams]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team ID
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID to add
 *     responses:
 *       201:
 *         description: Project added to team successfully
 *       400:
 *         description: Project already exists in team
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const addProjectToTeam = async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.id);
    const projectId = parseInt(req.params.projectId);
    const createdBy = (req as any).user?.id || (req as any).user?.userId;
    
    if (!createdBy) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User ID not found in request",
      });
    }

    const project = await taskTeamService.addProjectToTeam(teamId, projectId, createdBy);

    res.status(201).json({
      message: "Project added to team successfully",
      project,
    });
  } catch (error) {
    logger.error("Add project to team error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Add Project To Team Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Add Project To Team Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /task-teams/projects/{id}:
 *   get:
 *     summary: Get task project by ID
 *     tags: [Task Projects]
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
 *         description: Project found
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getTaskProjectById = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await taskTeamService.getTaskProjectById(projectId);

    res.status(200).json({
      message: "Task project retrieved successfully",
      project,
    });
  } catch (error) {
    logger.error("Get task project error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Get Task Project Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Get Task Project Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /task-teams/{id}/projects:
 *   get:
 *     summary: List projects for a task team
 *     tags: [Task Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, active, on_hold, completed, cancelled]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of projects
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const listTaskProjects = async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.id);
    const filters = {
      status: req.query.status as string,
      search: req.query.search as string,
    };

    const projects = await taskTeamService.listTaskProjects(teamId, filters);

    res.status(200).json({
      message: "Task projects retrieved successfully",
      projects,
    });
  } catch (error) {
    logger.error("List task projects error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "List Task Projects Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "List Task Projects Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /task-teams/projects/{id}:
 *   put:
 *     summary: Update task project
 *     tags: [Task Projects]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [planning, active, on_hold, completed, cancelled]
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               color:
 *                 type: string
 *               settings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const updateTaskProject = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await taskTeamService.updateTaskProject(projectId, req.body);

    res.status(200).json({
      message: "Task project updated successfully",
      project,
    });
  } catch (error) {
    logger.error("Update task project error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Update Task Project Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Update Task Project Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /task-teams/projects/{id}:
 *   delete:
 *     summary: Delete task project
 *     tags: [Task Projects]
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
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const deleteTaskProject = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    const result = await taskTeamService.deleteTaskProject(projectId);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Delete task project error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Delete Task Project Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Delete Task Project Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /task-teams/{id}/projects/{projectId}:
 *   delete:
 *     summary: Remove project from task team
 *     tags: [Task Teams]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team ID
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project removed from team successfully
 *       404:
 *         description: Project not found in team
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const removeProjectFromTeam = async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.id);
    const projectId = parseInt(req.params.projectId);
    const result = await taskTeamService.removeProjectFromTeam(teamId, projectId);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Remove project from team error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Remove Project From Team Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Remove Project From Team Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /task-teams/projects/{id}/members:
 *   post:
 *     summary: Add member to task project
 *     tags: [Task Projects]
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
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *               role:
 *                 type: string
 *                 enum: [owner, admin, member, viewer]
 *     responses:
 *       201:
 *         description: Member added successfully
 *       400:
 *         description: User already a member
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const addProjectMember = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    const member = await taskTeamService.addProjectMember({
      project_id: projectId,
      ...req.body,
    });

    res.status(201).json({
      message: "Project member added successfully",
      member,
    });
  } catch (error) {
    logger.error("Add project member error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Add Project Member Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Add Project Member Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /task-teams/projects/{id}/members/{userId}:
 *   delete:
 *     summary: Remove member from task project
 *     tags: [Task Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       404:
 *         description: Project member not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const removeProjectMember = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    const result = await taskTeamService.removeProjectMember(projectId, userId);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Remove project member error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Remove Project Member Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Remove Project Member Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /task-teams/projects/all:
 *   get:
 *     summary: List all projects across all teams
 *     tags: [Task Teams]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, active, on_hold, completed, cancelled]
 *         description: Filter by project status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by project name or description
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 projects:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       team_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                       start_date:
 *                         type: string
 *                         format: date-time
 *                       end_date:
 *                         type: string
 *                         format: date-time
 *                       color:
 *                         type: string
 *                       created_by:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                       creator:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const listAllProjects = async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      search: req.query.search as string,
    };

    const projects = await taskTeamService.listAllProjects(filters);

    res.status(200).json({
      message: "All projects retrieved successfully",
      projects,
    });
  } catch (error) {
    logger.error("List all projects error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "List All Projects Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "List All Projects Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

// Export all controller functions
export const taskTeamController = {
  createTaskTeam,
  getTaskTeamById,
  listTaskTeams,
  updateTaskTeam,
  deleteTaskTeam,
  addTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
  createTaskProject,
  addProjectToTeam,
  getTaskProjectById,
  listTaskProjects,
  listAllProjects,
  updateTaskProject,
  deleteTaskProject,
  removeProjectFromTeam,
  addProjectMember,
  removeProjectMember,
};

export default taskTeamController;

