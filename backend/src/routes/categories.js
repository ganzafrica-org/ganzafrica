"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categories_1 = require("../controllers/categories");
const middlewares_1 = require("../middlewares");
const validations_1 = require("../validations");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Project category management endpoints
 */
// All routes require authentication
// Category routes
router.post("/", (0, middlewares_1.validate)(validations_1.categoryValidation.createCategorySchema), categories_1.categoryController.createCategory);
router.get("/", categories_1.categoryController.listCategories);
router.get("/:id", (0, middlewares_1.validate)(validations_1.categoryValidation.getCategorySchema), categories_1.categoryController.getCategoryById);
router.put("/:id", (0, middlewares_1.validate)(validations_1.categoryValidation.updateCategorySchema), categories_1.categoryController.updateCategory);
// Add the missing DELETE endpoint
router.delete("/:id", (0, middlewares_1.validate)(validations_1.categoryValidation.getCategorySchema), // Reusing the getCategorySchema for validation
categories_1.categoryController.deleteCategory);
exports.default = router;
