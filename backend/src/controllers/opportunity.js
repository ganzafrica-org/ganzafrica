"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opportunityController = exports.submitApplicationReview = exports.listAllApplications = exports.updateApplicationStatus = exports.getApplicationById = exports.listApplications = exports.submitApplication = exports.submitGeneralApplication = exports.deleteOpportunity = exports.closeOpportunity = exports.publishOpportunity = exports.updateOpportunity = exports.getOpportunityById = exports.listOpportunities = exports.createOpportunity = void 0;
const opportunity_1 = require("../services/opportunity");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger('OpportunityController');
/**
 * @swagger
 * /opportunities:
 *   post:
 *     summary: Create a new opportunity (fellowship or employment)
 *     tags: [Opportunities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/CreateFellowshipRequest'
 *               - $ref: '#/components/schemas/CreateEmploymentRequest'
 *     responses:
 *       201:
 *         description: Opportunity created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
const createOpportunity = async (req, res) => {
    try {
        // Use a default user ID or get it from request if authenticated
        const userId = req.user?.id || 1; // Default to ID 1 if not authenticated
        const opportunityData = {
            ...req.body,
            created_by: userId
        };
        const opportunity = await opportunity_1.opportunityService.createOpportunity(opportunityData);
        res.status(201).json({
            message: 'Opportunity created successfully',
            opportunity
        });
    }
    catch (error) {
        logger.error('Create opportunity error', error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: 'Opportunity Creation Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Opportunity Creation Error',
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};
exports.createOpportunity = createOpportunity;
/**
 * @swagger
 * /opportunities:
 *   get:
 *     summary: List all opportunities
 *     tags: [Opportunities]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [fellowship, employment]
 *         description: Filter by opportunity type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, closed, cancelled]
 *         description: Filter by opportunity status
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *     responses:
 *       200:
 *         description: List of opportunities
 *       500:
 *         description: Server error
 */
const listOpportunities = async (req, res) => {
    try {
        const filters = {
            type: req.query.type,
            status: req.query.status,
            category_id: req.query.category ? Number(req.query.category) : undefined
        };
        const opportunities = await opportunity_1.opportunityService.listOpportunities(filters);
        res.status(200).json({ opportunities });
    }
    catch (error) {
        logger.error('List opportunities error', error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: 'Opportunity Listing Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Opportunity Listing Error',
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};
exports.listOpportunities = listOpportunities;
/**
 * @swagger
 * /opportunities/{id}:
 *   get:
 *     summary: Get opportunity by ID
 *     tags: [Opportunities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Opportunity found
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
const getOpportunityById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const opportunity = await opportunity_1.opportunityService.getOpportunityById(id);
        res.status(200).json({ opportunity });
    }
    catch (error) {
        logger.error(`Get opportunity error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: 'Opportunity Retrieval Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Opportunity Retrieval Error',
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};
exports.getOpportunityById = getOpportunityById;
/**
 * @swagger
 * /opportunities/{id}:
 *   put:
 *     summary: Update an opportunity
 *     tags: [Opportunities]
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
 *             oneOf:
 *               - $ref: '#/components/schemas/UpdateFellowshipRequest'
 *               - $ref: '#/components/schemas/UpdateEmploymentRequest'
 *     responses:
 *       200:
 *         description: Opportunity updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
const updateOpportunity = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const opportunityData = req.body;
        const opportunity = await opportunity_1.opportunityService.updateOpportunity(id, opportunityData);
        res.status(200).json({
            message: 'Opportunity updated successfully',
            opportunity
        });
    }
    catch (error) {
        logger.error(`Update opportunity error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: 'Opportunity Update Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Opportunity Update Error',
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};
exports.updateOpportunity = updateOpportunity;
/**
 * @swagger
 * /opportunities/{id}/publish:
 *   post:
 *     summary: Publish an opportunity
 *     tags: [Opportunities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Opportunity published successfully
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
const publishOpportunity = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const opportunity = await opportunity_1.opportunityService.updateOpportunityStatus(id, 'published');
        res.status(200).json({
            message: 'Opportunity published successfully',
            opportunity
        });
    }
    catch (error) {
        logger.error(`Publish opportunity error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: 'Opportunity Publishing Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Opportunity Publishing Error',
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};
exports.publishOpportunity = publishOpportunity;
/**
 * @swagger
 * /opportunities/{id}/close:
 *   post:
 *     summary: Close an opportunity
 *     tags: [Opportunities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Opportunity closed successfully
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
const closeOpportunity = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const opportunity = await opportunity_1.opportunityService.updateOpportunityStatus(id, 'closed');
        res.status(200).json({
            message: 'Opportunity closed successfully',
            opportunity
        });
    }
    catch (error) {
        logger.error(`Close opportunity error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: 'Opportunity Closing Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Opportunity Closing Error',
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};
exports.closeOpportunity = closeOpportunity;
/**
 * @swagger
 * /opportunities/{id}:
 *   delete:
 *     summary: Delete an opportunity
 *     tags: [Opportunities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Opportunity deleted successfully
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
const deleteOpportunity = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await opportunity_1.opportunityService.deleteOpportunity(id);
        res.status(200).json({
            message: 'Opportunity deleted successfully'
        });
    }
    catch (error) {
        logger.error(`Delete opportunity error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: 'Opportunity Deletion Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Opportunity Deletion Error',
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};
exports.deleteOpportunity = deleteOpportunity;
// Application Endpoints
/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Submit a general GanzAfrica application
 *     tags: [Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplicationSubmission'
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
const submitGeneralApplication = async (req, res) => {
    try {
        const applicationData = req.body;
        const userId = req.user?.id; // Optional, applicant might not be a logged-in user
        if (userId) {
            applicationData.user_id = userId;
        }
        const application = await opportunity_1.opportunityService.submitApplication(applicationData);
        res.status(201).json({
            message: 'Application submitted successfully',
            application
        });
    }
    catch (error) {
        logger.error('Submit general application error', error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: 'Application Submission Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Application Submission Error',
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};
exports.submitGeneralApplication = submitGeneralApplication;
/**
 * @swagger
 * /opportunities/{id}/apply:
 *   post:
 *     summary: Submit an application for a specific opportunity
 *     tags: [Applications]
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
 *             $ref: '#/components/schemas/ApplicationSubmission'
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
const submitApplication = async (req, res) => {
    try {
        const opportunityId = Number(req.params.id);
        const userId = req.user?.id; // Optional, applicant might not be a logged-in user
        const applicationData = {
            ...req.body,
            opportunity_id: opportunityId,
            user_id: userId
        };
        const application = await opportunity_1.opportunityService.submitApplication(applicationData);
        res.status(201).json({
            message: 'Application submitted successfully',
            application
        });
    }
    catch (error) {
        logger.error(`Submit application error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: 'Application Submission Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Application Submission Error',
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};
exports.submitApplication = submitApplication;
/**
 * @swagger
 * /opportunities/{id}/applications:
 *   get:
 *     summary: List applications for an opportunity
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by application status
 *     responses:
 *       200:
 *         description: List of applications
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
const listApplications = async (req, res) => {
    try {
        const opportunityId = Number(req.params.id);
        const status = req.query.status;
        const applications = await opportunity_1.opportunityService.listApplications(opportunityId, status);
        res.status(200).json({ applications });
    }
    catch (error) {
        logger.error(`List applications error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: 'Application Listing Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Application Listing Error',
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};
exports.listApplications = listApplications;
/**
 * @swagger
 * /applications/{id}:
 *   get:
 *     summary: Get application by ID
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application found
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
const getApplicationById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const application = await opportunity_1.opportunityService.getApplicationById(id);
        res.status(200).json({ application });
    }
    catch (error) {
        logger.error(`Get application error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: 'Application Retrieval Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Application Retrieval Error',
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};
exports.getApplicationById = getApplicationById;
/**
 * @swagger
 * /applications/{id}/status:
 *   put:
 *     summary: Update application status
 *     tags: [Applications]
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
 *             $ref: '#/components/schemas/UpdateApplicationStatus'
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
const updateApplicationStatus = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;
        const application = await opportunity_1.opportunityService.updateApplicationStatus(id, status);
        res.status(200).json({
            message: 'Application status updated successfully',
            application
        });
    }
    catch (error) {
        logger.error(`Update application status error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: 'Application Status Update Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Application Status Update Error',
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};
exports.updateApplicationStatus = updateApplicationStatus;
/**
 * @swagger
 * /applications:
 *   get:
 *     summary: List all applications across all opportunities
 *     tags: [Applications]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by application status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of all applications
 *       500:
 *         description: Server error
 */
const listAllApplications = async (req, res) => {
    try {
        const status = req.query.status;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const applications = await opportunity_1.opportunityService.listAllApplications(status, page, limit);
        res.status(200).json({ applications });
    }
    catch (error) {
        logger.error('List all applications error', error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: 'Application Listing Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Application Listing Error',
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};
exports.listAllApplications = listAllApplications;
/**
 * @swagger
 * /applications/{id}/review:
 *   post:
 *     summary: Submit a review for an application
 *     tags: [Applications]
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
 *             $ref: '#/components/schemas/ApplicationReview'
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
const submitApplicationReview = async (req, res) => {
    try {
        const applicationId = Number(req.params.id);
        // Use a default reviewer ID
        const reviewerId = req.user?.id || 1; // Default to ID 1 if not authenticated
        const reviewData = {
            application_id: applicationId,
            reviewer_id: Number(reviewerId),
            score: req.body.score,
            comments: req.body.comments,
            recommendation: req.body.recommendation
        };
        const review = await opportunity_1.opportunityService.submitApplicationReview(reviewData);
        res.status(201).json({
            message: 'Review submitted successfully',
            review
        });
    }
    catch (error) {
        logger.error(`Submit application review error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: 'Review Submission Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Review Submission Error',
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};
exports.submitApplicationReview = submitApplicationReview;
// Create object to export all controller functions together
exports.opportunityController = {
    createOpportunity: exports.createOpportunity,
    listOpportunities: exports.listOpportunities,
    getOpportunityById: exports.getOpportunityById,
    updateOpportunity: exports.updateOpportunity,
    publishOpportunity: exports.publishOpportunity,
    closeOpportunity: exports.closeOpportunity,
    deleteOpportunity: exports.deleteOpportunity,
    submitApplication: exports.submitApplication,
    submitGeneralApplication: exports.submitGeneralApplication,
    listApplications: exports.listApplications,
    getApplicationById: exports.getApplicationById,
    updateApplicationStatus: exports.updateApplicationStatus,
    submitApplicationReview: exports.submitApplicationReview,
    listAllApplications: exports.listAllApplications,
};
// Default export for the controller object
exports.default = exports.opportunityController;
