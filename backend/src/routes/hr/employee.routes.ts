import { Router } from "express";
import { authenticateHr, enforceHrPasswordPolicy } from "@/middlewares/hr/hr.auth.middleware";
import { requireRole } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validation.middleware";
import * as employeesController from "@/controllers/hr/employee.controller";
import * as employeesValidation from "@/validations/hr/employee.validation";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: HR Employees
 *   description: HR portal employee management endpoints
 */

router.use(authenticateHr, enforceHrPasswordPolicy);

router.post("/", requireRole("IT"), validate(employeesValidation.createEmployeeSchema), employeesController.createEmployee)

router.get(
  "/",
  requireRole("IT", "HR"),
  validate(employeesValidation.listEmployeesSchema),
  employeesController.listEmployees
);

router.get(
  "/me",
  requireRole("EMPLOYEE", "IT", "HR"),
  employeesController.getEmployee // Handled by controller/service as self lookup
);

router.get(
  "/:id",
  requireRole("IT", "HR"),
  validate(employeesValidation.employeeIdParamSchema),
  employeesController.getEmployee
);

router.patch(
  "/:id",
  requireRole("EMPLOYEE", "IT", "HR"), // Ownership check in controller
  validate(employeesValidation.updateEmployeeSchema),
  employeesController.updateEmployee
);

router.delete(
  "/:id",
  requireRole("HR"), // Only HR can delete (matching original mission)
  validate(employeesValidation.employeeIdParamSchema),
  employeesController.deleteEmployee
);

export default router;
