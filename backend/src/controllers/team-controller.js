"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamController = exports.deleteTeam = exports.updateTeam = exports.getTeamById = exports.listTeams = exports.createTeam = void 0;
const team_service_1 = require("../services/team-service");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger("TeamController");
/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a new team member
 *     tags: [Teams]
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
 *               - team_type_id
 *             properties:
 *               name:
 *                 type: string
 *               position:
 *                 type: string
 *               photo_url:
 *                 type: string
 *               bio:
 *                 type: string
 *               email:
 *                 type: string
 *               profile_link:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               team_type_id:
 *                 type: number
 *     responses:
 *       201:
 *         description: Team member created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const createTeam = async (req, res) => {
    try {
        const teamData = {
            name: req.body.name,
            position: req.body.position,
            photo_url: req.body.photo_url,
            bio: req.body.bio,
            email: req.body.email,
            profile_link: req.body.profile_link,
            skills: req.body.skills,
            team_type_id: req.body.team_type_id,
        };
        const team = await team_service_1.teamService.createTeam(teamData);
        res.status(201).json({
            message: "Team member created successfully",
            team,
        });
    }
    catch (error) {
        logger.error("Create team error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Team Creation Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Team Creation Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.createTeam = createTeam;
/**
 * @swagger
 * /teams:
 *   get:
 *     summary: List all team members
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: team_type_id
 *         schema:
 *           type: number
 *         description: Filter teams by team type ID
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *         description: Field to sort by (defaults to created_at)
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (asc or desc, defaults to desc)
 *     responses:
 *       200:
 *         description: List of team members
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const listTeams = async (req, res) => {
    try {
        const teamTypeId = req.query.team_type_id
            ? Number(req.query.team_type_id)
            : undefined;
        // Get sort parameters with defaults
        const sortBy = req.query.sort_by?.toString() || 'created_at';
        const sortOrder = req.query.sort_order?.toString() || 'desc';
        // Pass sorting parameters to service
        const teams = await team_service_1.teamService.listTeams(teamTypeId, sortBy, sortOrder);
        res.status(200).json({ teams });
    }
    catch (error) {
        logger.error("List teams error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Team Listing Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Team Listing Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.listTeams = listTeams;
/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Get team member by ID
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team member found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Team member not found
 *       500:
 *         description: Server error
 */
const getTeamById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const team = await team_service_1.teamService.getTeamById(id);
        res.status(200).json({ team });
    }
    catch (error) {
        logger.error(`Get team error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Team Retrieval Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Team Retrieval Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.getTeamById = getTeamById;
/**
 * @swagger
 * /teams/{id}:
 *   put:
 *     summary: Update a team member
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               position:
 *                 type: string
 *               photo_url:
 *                 type: string
 *               bio:
 *                 type: string
 *               email:
 *                 type: string
 *               profile_link:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               team_type_id:
 *                 type: number
 *     responses:
 *       200:
 *         description: Team member updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Team member not found
 *       500:
 *         description: Server error
 */
const updateTeam = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const teamData = {
            name: req.body.name,
            position: req.body.position,
            photo_url: req.body.photo_url,
            bio: req.body.bio,
            email: req.body.email,
            profile_link: req.body.profile_link,
            skills: req.body.skills,
            team_type_id: req.body.team_type_id,
        };
        const team = await team_service_1.teamService.updateTeam(id, teamData);
        res.status(200).json({
            message: "Team member updated successfully",
            team,
        });
    }
    catch (error) {
        logger.error(`Update team error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Team Update Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Team Update Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.updateTeam = updateTeam;
/**
 * @swagger
 * /teams/{id}:
 *   delete:
 *     summary: Delete a team member
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team member deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Team member not found
 *       500:
 *         description: Server error
 */
const deleteTeam = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await team_service_1.teamService.deleteTeam(id);
        res.status(200).json({
            message: "Team member deleted successfully",
        });
    }
    catch (error) {
        logger.error(`Delete team error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Team Deletion Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Team Deletion Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.deleteTeam = deleteTeam;
// Create object to export all controller functions together
exports.teamController = {
    createTeam: exports.createTeam,
    listTeams: exports.listTeams,
    getTeamById: exports.getTeamById,
    updateTeam: exports.updateTeam,
    deleteTeam: exports.deleteTeam,
};
// Default export for the controller object
exports.default = exports.teamController;
