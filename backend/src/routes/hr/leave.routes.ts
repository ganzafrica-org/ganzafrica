/**
 * Legacy `/hr/leaves` mount. Mutations moved to MOD-06 (`/hr/me/leave`, `/hr/leave/:id/*`); only
 * the admin list and detail remain, on the employees model.
 */
import { Router } from "express";
import { authenticate, requirePermission } from "../../middlewares";
import * as leaveController from "../../controllers/hr/leave.controller";

const router: Router = Router();

router.use(authenticate);

router.get("/", requirePermission("leave:manage"), leaveController.listAllLeaves);
router.get("/:id", requirePermission("leave:manage"), leaveController.getLeave);

export default router;
