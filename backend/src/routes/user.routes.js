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
 *   name: Users
 *   description: User management endpoints
 */
// All routes require authentication
// router.use(authenticate);
router.post("/", (0, middlewares_1.validate)(validations_1.userValidation.createUserSchema), controllers_1.userController.createUser);
router.post("/import", (0, middlewares_1.validate)(validations_1.userValidation.importUsersSchema), controllers_1.userController.importUsers);
router.get("/", (0, middlewares_1.validate)(validations_1.userValidation.listUsersSchema), controllers_1.userController.listUsers);
router.get("/:id", (0, middlewares_1.validate)(validations_1.userValidation.getUserSchema), controllers_1.userController.getUserById);
router.put("/:id", (0, middlewares_1.validate)(validations_1.userValidation.updateUserSchema), controllers_1.userController.updateUser);
router.delete("/:id", (0, middlewares_1.validate)(validations_1.userValidation.deleteUserSchema), controllers_1.userController.deleteUser);
exports.default = router;
