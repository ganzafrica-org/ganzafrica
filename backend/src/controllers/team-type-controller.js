"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamTypeController = exports.deleteTeamType = exports.updateTeamType = exports.getTeamTypeById = exports.listTeamTypes = exports.createTeamType = void 0;
const team_type_service_1 = require("../services/team-type-service");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger("TeamTypeController");
/**
 * @swagger
 * /team-types:
 *   post:
 *     summary: Create a new team type
 *     tags: [TeamTypes]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Team type created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const createTeamType = async (req, res) => {
    try {
        const teamTypeData = {
            name: req.body.name,
            description: req.body.description,
        };
        const teamType = await team_type_service_1.teamTypeService.createTeamType(teamTypeData);
        res.status(201).json({
            message: "Team type created successfully",
            teamType,
        });
    }
    catch (error) {
        logger.error("Create team type error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Team Type Creation Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Team Type Creation Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.createTeamType = createTeamType;
/**
 * @swagger
 * /team-types:
 *   get:
 *     summary: List all team types
 *     tags: [TeamTypes]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of team types
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const listTeamTypes = async (req, res) => {
    try {
        const teamTypes = await team_type_service_1.teamTypeService.listTeamTypes();
        res.status(200).json({ teamTypes });
    }
    catch (error) {
        logger.error("List team types error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Team Type Listing Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Team Type Listing Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.listTeamTypes = listTeamTypes;
/**
 * @swagger
 * /team-types/{id}:
 *   get:
 *     summary: Get team type by ID
 *     tags: [TeamTypes]
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
 *         description: Team type found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Team type not found
 *       500:
 *         description: Server error
 */
const getTeamTypeById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const teamType = await team_type_service_1.teamTypeService.getTeamTypeById(id);
        res.status(200).json({ teamType });
    }
    catch (error) {
        logger.error(`Get team type error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Team Type Retrieval Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Team Type Retrieval Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.getTeamTypeById = getTeamTypeById;
/**
 * @swagger
 * /team-types/{id}:
 *   put:
 *     summary: Update a team type
 *     tags: [TeamTypes]
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
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team type updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Team type not found
 *       409:
 *         description: Team type name already exists
 *       500:
 *         description: Server error
 */
const updateTeamType = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const teamTypeData = {
            name: req.body.name,
            description: req.body.description,
        };
        const teamType = await team_type_service_1.teamTypeService.updateTeamType(id, teamTypeData);
        res.status(200).json({
            message: "Team type updated successfully",
            teamType,
        });
    }
    catch (error) {
        logger.error(`Update team type error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Team Type Update Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Team Type Update Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.updateTeamType = updateTeamType;
/**
 * @swagger
 * /team-types/{id}:
 *   delete:
 *     summary: Delete a team type
 *     tags: [TeamTypes]
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
 *         description: Team type deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Team type not found
 *       500:
 *         description: Server error
 */
const deleteTeamType = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await team_type_service_1.teamTypeService.deleteTeamType(id);
        res.status(200).json({
            message: "Team type deleted successfully",
        });
    }
    catch (error) {
        logger.error(`Delete team type error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Team Type Deletion Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Team Type Deletion Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.deleteTeamType = deleteTeamType;
// Create object to export all controller functions together
exports.teamTypeController = {
    createTeamType: exports.createTeamType,
    listTeamTypes: exports.listTeamTypes,
    getTeamTypeById: exports.getTeamTypeById,
    updateTeamType: exports.updateTeamType,
    deleteTeamType: exports.deleteTeamType,
};
// Default export for the controller object
exports.default = exports.teamTypeController;
