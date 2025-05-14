"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectController = exports.listProjects = exports.deleteProject = exports.updateProject = exports.getProjectById = exports.createProject = void 0;
const services_1 = require("../services");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
// No need to extend Express.Request as it already has the files property
// in @types/express-serve-static-core and @types/multer
const logger = new config_1.Logger("ProjectController");
/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - status
 *               - start_date
 *               - category_id
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [planned, active, completed, cancelled, on_hold]
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               category_id:
 *                 type: integer
 *               partner_id:
 *                 type: integer
 *               location:
 *                 type: string
 *               goals:
 *                 type: object
 *                 properties:
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         completed:
 *                           type: boolean
 *                         order:
 *                           type: integer
 *               outcomes:
 *                 type: object
 *                 properties:
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         status:
 *                           type: string
 *                         order:
 *                           type: integer
 *               media:
 *                 type: object
 *                 properties:
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         type:
 *                           type: string
 *                           enum: [image, video]
 *                         url:
 *                           type: string
 *                         cover:
 *                           type: boolean
 *                         tag:
 *                           type: string
 *                           enum: [feature, description, others]
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         size:
 *                           type: integer
 *                         duration:
 *                           type: integer
 *                         thumbnailUrl:
 *                           type: string
 *                         order:
 *                           type: integer
 *               other_information:
 *                 type: object
 *               members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - team_id
 *                     - role
 *                     - start_date
 *                   properties:
 *                     team_id:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [lead, member, supervisor, contributor]
 *                     start_date:
 *                       type: string
 *                       format: date-time
 *                     end_date:
 *                       type: string
 *                       format: date-time
 *               partners:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - partner_id
 *                   properties:
 *                     partner_id:
 *                       type: integer
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple files can be uploaded
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
const createProject = async (req, res) => {
    try {
        // Check if category exists before creating project
        const categoryId = Number(req.body.category_id);
        const categoryExists = await client_1.db
            .select({ id: schema_1.project_categories.id })
            .from(schema_1.project_categories)
            .where((0, drizzle_orm_1.eq)(schema_1.project_categories.id, categoryId))
            .limit(1);
        if (!categoryExists.length) {
            return res.status(400).json({
                error: "Validation Error",
                message: `Category with ID ${categoryId} does not exist`,
            });
        }
        // Process uploaded files if any
        const uploadedFiles = req.files || [];
        const documents = uploadedFiles.map(file => ({
            name: file.originalname,
            file_url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
            file_size: file.size
        }));
        // Parse JSON fields if they're sent as strings
        let goals, outcomes, media, other_information, members, partners;
        try {
            if (req.body.goals && typeof req.body.goals === 'string') {
                goals = JSON.parse(req.body.goals);
            }
            else {
                goals = req.body.goals;
            }
            if (req.body.outcomes && typeof req.body.outcomes === 'string') {
                outcomes = JSON.parse(req.body.outcomes);
            }
            else {
                outcomes = req.body.outcomes;
            }
            if (req.body.media && typeof req.body.media === 'string') {
                media = JSON.parse(req.body.media);
            }
            else {
                media = req.body.media;
            }
            if (req.body.other_information && typeof req.body.other_information === 'string') {
                other_information = JSON.parse(req.body.other_information);
            }
            else {
                other_information = req.body.other_information;
            }
            if (req.body.members && typeof req.body.members === 'string') {
                members = JSON.parse(req.body.members);
            }
            else {
                members = req.body.members;
            }
            if (req.body.partners && typeof req.body.partners === 'string') {
                partners = JSON.parse(req.body.partners);
            }
            else {
                partners = req.body.partners;
            }
        }
        catch (error) {
            logger.error("Error parsing JSON fields", error);
            return res.status(400).json({
                error: "Validation Error",
                message: "Invalid JSON in request body",
            });
        }
        // Parse dates from strings to Date objects and ensure IDs are numbers
        const projectData = {
            ...req.body,
            goals,
            outcomes,
            media,
            other_information,
            start_date: new Date(req.body.start_date),
            end_date: req.body.end_date ? new Date(req.body.end_date) : undefined,
            // Parse team member data if provided
            members: members
                ? members.map((member) => ({
                    ...member,
                    team_id: Number(member.team_id),
                    start_date: new Date(member.start_date),
                    end_date: member.end_date ? new Date(member.end_date) : undefined,
                }))
                : undefined,
            // Parse partners data if provided
            partners: partners
                ? partners.map((partner) => ({
                    ...partner,
                    partner_id: Number(partner.partner_id),
                }))
                : undefined,
            // Add uploaded documents
            documents: [...(req.body.documents || []), ...documents],
        };
        const project = await services_1.projectService.createProject(projectData);
        res.status(201).json({
            message: "Project created successfully",
            project,
        });
    }
    catch (error) {
        logger.error("Create project error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Project Creation Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Project Creation Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.createProject = createProject;
/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
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
 *         description: Project found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
const getProjectById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        logger.info(`Controller: Attempting to get project with ID: ${id}`);
        // Add cache control headers to prevent browser caching
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        const project = await services_1.projectService.getProjectById(id);
        logger.info(`Controller: Successfully retrieved project with ID: ${id}`);
        res.status(200).json({ project });
    }
    catch (error) {
        logger.error(`Get project error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Project Retrieval Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Project Retrieval Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.getProjectById = getProjectById;
/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Update project
 *     tags: [Projects]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [planned, active, completed, cancelled, on_hold]
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               category_id:
 *                 type: integer
 *               partner_id:
 *                 type: integer
 *               location:
 *                 type: string
 *               goals:
 *                 type: object
 *               outcomes:
 *                 type: object
 *               media:
 *                 type: object
 *               other_information:
 *                 type: object
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple files can be uploaded
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
const updateProject = async (req, res) => {
    try {
        const id = Number(req.params.id);
        // Process uploaded files if any
        const uploadedFiles = req.files || [];
        const newDocuments = uploadedFiles.map(file => ({
            name: file.originalname,
            file_url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
            file_size: file.size
        }));
        // Parse JSON fields if they're sent as strings
        let goals, outcomes, media, other_information;
        try {
            if (req.body.goals && typeof req.body.goals === 'string') {
                goals = JSON.parse(req.body.goals);
            }
            else {
                goals = req.body.goals;
            }
            if (req.body.outcomes && typeof req.body.outcomes === 'string') {
                outcomes = JSON.parse(req.body.outcomes);
            }
            else {
                outcomes = req.body.outcomes;
            }
            if (req.body.media && typeof req.body.media === 'string') {
                media = JSON.parse(req.body.media);
            }
            else {
                media = req.body.media;
            }
            if (req.body.other_information && typeof req.body.other_information === 'string') {
                other_information = JSON.parse(req.body.other_information);
            }
            else {
                other_information = req.body.other_information;
            }
        }
        catch (error) {
            logger.error("Error parsing JSON fields", error);
            return res.status(400).json({
                error: "Validation Error",
                message: "Invalid JSON in request body",
            });
        }
        // Parse dates from strings to Date objects
        const projectData = {
            ...req.body,
            goals,
            outcomes,
            media,
            other_information,
            start_date: req.body.start_date
                ? new Date(req.body.start_date)
                : undefined,
            end_date: req.body.end_date ? new Date(req.body.end_date) : undefined,
        };
        // If new documents were uploaded, get the existing project first to append new documents
        if (newDocuments.length > 0) {
            const existingProject = await services_1.projectService.getProjectById(id);
            const existingDocuments = existingProject.documents || [];
            // Add documents field to projectData
            projectData.documents = [...existingDocuments, ...newDocuments];
        }
        const project = await services_1.projectService.updateProject(id, projectData);
        res.status(200).json({
            message: "Project updated successfully",
            project,
        });
    }
    catch (error) {
        logger.error(`Update project error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Project Update Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Project Update Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.updateProject = updateProject;
/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete project and all related data
 *     tags: [Projects]
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
 *         description: Project deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
const deleteProject = async (req, res) => {
    try {
        const id = Number(req.params.id);
        logger.info(`Attempting to delete project with ID: ${id}`);
        // Call the service method to delete the project
        const isDeleted = await services_1.projectService.deleteProject(id);
        if (!isDeleted) {
            logger.error(`Failed to delete project with ID: ${id}`);
            return res.status(500).json({
                error: "Project Deletion Error",
                message: "Failed to delete project due to an unexpected error",
            });
        }
        logger.info(`Successfully deleted project with ID: ${id}`);
        // Return success response
        res.status(200).json({
            message: "Project and all related data deleted successfully",
            success: true
        });
    }
    catch (error) {
        logger.error(`Delete project error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Project Deletion Error",
                message: error.message,
                success: false
            });
        }
        res.status(500).json({
            error: "Project Deletion Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
            success: false
        });
    }
};
exports.deleteProject = deleteProject;
/**
 * @swagger
 * /projects:
 *   get:
 *     summary: List projects with pagination and filtering
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [name, status, start_date, created_at]
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planned, active, completed, cancelled, on_hold]
 *       - in: query
 *         name: team_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: partner_id
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
const listProjects = async (req, res) => {
    try {
        const params = {
            page: parseInt(req.query.page, 10) || 1,
            limit: parseInt(req.query.limit, 10) || 10,
            search: req.query.search,
            sort_by: req.query.sort_by,
            sort_order: req.query.sort_order,
            status: req.query.status,
            team_id: req.query.team_id ? Number(req.query.team_id) : undefined,
            category_id: req.query.category_id ? Number(req.query.category_id) : undefined,
            partner_id: req.query.partner_id ? Number(req.query.partner_id) : undefined,
        };
        // Add cache control headers to prevent caching
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        const { projects, total } = await services_1.projectService.listProjects(params);
        res.status(200).json({
            projects,
            pagination: {
                total,
                page: params.page,
                limit: params.limit,
                pages: Math.ceil(total / params.limit),
            },
        });
    }
    catch (error) {
        logger.error("List projects error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Project Listing Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Project Listing Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.listProjects = listProjects;
// Create object to export all controller functions together
exports.projectController = {
    createProject: exports.createProject,
    getProjectById: exports.getProjectById,
    updateProject: exports.updateProject,
    deleteProject: exports.deleteProject,
    listProjects: exports.listProjects
};
// Default export for the controller object
exports.default = exports.projectController;
