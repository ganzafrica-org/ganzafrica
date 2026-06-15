import { Router } from "express";
import { authenticateHr, requireRole, validate } from "@/middlewares";
import * as employeesController from "@/controllers/employees.controller";
import * as employeesValidation from "@/validations/employees.validation";

const router: Router = Router();

router.get(
  "/",
  authenticateHr,
  requireRole("IT", "HR"),
  validate(employeesValidation.listEmployeesSchema),
  employeesController.listEmployees,
);

router.get(
  "/:id",
  authenticateHr,
  validate(employeesValidation.employeeIdParamSchema),
  employeesController.getEmployee,
);

router.patch(
  "/:id",
  authenticateHr,
  validate(employeesValidation.updateEmployeeSchema),
  employeesController.updateEmployee,
);

router.delete(
  "/:id",
  authenticateHr,
  requireRole("IT"),
  validate(employeesValidation.employeeIdParamSchema),
  employeesController.deleteEmployee,
);

router.patch(
  "/:id/status",
  authenticateHr,
  requireRole("IT"),
  validate(employeesValidation.updateEmployeeStatusSchema),
  employeesController.updateEmployeeStatus,
);

export default router;

