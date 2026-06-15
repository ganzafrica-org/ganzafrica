import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@/utils/sendResponse";
import * as employeesService from "@/services/employees.service";

export const listEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.query as unknown as {
      page: string;
      limit: string;
      department?: string;
      status?: string;
      location?: string;
      sortBy?: string;
      sortOrder?: string;
    };

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const { data, total } = await employeesService.listEmployees(
      { id: req.user!.id, role: req.user!.role, email: req.user!.email },
      {
        page,
        limit,
        department: query.department,
        status: query.status as employeesService.UserStatus | undefined,
        location: query.location,
        sortBy: (query.sortBy as "name" | "joinDate") || "joinDate",
        sortOrder: (query.sortOrder as "asc" | "desc") || "desc",
      },
    );

    sendResponse(res, {
      success: true,
      message: "Employees fetched",
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employee = await employeesService.getEmployeeById(
      { id: req.user!.id, role: req.user!.role, email: req.user!.email },
      req.params.id,
    );

    sendResponse(res, {
      success: true,
      message: "Employee fetched",
      data: employee,
    });
  } catch (err) {
    next(err);
  }
};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await employeesService.updateEmployee(
      { id: req.user!.id, role: req.user!.role, email: req.user!.email },
      req.params.id,
      req.body,
    );

    sendResponse(res, {
      success: true,
      message: "Employee updated",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await employeesService.deleteEmployee(
      { id: req.user!.id, role: req.user!.role, email: req.user!.email },
      req.params.id,
    );

    sendResponse(res, {
      success: true,
      message: "Employee deleted",
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

export const updateEmployeeStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await employeesService.updateEmployeeStatus(
      { id: req.user!.id, role: req.user!.role, email: req.user!.email },
      req.params.id,
      req.body.status,
    );

    sendResponse(res, {
      success: true,
      message: "Employee status updated",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
