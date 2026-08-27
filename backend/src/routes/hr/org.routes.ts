import { Router } from "express";
import { authenticate, requirePermission } from "@/middlewares/auth.middleware";
import * as orgController from "@/controllers/hr/org.controller";

const router: Router = Router();

router.use(authenticate);

// Every employee sees the chart (org_chart:read is seeded to the `employee` role).
router.get("/", requirePermission("org_chart:read"), orgController.getChart);
router.get("/unresolved", requirePermission("employees:manage"), orgController.getUnresolved);

export default router;
