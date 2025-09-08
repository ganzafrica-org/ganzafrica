import { Router } from "express";
import { userController } from "../controllers";
import { validate, authenticate, authorize, handleOptionalUpload, parseFormData } from "@/middlewares";
import { userValidation } from "../validations";
import { constants } from "../config";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

// All routes require authentication
router.use(authenticate);

// Admin-only routes
router.post(
  "/",
  authorize([constants.ROLES.ADMIN]),
  handleOptionalUpload('avatar'),
  validate(userValidation.createUserSchema),
  userController.createUser,
);
router.post(
  "/import",
  authorize([constants.ROLES.ADMIN]),
  validate(userValidation.importUsersSchema),
  userController.importUsers,
);

// Mixed access routes (admin or self)
router.get(
  "/",
  authorize([constants.ROLES.ADMIN]),
  validate(userValidation.listUsersSchema),
  userController.listUsers,
);
router.get(
  "/:id",
  validate(userValidation.getUserSchema),
  userController.getUserById,
);
router.put(
  "/:id",
  handleOptionalUpload('avatar'),
  validate(userValidation.updateUserSchema),
  userController.updateUser,
);
router.delete(
  "/:id",
  authorize([constants.ROLES.ADMIN]),
  validate(userValidation.deleteUserSchema),
  userController.deleteUser,
);

export default router;
