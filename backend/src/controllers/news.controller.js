"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsController = exports.deleteTag = exports.createTag = exports.listTags = exports.deleteNews = exports.updateNews = exports.getNewsById = exports.listNews = exports.createNews = void 0;
const news_service_1 = require("../services/news.service");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger("NewsController");
/**
 * @swagger
 * /news:
 *   post:
 *     summary: Create a new news item
 *     tags: [News]
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
 *               - title
 *               - content
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [published, not_published]
 *               publish_date:
 *                 type: string
 *                 format: date-time
 *               category:
 *                 type: string
 *                 enum: [all, news, blogs, reports, publications]
 *               key_lessons:
 *                 type: string
 *               media:
 *                 type: object
 *               tags:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: News item created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const createNews = async (req, res) => {
    try {
        // Check if we're in a testing environment to provide appropriate debugging info
        const isTestMode = process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development";
        if (isTestMode) {
            logger.info(`Creating news item`);
        }
        const newsData = {
            title: req.body.title,
            content: req.body.content,
            status: req.body.status || "not_published",
            publish_date: req.body.publish_date
                ? new Date(req.body.publish_date)
                : undefined,
            category: req.body.category,
            key_lessons: req.body.key_lessons,
            media: req.body.media,
            tags: req.body.tags,
        };
        const news = await news_service_1.newsService.createNews(newsData);
        res.status(201).json({
            message: "News item created successfully",
            news,
        });
    }
    catch (error) {
        logger.error("Create news error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "News Creation Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "News Creation Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.createNews = createNews;
/**
 * @swagger
 * /news:
 *   get:
 *     summary: List news items with filtering
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and content
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tag IDs
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Pagination limit
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Pagination offset
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: sortDir
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: List of news items
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const listNews = async (req, res) => {
    try {
        const filter = {
            category: req.query.category,
            status: req.query.status,
            search: req.query.search,
            tags: req.query.tags
                ? req.query.tags.split(",").map(Number)
                : undefined,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
            offset: req.query.offset
                ? parseInt(req.query.offset)
                : undefined,
            sortBy: req.query.sortBy,
            sortDir: req.query.sortDir,
        };
        const { news, total } = await news_service_1.newsService.listNews(filter);
        res.status(200).json({
            news,
            pagination: {
                total,
                limit: filter.limit || 20,
                offset: filter.offset || 0,
            },
        });
    }
    catch (error) {
        logger.error("List news error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "News Listing Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "News Listing Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.listNews = listNews;
/**
 * @swagger
 * /news/{id}:
 *   get:
 *     summary: Get news item by ID
 *     tags: [News]
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
 *         description: News item found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: News item not found
 *       500:
 *         description: Server error
 */
const getNewsById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const news = await news_service_1.newsService.getNewsById(id);
        res.status(200).json({ news });
    }
    catch (error) {
        logger.error(`Get news error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "News Retrieval Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "News Retrieval Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.getNewsById = getNewsById;
/**
 * @swagger
 * /news/{id}:
 *   put:
 *     summary: Update a news item
 *     tags: [News]
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
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [published, not_published]
 *               publish_date:
 *                 type: string
 *                 format: date-time
 *               category:
 *                 type: string
 *                 enum: [all, news, blogs, reports, publications]
 *               key_lessons:
 *                 type: string
 *               media:
 *                 type: object
 *               tags:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: News item updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: News item not found
 *       500:
 *         description: Server error
 */
const updateNews = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const newsData = {
            title: req.body.title,
            content: req.body.content,
            status: req.body.status,
            publish_date: req.body.publish_date
                ? new Date(req.body.publish_date)
                : undefined,
            category: req.body.category,
            key_lessons: req.body.key_lessons,
            media: req.body.media,
            tags: req.body.tags,
        };
        const news = await news_service_1.newsService.updateNews(id, newsData);
        res.status(200).json({
            message: "News item updated successfully",
            news,
        });
    }
    catch (error) {
        logger.error(`Update news error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "News Update Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "News Update Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.updateNews = updateNews;
/**
 * @swagger
 * /news/{id}:
 *   delete:
 *     summary: Delete a news item
 *     tags: [News]
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
 *         description: News item deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: News item not found
 *       500:
 *         description: Server error
 */
const deleteNews = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await news_service_1.newsService.deleteNews(id);
        res.status(200).json({
            message: "News item deleted successfully",
        });
    }
    catch (error) {
        logger.error(`Delete news error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "News Deletion Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "News Deletion Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.deleteNews = deleteNews;
/**
 * @swagger
 * /news/tags:
 *   get:
 *     summary: List all news tags
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of news tags
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const listTags = async (req, res) => {
    try {
        const tags = await news_service_1.newsService.listTags();
        res.status(200).json({ tags });
    }
    catch (error) {
        logger.error("List tags error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Tag Listing Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Tag Listing Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.listTags = listTags;
/**
 * @swagger
 * /news/tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [News]
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
 *     responses:
 *       201:
 *         description: Tag created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const createTag = async (req, res) => {
    try {
        const { name } = req.body;
        const tag = await news_service_1.newsService.createTag(name);
        res.status(201).json({
            message: "Tag created successfully",
            tag,
        });
    }
    catch (error) {
        logger.error("Create tag error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Tag Creation Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Tag Creation Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.createTag = createTag;
/**
 * @swagger
 * /news/tags/{id}:
 *   delete:
 *     summary: Delete a tag
 *     tags: [News]
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
 *         description: Tag deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Server error
 */
const deleteTag = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await news_service_1.newsService.deleteTag(id);
        res.status(200).json({
            message: "Tag deleted successfully",
        });
    }
    catch (error) {
        logger.error(`Delete tag error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Tag Deletion Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Tag Deletion Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.deleteTag = deleteTag;
// Create object to export all controller functions together
exports.newsController = {
    createNews: exports.createNews,
    listNews: exports.listNews,
    getNewsById: exports.getNewsById,
    updateNews: exports.updateNews,
    deleteNews: exports.deleteNews,
    listTags: exports.listTags,
    createTag: exports.createTag,
    deleteTag: exports.deleteTag,
};
// Default export for the controller object
exports.default = exports.newsController;
