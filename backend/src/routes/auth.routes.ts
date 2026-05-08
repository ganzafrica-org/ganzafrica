import { Router } from "express";
import { authController } from "../controllers";
import { validate, authenticate, requireRole } from "@/middlewares";
import { authValidation } from "../validations";
import * as hrAuthController from "../controllers/hr-auth.controller";
import * as hrAuthValidation from "@/validations/hr-auth.validation";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

// Public routes
router.post(
  "/register",
  validate(authValidation.registerSchema),
  authController.register,
);
router.post(
  "/login",
  validate(authValidation.loginSchema),
  authController.login,
);
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

// HR system additions (added only; no changes to existing routes above) ***
router.post(
  "/hr/generate-otp",
  authenticate,
  requireRole("IT"),
  validate(hrAuthValidation.generateOtpSchema),
  hrAuthController.generateOtp,
);
router.post(
  "/hr/register",
  validate(hrAuthValidation.registerSchema),
  hrAuthController.register,
);
router.post(
  "/hr/login",
  validate(hrAuthValidation.loginSchema),
  hrAuthController.login,
);
router.post(
  "/hr/refresh",
  validate(hrAuthValidation.refreshSchema),
  hrAuthController.refresh,
);
router.post("/hr/logout", authenticate, hrAuthController.logout);
router.get("/hr/me", authenticate, hrAuthController.me);

export default router;
