import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@/utils/sendResponse";
import { AppError } from "@/middlewares";
import * as employeesService from "@/services/hr/employee.service";
import { HrRole } from "@/types/employee.types";

/**
 * @swagger
 * /hr/employees:
 *   get:
 *     summary: List employees
 *     tags: [HR Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employees fetched
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * /hr/employees/{id}:
 *   get:
 *     summary: Get employee details
 *     tags: [HR Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Employee fetched
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   patch:
 *     summary: Update employee
 *     tags: [HR Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HrEmployee'
 *     responses:
 *       200:
 *         description: Employee updated
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete employee
 *     tags: [HR Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Employee deleted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

export const createEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employee = await employeesService.createEmployee(
      { id: req.user!.id, role: req.user!.role as HrRole, email: req.user!.email },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        personalEmail: req.body.personalEmail,
        workEmail: req.body.workEmail ?? null,
        phone: req.body.phone ?? null,
        citizenship: req.body.citizenship ?? null,
        homeCountry: req.body.homeCountry ?? null,
        homeCity: req.body.homeCity ?? null,
        role: req.body.role,
        platformUserId: req.body.platformUserId,
      },
    );

    sendResponse(res, {
      success: true,
      message: "Employee created",
      data: employee,
    });
  } catch (err) {
    next(err);
  }
};

export const listEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.query as any;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const { data, total } = await employeesService.listEmployees(
      { id: req.user!.id, role: req.user!.role as HrRole, email: req.user!.email },
      {
        page,
        limit,
        status: query.status,
        location: query.location,
        sortBy: query.sortBy || "joinDate",
        sortOrder: query.sortOrder || "desc",
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
      { id: req.user!.id, role: req.user!.role as HrRole, email: req.user!.email },
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
    // Ownership check: EMPLOYEE can only update their own profile
    if (req.user!.role === "EMPLOYEE" && req.params.id !== req.user!.id) {
      throw new AppError("You can only modify your own profile", 403);
    }

    const updated = await employeesService.updateEmployee(
      { id: req.user!.id, role: req.user!.role as HrRole, email: req.user!.email },
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
    await employeesService.softDeleteEmployee(
      { id: req.user!.id, role: req.user!.role as HrRole, email: req.user!.email },
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
