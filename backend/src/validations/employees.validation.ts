import { z } from "zod";

export const listEmployeesSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 10)),
    department: z.string().optional(),
    status: z.enum(["ACTIVE", "ON_LEAVE", "INACTIVE"]).optional(),
    location: z.string().optional(),
    sortBy: z.enum(["name", "joinDate"]).optional().default("joinDate"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
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
    department: z.string().optional().nullable(),
    position: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
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

