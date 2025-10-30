import { Router } from "express";
import { taskTeamController } from "../controllers/task-team.controller";
import { authenticate } from "../middlewares";

const router = Router();

// Task Teams Routes
router.post("/", authenticate, taskTeamController.createTaskTeam);
router.get("/", authenticate, taskTeamController.listTaskTeams);
router.get("/:id", authenticate, taskTeamController.getTaskTeamById);
router.put("/:id", authenticate, taskTeamController.updateTaskTeam);
router.delete("/:id", authenticate, taskTeamController.deleteTaskTeam);

// Task Team Members Routes
router.post("/:id/members", authenticate, taskTeamController.addTeamMember);
router.delete("/:id/members/:userId", authenticate, taskTeamController.removeTeamMember);
router.patch("/:id/members/:userId/role", authenticate, taskTeamController.updateTeamMemberRole);

// Task Team Projects Routes
router.post("/:id/projects", authenticate, taskTeamController.createTaskProject);
router.get("/:id/projects", authenticate, taskTeamController.listTaskProjects);

// Task Projects Routes (standalone)
router.get("/projects/all", authenticate, taskTeamController.listAllProjects);
router.get("/projects/:id", authenticate, taskTeamController.getTaskProjectById);
router.put("/projects/:id", authenticate, taskTeamController.updateTaskProject);
router.delete("/projects/:id", authenticate, taskTeamController.deleteTaskProject);

// Task Project Members Routes
router.post("/projects/:id/members", authenticate, taskTeamController.addProjectMember);
router.delete("/projects/:id/members/:userId", authenticate, taskTeamController.removeProjectMember);

export default router;

