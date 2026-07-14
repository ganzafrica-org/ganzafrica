import { z } from "zod";

export const listEmployeesSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    department: z.string().optional(),
    status: z.enum(["ACTIVE", "ON_LEAVE", "INACTIVE", "TERMINATED"]).optional(),
    sortBy: z.enum(["name", "hireDate"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const employeeIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid employee id"),
  }),
});

export const createEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    personalEmail: z.string().email(),
    workEmail: z.string().email().nullable().optional(),
    phone: z.string().nullable().optional(),
    citizenship: z.string().nullable().optional(),
    homeCountry: z.string().nullable().optional(),
    homeCity: z.string().nullable().optional(),
    role: z.enum(["EMPLOYEE", "IT", "HR"]).optional(),
    platformUserId: z.number().int().optional(),
  }),
});

export const updateEmployeeSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid employee id"),
  }),
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    personalEmail: z.string().email().optional(),
    workEmail: z.string().email().nullable().optional(),
    phone: z.string().nullable().optional(),
    citizenship: z.string().nullable().optional(),
    homeCountry: z.string().nullable().optional(),
    homeCity: z.string().nullable().optional(),
  }),
});

export const updateEmployeeStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid employee id"),
  }),
  body: z.object({
    status: z.enum(["ACTIVE", "ON_LEAVE", "INACTIVE", "TERMINATED"]),
  }),
});