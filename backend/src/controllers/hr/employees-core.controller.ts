/**
 * MOD-01 employees endpoints on the employees model. Field-set enforcement lives in the service,
 * so these controllers stay thin.
 */
import { Request, Response } from "express";
import * as employees from "@/services/hr/employees-core.service";
import { AppError } from "@/middlewares";
import { constants, Logger } from "@/config";

const logger = new Logger("EmployeesCoreController");

function handleError(res: Response, error: unknown, context: string) {
  logger.error(context, error as Error);
  if (error instanceof AppError) {
    return res
      .status(error.statusCode)
      .json({ error: context, message: error.message, code: error.code });
  }
  return res
    .status(500)
    .json({ error: context, message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
}

const actorId = (req: Request) => Number(req.user!.id);

export const listEmployees = async (req: Request, res: Response) => {
  try {
    const result = await employees.listEmployees({
      search: req.query.search as string | undefined,
      department: req.query.department as string | undefined,
      status: req.query.status as string | undefined,
      employment_type: req.query.employment_type as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sortBy: req.query.sortBy as "name" | "department" | "hired_at" | undefined,
      sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
    });
    return res.json(result);
  } catch (e) {
    return handleError(res, e, "List Employees Error");
  }
};

export const listDepartments = async (_req: Request, res: Response) => {
  try {
    return res.json({ departments: await employees.listDepartments() });
  } catch (e) {
    return handleError(res, e, "List Departments Error");
  }
};

export const getEmployee = async (req: Request, res: Response) => {
  try {
    return res.json({
      employee: await employees.getEmployeeDetail(actorId(req), req.params.id),
    });
  } catch (e) {
    return handleError(res, e, "Get Employee Error");
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    return res.status(201).json({ employee: await employees.createEmployee(req.body) });
  } catch (e) {
    return handleError(res, e, "Create Employee Error");
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    return res.json({
      employee: await employees.updateEmployeeAsHr(req.params.id, req.body),
    });
  } catch (e) {
    return handleError(res, e, "Update Employee Error");
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    return res.json({ me: await employees.getMyEmployeeRecord(actorId(req)) });
  } catch (e) {
    return handleError(res, e, "Get Me Error");
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    return res.json({ me: await employees.updateMyProfile(actorId(req), req.body) });
  } catch (e) {
    return handleError(res, e, "Update Profile Error");
  }
};
