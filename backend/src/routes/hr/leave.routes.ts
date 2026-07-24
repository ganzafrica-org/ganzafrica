import { Router } from "express";
import { authenticate, requirePermission, validate } from "../../middlewares";
import * as leaveController from "../../controllers/hr/leave.controller";
import * as leaveValidation from "../../validations/hr/leave.validation";

const router: Router = Router();

router.use(authenticate);

router.get(
  "/",
  requirePermission("leave:manage"),
  validate(leaveValidation.listAllLeavesSchema),
  leaveController.listAllLeaves,
);
router.patch(
  "/:id",
  requirePermission("leave:manage", "leave_self:request"),
  validate(leaveValidation.updateLeaveSchema),
  leaveController.updateLeave,
);
router.delete(
  "/:id",
  requirePermission("leave:manage", "leave_self:request"),
  validate(leaveValidation.leaveIdParamSchema),
  leaveController.cancelLeave,
);
router.post(
  "/:id/approve",
  requirePermission("leave:approve"),
  validate(leaveValidation.leaveIdParamSchema),
  leaveController.approveLeave,
);
router.post(
  "/:id/reject",
  requirePermission("leave:approve"),
  validate(leaveValidation.leaveIdParamSchema),
  leaveController.rejectLeave,
);

export default router;
