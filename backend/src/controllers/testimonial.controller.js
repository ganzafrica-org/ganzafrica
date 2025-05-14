"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testimonialController = exports.deleteTestimonial = exports.updateTestimonial = exports.getTestimonialById = exports.listTestimonials = exports.createTestimonial = void 0;
const testimonial_service_1 = require("../services/testimonial.service");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger("TestimonialController");
/**
 * @swagger
 * /testimonials:
 *   post:
 *     summary: Create a new testimonial
 *     tags: [Testimonials]
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
 *               - author_name
 *               - description
 *             properties:
 *               author_name:
 *                 type: string
 *               position:
 *                 type: string
 *               image:
 *                 type: string
 *               description:
 *                 type: string
 *               company:
 *                 type: string
 *               occupation:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       201:
 *         description: Testimonial created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const createTestimonial = async (req, res) => {
    try {
        const testimonialData = {
            author_name: req.body.author_name,
            position: req.body.position,
            image: req.body.image,
            description: req.body.description,
            company: req.body.company,
            occupation: req.body.occupation,
            date: req.body.date,
            rating: req.body.rating,
        };
        const testimonial = await testimonial_service_1.testimonialService.createTestimonial(testimonialData);
        res.status(201).json({
            message: "Testimonial created successfully",
            testimonial,
        });
    }
    catch (error) {
        logger.error("Create testimonial error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Testimonial Creation Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Testimonial Creation Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.createTestimonial = createTestimonial;
/**
 * @swagger
 * /testimonials:
 *   get:
 *     summary: List all testimonials
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of testimonials
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const listTestimonials = async (req, res) => {
    try {
        const testimonials = await testimonial_service_1.testimonialService.listTestimonials();
        res.status(200).json({ testimonials });
    }
    catch (error) {
        logger.error("List testimonials error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Testimonial Listing Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Testimonial Listing Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.listTestimonials = listTestimonials;
/**
 * @swagger
 * /testimonials/{id}:
 *   get:
 *     summary: Get testimonial by ID
 *     tags: [Testimonials]
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
 *         description: Testimonial found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Testimonial not found
 *       500:
 *         description: Server error
 */
const getTestimonialById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const testimonial = await testimonial_service_1.testimonialService.getTestimonialById(id);
        res.status(200).json({ testimonial });
    }
    catch (error) {
        logger.error(`Get testimonial error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Testimonial Retrieval Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Testimonial Retrieval Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.getTestimonialById = getTestimonialById;
/**
 * @swagger
 * /testimonials/{id}:
 *   put:
 *     summary: Update a testimonial
 *     tags: [Testimonials]
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
 *               author_name:
 *                 type: string
 *               position:
 *                 type: string
 *               image:
 *                 type: string
 *               description:
 *                 type: string
 *               company:
 *                 type: string
 *               occupation:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Testimonial updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Testimonial not found
 *       500:
 *         description: Server error
 */
const updateTestimonial = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const testimonialData = {
            author_name: req.body.author_name,
            position: req.body.position,
            image: req.body.image,
            description: req.body.description,
            company: req.body.company,
            occupation: req.body.occupation,
            date: req.body.date,
            rating: req.body.rating,
        };
        const testimonial = await testimonial_service_1.testimonialService.updateTestimonial(id, testimonialData);
        res.status(200).json({
            message: "Testimonial updated successfully",
            testimonial,
        });
    }
    catch (error) {
        logger.error(`Update testimonial error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Testimonial Update Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Testimonial Update Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.updateTestimonial = updateTestimonial;
/**
 * @swagger
 * /testimonials/{id}:
 *   delete:
 *     summary: Delete a testimonial
 *     tags: [Testimonials]
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
 *         description: Testimonial deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Testimonial not found
 *       500:
 *         description: Server error
 */
const deleteTestimonial = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await testimonial_service_1.testimonialService.deleteTestimonial(id);
        res.status(200).json({
            message: "Testimonial deleted successfully",
        });
    }
    catch (error) {
        logger.error(`Delete testimonial error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Testimonial Deletion Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Testimonial Deletion Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.deleteTestimonial = deleteTestimonial;
// Create object to export all controller functions together
exports.testimonialController = {
    createTestimonial: exports.createTestimonial,
    listTestimonials: exports.listTestimonials,
    getTestimonialById: exports.getTestimonialById,
    updateTestimonial: exports.updateTestimonial,
    deleteTestimonial: exports.deleteTestimonial,
};
// Default export for the controller object
exports.default = exports.testimonialController;
