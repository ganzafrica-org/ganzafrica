"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partnerController = exports.deletePartner = exports.updatePartner = exports.getPartnerById = exports.listPartners = exports.createPartner = void 0;
const partner_service_1 = require("../services/partner.service");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger("PartnerController");
/**
 * @swagger
 * /partners:
 *   post:
 *     summary: Create a new partner
 *     tags: [Partners]
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
 *               logo:
 *                 type: string
 *               website_url:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Partner created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const createPartner = async (req, res) => {
    try {
        const partnerData = {
            name: req.body.name,
            logo: req.body.logo,
            website_url: req.body.website_url,
            location: req.body.location,
        };
        const partner = await partner_service_1.partnerService.createPartner(partnerData);
        res.status(201).json({
            message: "Partner created successfully",
            partner,
        });
    }
    catch (error) {
        logger.error("Create partner error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Partner Creation Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Partner Creation Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.createPartner = createPartner;
/**
 * @swagger
 * /partners:
 *   get:
 *     summary: List all partners
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of partners
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const listPartners = async (req, res) => {
    try {
        const partners = await partner_service_1.partnerService.listPartners();
        res.status(200).json({ partners });
    }
    catch (error) {
        logger.error("List partners error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Partner Listing Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Partner Listing Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.listPartners = listPartners;
/**
 * @swagger
 * /partners/{id}:
 *   get:
 *     summary: Get partner by ID
 *     tags: [Partners]
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
 *         description: Partner found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Partner not found
 *       500:
 *         description: Server error
 */
const getPartnerById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const partner = await partner_service_1.partnerService.getPartnerById(id);
        res.status(200).json({ partner });
    }
    catch (error) {
        logger.error(`Get partner error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Partner Retrieval Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Partner Retrieval Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.getPartnerById = getPartnerById;
/**
 * @swagger
 * /partners/{id}:
 *   put:
 *     summary: Update a partner
 *     tags: [Partners]
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
 *               logo:
 *                 type: string
 *               website_url:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Partner updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Partner not found
 *       409:
 *         description: Partner name already exists
 *       500:
 *         description: Server error
 */
const updatePartner = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const partnerData = {
            name: req.body.name,
            logo: req.body.logo,
            website_url: req.body.website_url,
            location: req.body.location,
        };
        const partner = await partner_service_1.partnerService.updatePartner(id, partnerData);
        res.status(200).json({
            message: "Partner updated successfully",
            partner,
        });
    }
    catch (error) {
        logger.error(`Update partner error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Partner Update Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Partner Update Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.updatePartner = updatePartner;
/**
 * @swagger
 * /partners/{id}:
 *   delete:
 *     summary: Delete a partner
 *     tags: [Partners]
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
 *         description: Partner deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Partner not found
 *       500:
 *         description: Server error
 */
const deletePartner = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await partner_service_1.partnerService.deletePartner(id);
        res.status(200).json({
            message: "Partner deleted successfully",
        });
    }
    catch (error) {
        logger.error(`Delete partner error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Partner Deletion Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Partner Deletion Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.deletePartner = deletePartner;
// Create object to export all controller functions together
exports.partnerController = {
    createPartner: exports.createPartner,
    listPartners: exports.listPartners,
    getPartnerById: exports.getPartnerById,
    updatePartner: exports.updatePartner,
    deletePartner: exports.deletePartner,
};
// Default export for the controller object
exports.default = exports.partnerController;
