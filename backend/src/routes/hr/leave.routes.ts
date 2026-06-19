import { Router } from "express";
import { authenticateHr, enforceHrPasswordPolicy, requireRole, validate } from "../../middlewares";
import * as leaveController from "../../controllers/hr/leave.controller";
import * as leaveValidation from "../../validations/hr/leave.validation";

const router: Router = Router();

router.use(authenticateHr, enforceHrPasswordPolicy);

router.get(
  "/",
  requireRole("HR"),
  validate(leaveValidation.listAllLeavesSchema),
  leaveController.listAllLeaves,
);
router.patch(
  "/:id",
  requireRole("HR", "EMPLOYEE"),
  validate(leaveValidation.updateLeaveSchema),
  leaveController.updateLeave,
);
router.delete(
  "/:id",
  requireRole("HR", "EMPLOYEE"),
  validate(leaveValidation.leaveIdParamSchema),
  leaveController.cancelLeave,
);
router.post(
  "/:id/approve",
  requireRole("HR"),
  validate(leaveValidation.leaveIdParamSchema),
  leaveController.approveLeave,
);
router.post(
  "/:id/reject",
  requireRole("HR"),
  validate(leaveValidation.leaveIdParamSchema),
  leaveController.rejectLeave,
);

export default router;
