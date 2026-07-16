import { Router } from "express";
import { projectController } from "../controllers/project";
import { validate } from "../middlewares";
import { projectValidation } from "../validations";
import { constants } from "../config";
import upload from "../middlewares/upload"; // Import the upload middleware

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management endpoints
 */

// Project routes without authentication
router.post(
  "/",
  validate(projectValidation.createProjectSchema),
  upload.array("files", 10),
  projectController.createProject,
);

// Other routes remain unchanged
router.get("/", validate(projectValidation.listProjectsSchema), projectController.listProjects);

router.get("/:id", validate(projectValidation.getProjectSchema), projectController.getProjectById);

router.put(
  "/:id",
  validate(projectValidation.updateProjectSchema),
  upload.array("files", 10),
  projectController.updateProject,
);

router.post(
  "/:id/publish",
  validate(projectValidation.getProjectSchema),
  projectController.publishProject,
);

router.delete(
  "/:id",
  validate(projectValidation.deleteProjectSchema),
  projectController.deleteProject,
);

export default router;
