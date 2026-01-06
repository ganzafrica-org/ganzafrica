import { Request, Response } from "express";
import { teamService } from "../services/team-service";
import { projectService } from "../services/project.service";
import { AppError } from "../middlewares";
import { constants, Logger } from "../config";

const logger = new Logger("PortalDataController");

/**
 * @swagger
 * /portal-data/teams:
 *   get:
 *     summary: Get teams by team type for task management
 *     tags: [Portal Data]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: team_type_ids
 *         schema:
 *           type: string
 *         description: Comma-separated team type IDs (e.g., "1,2")
 *     responses:
 *       200:
 *         description: List of teams
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getTeamsByType = async (req: Request, res: Response) => {
  try {
    const teamTypeIds = req.query.team_type_ids as string;
    
    if (!teamTypeIds) {
      return res.status(400).json({
        error: "Validation Error",
        message: "team_type_ids parameter is required",
      });
    }

    const ids = teamTypeIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (ids.length === 0) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid team_type_ids provided",
      });
    }

    // Get teams for each team type
    const allTeams = await Promise.all(
      ids.map(id => teamService.listTeams(id))
    );

    // Flatten the results
    const teams = allTeams.flat();

    res.status(200).json({
      message: "Teams retrieved successfully",
      teams,
    });
  } catch (error) {
    logger.error("Get teams by type error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Get Teams Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Get Teams Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /portal-data/projects:
 *   get:
 *     summary: Get all projects for task management
 *     tags: [Portal Data]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
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
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const search = req.query.search as string;

    const result = await projectService.listProjects({
      page,
      limit,
      search,
      sort_by: "created_at",
      sort_order: "desc",
    });

    res.status(200).json({
      message: "Projects retrieved successfully",
      projects: result.projects,
      total: result.total,
      page,
      limit,
    });
  } catch (error) {
    logger.error("Get all projects error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Get Projects Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Get Projects Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

// Export controller
export const portalDataController = {
  getTeamsByType,
  getAllProjects,
};

export default portalDataController;

