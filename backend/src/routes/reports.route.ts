import { Router } from "express";
import {
  getReports,
  getTeamsWithProjects,
  getTeamProjects,
  getProjectFiles,
  uploadProjectFile,
  markAsDeliverable,
  getProjectDeliverables,
  downloadFile,
  getReportAnalytics
} from "../controllers/reports.controller";
import upload from "../middlewares/upload";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Get reports with filtering
router.get("/", getReports);

// Get teams with their projects and file counts
router.get("/teams", getTeamsWithProjects);

// Get projects for a specific team
router.get("/teams/:teamId/projects", getTeamProjects);

// Get files for a specific project
router.get("/projects/:projectId/files", getProjectFiles);

// Get project deliverables
router.get("/projects/:projectId/deliverables", getProjectDeliverables);

// Upload file to a project
router.post("/projects/:projectId/upload", upload.single('file'), uploadProjectFile);

// Mark file as final deliverable
router.post("/files/:fileId/deliverable", markAsDeliverable);

// Download file
router.get("/files/:fileId/download", downloadFile);

// Get report analytics
router.get("/analytics", getReportAnalytics);

export default router;
