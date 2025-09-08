import { Router } from "express";
import { projectController } from "../controllers/project";
import { validate, authenticate, authorize, handleOptionalUpload, parseFormData } from "../middlewares";
import { projectValidation } from "../validations";
import { constants } from "../config";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management endpoints
 */

// All routes require authentication
router.use(authenticate);

// Project routes
router.post(
  "/",
  handleOptionalUpload('featured_image'),
  parseFormData(['goals', 'outcomes', 'media', 'members', 'skills']),
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
  handleOptionalUpload('featured_image'),
  parseFormData(['goals', 'outcomes', 'media', 'members', 'skills']),
  validate(projectValidation.updateProjectSchema),
  projectController.updateProject,
);

router.delete(
  "/:id",
  validate(projectValidation.deleteProjectSchema),
  projectController.deleteProject,
);

// Project member routes
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

// Import projects (admin only)
router.post(
  "/import",
  authorize([constants.ROLES.ADMIN]),
  validate(projectValidation.importProjectsSchema),
  projectController.importProjects,
);

export default router;
