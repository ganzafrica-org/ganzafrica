import { z } from "zod";

const employmentType = z.enum(["fellow", "analyst", "staff", "contractor", "intern"]);

export const listEmployeesSchema = z.object({
  query: z.object({
    search: z.string().max(200).optional(),
    department: z.string().max(200).optional(),
    status: z.enum(["onboarding", "active", "on_leave", "offboarding", "exited"]).optional(),
    employment_type: employmentType.optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    sortBy: z.enum(["name", "department", "hired_at"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const employeeIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export const createEmployeeSchema = z.object({
  body: z.object({
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),
    personal_email: z.string().email(),
    work_email: z.string().email().nullable().optional(),
    employee_number: z.string().max(50).nullable().optional(),
    job_title: z.string().max(150).nullable().optional(),
    department: z.string().max(150).nullable().optional(),
    employment_type: employmentType.optional(),
    manager_id: z.string().uuid().nullable().optional(),
    hired_at: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
      .nullable()
      .optional(),
    phone: z.string().max(50).nullable().optional(),
  }),
});

// Passthrough so the SERVICE decides which keys are allowed and can name every offender in a 422.
// A whitelist here would strip disallowed keys silently, which the field-set tests must catch.
export const updateEmployeeSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.record(z.unknown()),
});

export const updateProfileSchema = z.object({
  body: z.record(z.unknown()),
});
