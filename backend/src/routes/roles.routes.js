"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roles_1 = require("../controllers/roles");
const middlewares_1 = require("../middlewares");
const roles_validation_1 = require("../validations/roles.validation");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management endpoints
 */
// Role routes
router.post("/", (0, middlewares_1.validate)(roles_validation_1.roleValidation.createRoleSchema), roles_1.roleController.createRole);
router.get("/", roles_1.roleController.listRoles);
router.get("/:id", (0, middlewares_1.validate)(roles_validation_1.roleValidation.getRoleSchema), roles_1.roleController.getRoleById);
router.put("/:id", (0, middlewares_1.validate)(roles_validation_1.roleValidation.updateRoleSchema), roles_1.roleController.updateRole);
router.delete("/:id", (0, middlewares_1.validate)(roles_validation_1.roleValidation.deleteRoleSchema), roles_1.roleController.deleteRole);
// User role management routes
router.get("/users/:userId", (0, middlewares_1.validate)(roles_validation_1.roleValidation.getUserRolesSchema), roles_1.roleController.getUserRoles);
router.post("/users/:userId/assign/:roleId", (0, middlewares_1.validate)(roles_validation_1.roleValidation.assignRoleSchema), roles_1.roleController.assignRoleToUser);
router.delete("/users/:userId/remove/:roleId", (0, middlewares_1.validate)(roles_validation_1.roleValidation.removeRoleSchema), roles_1.roleController.removeRoleFromUser);
exports.default = router;
