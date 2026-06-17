import { z } from "zod";

export const listEmployeesSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    department: z.string().optional(),
    status: z.enum(["ACTIVE", "ON_LEAVE", "INACTIVE"]).optional(),
    location: z.string().optional(),
    sortBy: z.enum(["name", "joinDate"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const employeeIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid employee id"),
  }),
});

export const updateEmployeeSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid employee id"),
  }),
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    department: z.string().nullable().optional(),
    position: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    email: z.string().email().optional(),
    role: z.enum(["EMPLOYEE", "IT", "HR"]).optional(),
  }),
});

export const updateEmployeeStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid employee id"),
  }),
  body: z.object({
    status: z.enum(["ACTIVE", "ON_LEAVE", "INACTIVE"]),
  }),
});
