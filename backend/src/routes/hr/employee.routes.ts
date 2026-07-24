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

export default router;
