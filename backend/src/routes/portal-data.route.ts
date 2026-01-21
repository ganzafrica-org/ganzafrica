import { Router } from "express";
import { portalDataController } from "../controllers/portal-data.controller";
import { authenticate } from "../middlewares";

const router = Router();

// Portal Data Routes
router.get("/teams", authenticate, portalDataController.getTeamsByType);
router.get("/projects", authenticate, portalDataController.getAllProjects);

export default router;

