"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.listCategories = exports.createCategory = void 0;
const categories_1 = require("../services/categories");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger("CategoryController");
/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new project category
 *     tags: [Categories]
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
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const createCategory = async (req, res) => {
    try {
        const categoryData = {
            name: req.body.name,
            description: req.body.description,
        };
        const category = await categories_1.categoryService.createCategory(categoryData);
        res.status(201).json({
            message: "Category created successfully",
            category,
        });
    }
    catch (error) {
        logger.error("Create category error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Category Creation Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Category Creation Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.createCategory = createCategory;
/**
 * @swagger
 * /categories:
 *   get:
 *     summary: List all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const listCategories = async (req, res) => {
    try {
        const categories = await categories_1.categoryService.listCategories();
        res.status(200).json({ categories });
    }
    catch (error) {
        logger.error("List categories error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Category Listing Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Category Listing Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.listCategories = listCategories;
/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
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
 *         description: Category found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
const getCategoryById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const category = await categories_1.categoryService.getCategoryById(id);
        res.status(200).json({ category });
    }
    catch (error) {
        logger.error(`Get category error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Category Retrieval Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Category Retrieval Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.getCategoryById = getCategoryById;
/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
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
 *         description: Category updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category name already exists
 *       500:
 *         description: Server error
 */
const updateCategory = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const categoryData = {
            name: req.body.name,
            description: req.body.description,
        };
        const category = await categories_1.categoryService.updateCategory(id, categoryData);
        res.status(200).json({
            message: "Category updated successfully",
            category,
        });
    }
    catch (error) {
        logger.error(`Update category error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Category Update Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Category Update Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.updateCategory = updateCategory;
/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
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
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
const deleteCategory = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await categories_1.categoryService.deleteCategory(id);
        res.status(200).json({
            message: "Category deleted successfully",
        });
    }
    catch (error) {
        logger.error(`Delete category error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Category Deletion Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Category Deletion Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.deleteCategory = deleteCategory;
// Create object to export all controller functions together
exports.categoryController = {
    createCategory: exports.createCategory,
    listCategories: exports.listCategories,
    getCategoryById: exports.getCategoryById,
    updateCategory: exports.updateCategory,
    deleteCategory: exports.deleteCategory,
};
// Default export for the controller object
exports.default = exports.categoryController;
