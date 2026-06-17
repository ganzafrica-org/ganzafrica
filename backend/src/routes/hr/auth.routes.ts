import { Router } from "express";
import { authenticateHr, enforceHrPasswordPolicy } from "@/middlewares/hr/hr.auth.middleware";
import { validate } from "@/middlewares/validation.middleware";
import * as hrAuthController from "@/controllers/hr/hr.auth.controller";
import * as hrAuthValidation from "@/validations/hr/auth.validation";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: HR Auth
 *   description: HR portal authentication endpoints
 */

router.post(
  "/login",
  validate(hrAuthValidation.loginSchema),
  hrAuthController.loginHr
);

router.get(
  "/me",
  authenticateHr,
  enforceHrPasswordPolicy,
  hrAuthController.getMeHr
);

router.post(
  "/logout",
  authenticateHr,
  hrAuthController.logoutHr
);

export default router;
