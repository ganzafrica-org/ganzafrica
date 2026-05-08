import { Router } from "express";
import { authenticate, requireRole, validate } from "@/middlewares";
import * as employeesController from "@/controllers/employees.controller";
import * as employeesValidation from "@/validations/employees.validation";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  requireRole("IT", "HR"),
  validate(employeesValidation.listEmployeesSchema),
  employeesController.listEmployees,
);

router.get(
  "/:id",
  authenticate,
  validate(employeesValidation.employeeIdParamSchema),
  employeesController.getEmployee,
);

router.patch(
  "/:id",
  authenticate,
  validate(employeesValidation.updateEmployeeSchema),
  employeesController.updateEmployee,
);

router.delete(
  "/:id",
  authenticate,
  requireRole("IT"),
  validate(employeesValidation.employeeIdParamSchema),
  employeesController.deleteEmployee,
);

router.patch(
  "/:id/status",
  authenticate,
  requireRole("IT"),
  validate(employeesValidation.updateEmployeeStatusSchema),
  employeesController.updateEmployeeStatus,
);

export default router;

