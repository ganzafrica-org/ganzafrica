import { Router } from "express";
import { roleController } from "../controllers/roles";
import { validate, authenticate, authorize } from "../middlewares";
import { roleValidation } from "../validations/roles.validation";
import { constants } from "../config";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management endpoints
 */

// All routes require authentication
router.use(authenticate);

// Role management routes (Admin only)
router.post(
  "/",
  authorize([constants.ROLES.ADMIN]),
  validate(roleValidation.createRoleSchema),
  roleController.createRole,
);

// Get roles list - accessible by admin and staff members
router.get("/", authorize([constants.ROLES.ADMIN, constants.ROLES.STAFF]), roleController.listRoles);

router.get(
  "/:id",
  authorize([constants.ROLES.ADMIN, constants.ROLES.STAFF]),
  validate(roleValidation.getRoleSchema),
  roleController.getRoleById,
);

router.put(
  "/:id",
  authorize([constants.ROLES.ADMIN]),
  validate(roleValidation.updateRoleSchema),
  roleController.updateRole,
);

router.delete(
  "/:id",
  authorize([constants.ROLES.ADMIN]),
  validate(roleValidation.deleteRoleSchema),
  roleController.deleteRole,
);

// User role management routes (Admin only)
router.get(
  "/users/:userId",
  authorize([constants.ROLES.ADMIN]),
  validate(roleValidation.getUserRolesSchema),
  roleController.getUserRoles,
);

router.post(
  "/users/:userId/assign/:roleId",
  authorize([constants.ROLES.ADMIN]),
  validate(roleValidation.assignRoleSchema),
  roleController.assignRoleToUser,
);

router.delete(
  "/users/:userId/remove/:roleId",
  authorize([constants.ROLES.ADMIN]),
  validate(roleValidation.removeRoleSchema),
  roleController.removeRoleFromUser,
);

export default router;