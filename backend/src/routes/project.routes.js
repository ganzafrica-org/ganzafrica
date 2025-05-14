"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_1 = require("../controllers/project");
const middlewares_1 = require("../middlewares");
const validations_1 = require("../validations");
const upload_1 = __importDefault(require("../middlewares/upload")); // Import the upload middleware
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management endpoints
 */
// Project routes without authentication
router.post("/", (0, middlewares_1.validate)(validations_1.projectValidation.createProjectSchema), upload_1.default.array("files", 10), project_1.projectController.createProject);
// Other routes remain unchanged
router.get("/", (0, middlewares_1.validate)(validations_1.projectValidation.listProjectsSchema), project_1.projectController.listProjects);
router.get("/:id", (0, middlewares_1.validate)(validations_1.projectValidation.getProjectSchema), project_1.projectController.getProjectById);
router.put("/:id", (0, middlewares_1.validate)(validations_1.projectValidation.updateProjectSchema), upload_1.default.array("files", 10), project_1.projectController.updateProject);
router.delete("/:id", (0, middlewares_1.validate)(validations_1.projectValidation.deleteProjectSchema), project_1.projectController.deleteProject);
exports.default = router;
