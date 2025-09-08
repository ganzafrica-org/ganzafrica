import { Router } from "express";
import { teamController } from "../controllers/team-controller";
import { validate, authenticate, handleOptionalUpload, parseFormData } from "../middlewares";
import { teamValidation } from "../validations/team-validation";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Team member management endpoints
 */

// All routes require authentication
router.use(authenticate);

// Team routes - support both JSON and multipart/form-data
router.post(
  "/",
  handleOptionalUpload('photo'), // Handle optional photo upload
  parseFormData(['skills']), // Parse JSON fields in form data
  validate(teamValidation.createTeamSchema),
  teamController.createTeam,
);

router.get(
  "/",
  validate(teamValidation.listTeamsSchema),
  teamController.listTeams,
);

router.get(
  "/:id",
  validate(teamValidation.getTeamSchema),
  teamController.getTeamById,
);

router.put(
  "/:id",
  handleOptionalUpload('photo'), // Handle optional photo upload
  parseFormData(['skills']), // Parse JSON fields in form data
  validate(teamValidation.updateTeamSchema),
  teamController.updateTeam,
);

router.delete(
  "/:id",
  validate(teamValidation.deleteTeamSchema),
  teamController.deleteTeam,
);


export default router;
