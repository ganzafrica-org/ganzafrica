"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const validations_1 = require("../validations");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */
// Public routes
router.post("/register", (0, middlewares_1.validate)(validations_1.authValidation.registerSchema), controllers_1.authController.register);
router.post("/login", (0, middlewares_1.validate)(validations_1.authValidation.loginSchema), controllers_1.authController.login);
router.post("/verify-email", (0, middlewares_1.validate)(validations_1.authValidation.verifyEmailSchema), controllers_1.authController.verifyEmail);
router.post("/forgot-password", (0, middlewares_1.validate)(validations_1.authValidation.forgotPasswordSchema), controllers_1.authController.forgotPassword);
router.post("/reset-password", (0, middlewares_1.validate)(validations_1.authValidation.resetPasswordSchema), controllers_1.authController.resetPassword);
router.post("/refresh-token", (0, middlewares_1.validate)(validations_1.authValidation.refreshTokenSchema), controllers_1.authController.refreshToken);
// Protected routes
router.post("/logout", middlewares_1.authenticate, controllers_1.authController.logout);
router.get("/me", middlewares_1.authenticate, controllers_1.authController.getCurrentUser);
exports.default = router;
