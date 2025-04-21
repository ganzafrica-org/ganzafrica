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

// Project member routes without authentication
router.post(
  "/:id/members",
  validate(projectValidation.addProjectMemberSchema),
  projectController.addProjectMember,
);

router.delete(
  "/:id/members/:userId",
  validate(projectValidation.removeProjectMemberSchema),
  projectController.removeProjectMember,
);

// Import projects (still need admin role)
router.post(
  "/import",
  validate(projectValidation.importProjectsSchema),
  projectController.importProjects,
);

export default router;