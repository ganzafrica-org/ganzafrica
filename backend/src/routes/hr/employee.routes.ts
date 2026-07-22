import { Router } from "express";
import { authenticate, requirePermission } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validation.middleware";
import * as employeesController from "@/controllers/hr/employee.controller";
import * as assetsController from "@/controllers/hr/assets.controller";
import * as employeesValidation from "@/validations/hr/employee.validation";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: HR Employees
 *   description: HR portal employee management endpoints
 */

router.use(authenticate);

router.post(
  "/",
  requirePermission("employees:manage"),
  validate(employeesValidation.createEmployeeSchema),
  employeesController.createEmployee,
);

router.get(
  "/",
  requirePermission("employees:manage"),
  validate(employeesValidation.listEmployeesSchema),
  employeesController.listEmployees,
);

router.get(
  "/me",
  requirePermission("employees:manage", "employees_self:read"),
  employeesController.getEmployee, // Handled by controller/service as self lookup
);

router.get(
  "/:id",
  requirePermission("employees:manage"),
  validate(employeesValidation.employeeIdParamSchema),
  employeesController.getEmployee,
);

router.get(
  "/:id/assets",
  requirePermission("assets:read", "assets:manage"),
  validate(employeesValidation.employeeIdParamSchema),
  assetsController.getEmployeeAssets,
);

router.patch(
  "/:id",
  requirePermission("employees:manage", "employees_self:read"), // Ownership check in controller
  validate(employeesValidation.updateEmployeeSchema),
  employeesController.updateEmployee,
);

router.delete(
  "/:id",
  requirePermission("employees:manage"), // Only HR can delete (matching original mission)
  validate(employeesValidation.employeeIdParamSchema),
  employeesController.deleteEmployee,
);

export default router;
