import { Request } from "express";
import { AppError } from "@/middlewares";
import type { HrRequester, HrRole } from "@/types/employee.types";

export function getHrRequester(req: Request): HrRequester {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const role = req.user.role ?? req.user.role_name;
  if (role !== "EMPLOYEE" && role !== "IT" && role !== "HR") {
    throw new AppError("Unauthorized", 401);
  }

  return {
    id: req.user.id,
    role: role as HrRole,
    email: req.user.email,
  };
}
