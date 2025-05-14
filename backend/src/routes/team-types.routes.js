"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const team_type_controller_1 = require("../controllers/team-type-controller");
const middlewares_1 = require("../middlewares");
const team_validation_1 = require("../validations/team-validation");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: TeamTypes
 *   description: Team type management endpoints
 */
// All routes require authentication
// router.use(authenticate);
// Team type routes
router.post("/", (0, middlewares_1.validate)(team_validation_1.teamTypeValidation.createTeamTypeSchema), team_type_controller_1.teamTypeController.createTeamType);
router.get("/", team_type_controller_1.teamTypeController.listTeamTypes);
router.get("/:id", (0, middlewares_1.validate)(team_validation_1.teamTypeValidation.getTeamTypeSchema), team_type_controller_1.teamTypeController.getTeamTypeById);
router.put("/:id", (0, middlewares_1.validate)(team_validation_1.teamTypeValidation.updateTeamTypeSchema), team_type_controller_1.teamTypeController.updateTeamType);
router.delete("/:id", (0, middlewares_1.validate)(team_validation_1.teamTypeValidation.deleteTeamTypeSchema), team_type_controller_1.teamTypeController.deleteTeamType);
exports.default = router;
