"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const news_controller_1 = require("../controllers/news.controller");
const middlewares_1 = require("../middlewares");
const news_validation_1 = require("../validations/news.validation");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: News
 *   description: News and content management endpoints
 */
// Tag routes - placing these first to avoid path conflicts
router.get("/tags", news_controller_1.newsController.listTags);
router.post("/tags", (0, middlewares_1.validate)(news_validation_1.newsValidation.createTagSchema), news_controller_1.newsController.createTag);
router.delete("/tags/:id", (0, middlewares_1.validate)(news_validation_1.newsValidation.deleteTagSchema), news_controller_1.newsController.deleteTag);
// News routes
router.post("/", (0, middlewares_1.validate)(news_validation_1.newsValidation.createNewsSchema), news_controller_1.newsController.createNews);
router.get("/", (0, middlewares_1.validate)(news_validation_1.newsValidation.listNewsSchema), news_controller_1.newsController.listNews);
router.get("/:id", (0, middlewares_1.validate)(news_validation_1.newsValidation.getNewsSchema), news_controller_1.newsController.getNewsById);
router.put("/:id", (0, middlewares_1.validate)(news_validation_1.newsValidation.updateNewsSchema), news_controller_1.newsController.updateNews);
router.delete("/:id", (0, middlewares_1.validate)(news_validation_1.newsValidation.deleteNewsSchema), news_controller_1.newsController.deleteNews);
exports.default = router;
