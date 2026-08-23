/**
 * MOD-06 routes (employees model). Mounted alongside the legacy `/hr/leaves` CRUD, which stays
 * until FND-07's contract phase.
 *
 * Approval endpoints gate on `authenticate` only: authority is a relationship (the requester's
 * manager) that `requirePermission` cannot express, so `decideLeave` enforces manager-or-HR and
 * returns 403 itself.
 */
import { Router } from "express";
import { authenticate, requirePermission } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validation.middleware";
import { privateUpload } from "@/middlewares/upload";
import * as c from "@/controllers/hr/leave-core.controller";
import * as v from "@/validations/hr/leave-core.validation";

const router: Router = Router();

const manage = [authenticate, requirePermission("leave:manage")];
const self = [authenticate, requirePermission("leave_self:request", "leave:manage")];

// Self-service
router.get("/me/leave", authenticate, validate(v.myLeaveQuerySchema), c.getMyLeave);
router.post("/me/leave", ...self, validate(v.requestLeaveSchema), c.requestMyLeave);
router.post("/me/leave/validate", ...self, validate(v.requestLeaveSchema), c.validateMyLeave);

// Approvals — authority resolved in the service (manager chain or leave:manage).
router.get("/leave/pending-approvals", authenticate, c.pendingApprovals);

// Role-scoped request list (any status) — visibility resolved in the service (own + reports, or
// everyone for HR/admin). Backs the "Leave Requests" table.
router.get("/leave/requests", authenticate, c.visibleLeaves);
router.post("/leave/:id/approve", authenticate, validate(v.decideLeaveSchema), c.approveLeave);
router.post("/leave/:id/reject", authenticate, validate(v.decideLeaveSchema), c.rejectLeave);
router.post("/leave/:id/cancel", authenticate, validate(v.uuidIdSchema), c.cancelLeave);

// Attachments (optional) — relationship check (owner/approver/HR) resolved in the service, same
// convention as approve/reject above.
router.post(
  "/leave/:id/attachments",
  authenticate,
  privateUpload.single("file"),
  validate(v.uuidIdSchema),
  c.addLeaveAttachment,
);
router.get(
  "/leave/:id/attachments",
  authenticate,
  validate(v.uuidIdSchema),
  c.listLeaveAttachments,
);

router.get("/leave/calendar", authenticate, validate(v.calendarQuerySchema), c.calendar);

// HR filing on someone's behalf
router.post(
  "/employees/:employeeId/leave",
  ...manage,
  validate(v.requestLeaveForEmployeeSchema),
  c.requestLeaveForEmployee,
);

// Settings
router.get("/leave-policies", ...manage, c.listPolicies);
router.post("/leave-policies", ...manage, validate(v.createPolicySchema), c.createPolicy);
router.patch("/leave-policies/:id", ...manage, validate(v.updatePolicySchema), c.updatePolicy);
router.delete("/leave-policies/:id", ...manage, validate(v.policyIdSchema), c.deletePolicy);

router.get("/holidays", authenticate, validate(v.holidayQuerySchema), c.listHolidays);
router.post("/holidays", ...manage, validate(v.createHolidaySchema), c.createHoliday);
router.delete("/holidays/:id", ...manage, validate(v.policyIdSchema), c.deleteHoliday);

router.patch("/leave-balances/:id", ...manage, validate(v.adjustBalanceSchema), c.adjustBalance);

export default router;
