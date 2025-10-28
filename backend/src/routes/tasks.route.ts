import { Router } from "express";
import * as taskController from "../controllers/task.controller";
import { authenticate } from "../middlewares";
import upload from "../middlewares/upload";

const router = Router();

// Task Routes
router.post("/", authenticate, taskController.createTask);
router.post("/unrestricted", authenticate, taskController.createTaskUnrestricted);
router.get("/user/assigned", authenticate, taskController.getTasksByUser);
router.get("/all", authenticate, taskController.getAllTasks);
router.get("/projects", authenticate, taskController.getTaskTeamProjects);
router.get("/:id", authenticate, taskController.getTaskById);
router.get("/:id/unrestricted", authenticate, taskController.getTaskByIdUnrestricted);
router.get("/project/:projectId", authenticate, taskController.listTasksByProject);
router.get("/project/:projectId/files", authenticate, taskController.getProjectFilesWithRoleFilter);
router.put("/:id", authenticate, taskController.updateTask);
router.put("/:id/unrestricted", authenticate, taskController.updateTaskUnrestricted);
router.delete("/:id", authenticate, taskController.deleteTask);
router.delete("/:id/unrestricted", authenticate, taskController.deleteTaskUnrestricted);

// Task Comments
router.post("/:id/comments", authenticate, taskController.addTaskComment);
router.put("/:id/comments/:commentId", authenticate, taskController.updateTaskComment);
router.delete("/:id/comments/:commentId", authenticate, taskController.deleteTaskComment);

// Task File Uploads - uses Digital Ocean Spaces (same as portal)
router.post("/:id/upload", authenticate, upload.array('files', 10), taskController.uploadTaskAttachments);

export default router;

