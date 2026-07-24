import { Router } from "express";
import { authController } from "../controllers";
import { validate, authenticate } from "../middlewares";
import { authValidation } from "../validations";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

// Public routes
router.post("/register", validate(authValidation.registerSchema), authController.register);
router.post("/login", validate(authValidation.loginSchema), authController.login);
router.post(
  "/verify-email",
  validate(authValidation.verifyEmailSchema),
  authController.verifyEmail,
);
router.post(
  "/forgot-password",
  validate(authValidation.forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  validate(authValidation.resetPasswordSchema),
  authController.resetPassword,
);
router.post(
  "/refresh-token",
  validate(authValidation.refreshTokenSchema),
  authController.refreshToken,
);

// Protected routes
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getCurrentUser);

// SSO handoff (FND-06): portal mints a one-time code; the target app exchanges it for a session.
router.post("/handoff", authenticate, authController.createHandoff);
router.post("/handoff/exchange", authController.exchangeHandoff);

export default router;
