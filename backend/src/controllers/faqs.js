"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqController = exports.deleteFaq = exports.updateFaq = exports.getFaqById = exports.listFaqs = exports.createFaq = void 0;
const faqs_1 = require("../services/faqs");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger("FaqController");
/**
 * @swagger
 * /faqs:
 *   post:
 *     summary: Create a new FAQ
 *     tags: [FAQs]
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
 *               - question
 *               - answer
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: FAQ created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const createFaq = async (req, res) => {
    try {
        const userId = req.user && req.user.id ? Number(req.user.id) : 1;
        const faqData = {
            question: req.body.question,
            answer: req.body.answer,
            is_active: req.body.is_active,
        };
        const faq = await faqs_1.faqService.createFaq(faqData);
        res.status(201).json({
            message: "FAQ created successfully",
            faq,
        });
    }
    catch (error) {
        // ... rest of error handling code
    }
};
exports.createFaq = createFaq;
/**
 * @swagger
 * /faqs:
 *   get:
 *     summary: List all FAQs
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: active_only
 *         schema:
 *           type: boolean
 *         description: If true, returns only active FAQs
 *     responses:
 *       200:
 *         description: List of FAQs
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const listFaqs = async (req, res) => {
    try {
        const activeOnly = req.query.active_only === "true";
        const faqs = await faqs_1.faqService.listFaqs(activeOnly);
        res.status(200).json({ faqs });
    }
    catch (error) {
        logger.error("List FAQs error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "FAQ Listing Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "FAQ Listing Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.listFaqs = listFaqs;
/**
 * @swagger
 * /faqs/{id}:
 *   get:
 *     summary: Get FAQ by ID
 *     tags: [FAQs]
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
 *         description: FAQ found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Server error
 */
const getFaqById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const faq = await faqs_1.faqService.getFaqById(id);
        // Increment view count asynchronously (don't wait for completion)
        faqs_1.faqService.incrementViewCount(id).catch((err) => {
            logger.error(`Failed to increment view count for FAQ ${id}`, err);
        });
        res.status(200).json({ faq });
    }
    catch (error) {
        logger.error(`Get FAQ error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "FAQ Retrieval Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "FAQ Retrieval Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.getFaqById = getFaqById;
/**
 * @swagger
 * /faqs/{id}:
 *   put:
 *     summary: Update a FAQ
 *     tags: [FAQs]
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
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               view_count:
 *                 type: integer
 *     responses:
 *       200:
 *         description: FAQ updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Server error
 */
const updateFaq = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const faqData = {
            question: req.body.question,
            answer: req.body.answer,
            is_active: req.body.is_active,
            view_count: req.body.view_count,
        };
        const faq = await faqs_1.faqService.updateFaq(id, faqData);
        res.status(200).json({
            message: "FAQ updated successfully",
            faq,
        });
    }
    catch (error) {
        logger.error(`Update FAQ error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "FAQ Update Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "FAQ Update Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.updateFaq = updateFaq;
/**
 * @swagger
 * /faqs/{id}:
 *   delete:
 *     summary: Delete a FAQ
 *     tags: [FAQs]
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
 *         description: FAQ deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Server error
 */
const deleteFaq = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await faqs_1.faqService.deleteFaq(id);
        res.status(200).json({
            message: "FAQ deleted successfully",
        });
    }
    catch (error) {
        logger.error(`Delete FAQ error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "FAQ Deletion Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "FAQ Deletion Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.deleteFaq = deleteFaq;
// Create object to export all controller functions together
exports.faqController = {
    createFaq: exports.createFaq,
    listFaqs: exports.listFaqs,
    getFaqById: exports.getFaqById,
    updateFaq: exports.updateFaq,
    deleteFaq: exports.deleteFaq,
};
// Default export for the controller object
exports.default = exports.faqController;
