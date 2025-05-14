"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const team_controller_1 = require("../controllers/team-controller");
const middlewares_1 = require("../middlewares");
const team_validation_1 = require("../validations/team-validation");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Team member management endpoints
 */
// All routes require authentication
// router.use(authenticate);
// Team routes
router.post("/", (0, middlewares_1.validate)(team_validation_1.teamValidation.createTeamSchema), team_controller_1.teamController.createTeam);
router.get("/", (0, middlewares_1.validate)(team_validation_1.teamValidation.listTeamsSchema), team_controller_1.teamController.listTeams);
router.get("/:id", (0, middlewares_1.validate)(team_validation_1.teamValidation.getTeamSchema), team_controller_1.teamController.getTeamById);
router.put("/:id", (0, middlewares_1.validate)(team_validation_1.teamValidation.updateTeamSchema), team_controller_1.teamController.updateTeam);
router.delete("/:id", (0, middlewares_1.validate)(team_validation_1.teamValidation.deleteTeamSchema), team_controller_1.teamController.deleteTeam);
exports.default = router;
