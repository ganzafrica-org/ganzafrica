import { Router } from "express";
import { projectController } from "../controllers/project";
import { validate } from "../middlewares";
import { projectValidation } from "../validations";
import { constants } from "../config";

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
  projectController.createProject,
);

router.get(
  "/",
  validate(projectValidation.listProjectsSchema),
  projectController.listProjects,
);

router.get(
  "/:id",
  validate(projectValidation.getProjectSchema),
  projectController.getProjectById,
);

router.put(
  "/:id",
  validate(projectValidation.updateProjectSchema),
  projectController.updateProject,
);

router.delete(
  "/:id",
  validate(projectValidation.deleteProjectSchema),
  projectController.deleteProject,
);


export default router;