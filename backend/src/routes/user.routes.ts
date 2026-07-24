import { Router } from "express";
import { userController } from "../controllers";
import { validate, authenticate, authorize } from "../middlewares";
import { userValidation } from "../validations";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

// Routes without authentication for testing (will add back later)
router.delete("/:id", validate(userValidation.deleteUserSchema), userController.deleteUser);

router.get("/", validate(userValidation.listUsersSchema), userController.listUsers);

// All other routes require authentication
router.use(authenticate);

router.post("/", validate(userValidation.createUserSchema), userController.createUser);

router.post("/import", validate(userValidation.importUsersSchema), userController.importUsers);

// Profile endpoints (must be before /:id routes to avoid route conflicts)
router.get("/profile/me", userController.getCurrentUserProfile);
router.put(
  "/profile/me",
  validate(userValidation.updateProfileSchema),
  userController.updateCurrentUserProfile,
);

router.get("/:id", validate(userValidation.getUserSchema), userController.getUserById);

router.put("/:id", validate(userValidation.updateUserSchema), userController.updateUser);

router.post(
  "/:id/activate",
  validate(userValidation.deleteUserSchema),
  userController.activateUser,
);

router.post(
  "/:id/deactivate",
  validate(userValidation.deleteUserSchema),
  userController.deactivateUser,
);

export default router;
