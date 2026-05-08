import { Router } from "express";
import { authenticate, requireRole, validate } from "@/middlewares";
import * as leaveController from "@/controllers/leave.controller";
import * as leaveValidation from "@/validations/leave.validation";

const router: Router = Router();

router.use(authenticate);

router.get("/", validate(leaveValidation.listLeaveSchema), leaveController.listLeave);
router.get("/:id", validate(leaveValidation.leaveIdParamSchema), leaveController.getLeave);
router.post(
  "/",
  requireRole("EMPLOYEE", "IT"),
  validate(leaveValidation.createLeaveSchema),
  leaveController.createLeave,
);
router.patch(
  "/:id/review",
  requireRole("HR"),
  validate(leaveValidation.reviewLeaveSchema),
  leaveController.reviewLeave,
);
router.delete(
  "/:id",
  requireRole("EMPLOYEE", "IT"),
  validate(leaveValidation.leaveIdParamSchema),
  leaveController.cancelLeave,
);

export default router;

