/**
 * MOD-01 employees routes on the employees model. The legacy hr_users-backed controller is retired
 * with this module.
 *
 * `/me` and `/me/profile` gate on `authenticate` and resolve the caller's own row in the service;
 * everything else is HR-managed. Detail (`GET /:id`) also takes `employees_self:read` so an
 * employee can open their own profile — the service enforces "own row only".
 */
import { Router } from "express";
import { authenticate, requirePermission } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validation.middleware";
import * as c from "@/controllers/hr/employees-core.controller";
import * as v from "@/validations/hr/employees-core.validation";
import * as assetsController from "@/controllers/hr/assets.controller";
import * as assetsValidation from "@/validations/hr/assets.validation";
import * as orgController from "@/controllers/hr/org.controller";
import * as orgValidation from "@/validations/hr/org.validation";

const router: Router = Router();

router.use(authenticate);

// Self-service — must precede /:id so "me" is not parsed as a uuid.
router.get("/me", c.getMe);
router.patch("/me/profile", validate(v.updateProfileSchema), c.updateMyProfile);

router.get(
  "/",
  requirePermission("employees:read", "employees:manage"),
  validate(v.listEmployeesSchema),
  c.listEmployees,
);
router.get(
  "/departments",
  requirePermission("employees:read", "employees:manage"),
  c.listDepartments,
);
router.post(
  "/",
  requirePermission("employees:manage"),
  validate(v.createEmployeeSchema),
  c.createEmployee,
);
router.get(
  "/:id",
  requirePermission("employees:read", "employees:manage", "employees_self:read"),
  validate(v.employeeIdSchema),
  c.getEmployee,
);
router.patch(
  "/:id",
  requirePermission("employees:manage"),
  validate(v.updateEmployeeSchema),
  c.updateEmployee,
);

// MOD-04 §4 — LCM-02's offboarding gate query. Response shape (assetId, assignedAt,
// returnedAt, ...) is frozen once LCM-02 consumes it — see MOD-04 spec §Coordination.
router.get(
  "/:id/assets",
  requirePermission("assets:read", "assets:manage"),
  validate(assetsValidation.employeeAssetsSchema),
  assetsController.getEmployeeAssets,
);

// MOD-02: reassign/clear a manager (cycle-checked in org.service.ts::setManager).
router.patch(
  "/:id/manager",
  requirePermission("employees:manage"),
  validate(orgValidation.setManagerSchema),
  orgController.setManager,
);
// MOD-02: employees:read/manage see anyone's reports; the controller also lets a manager read
// their own (ownership check, not a permission — no bare `authenticate` per auth-and-rbac.md §7,
// so this still declares the same permission set as the read-adjacent detail route above and the
// controller widens it for the self case).
router.get(
  "/:id/reports",
  requirePermission("employees:read", "employees:manage", "employees_self:read"),
  validate(orgValidation.getReportsSchema),
  orgController.getReports,
);

export default router;
