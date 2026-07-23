import { z } from "zod";

const numericIdParam = z
  .string()
  .refine((v) => !Number.isNaN(parseInt(v)), { message: "ID must be a number" })
  .transform((v) => parseInt(v));

const leaveType = z.enum(["ANNUAL", "SICK", "MATERNITY", "PATERNITY", "UNPAID", "OTHER"]);
const isoDate = z.coerce.date();

export const uuidIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export const requestLeaveSchema = z.object({
  body: z.object({
    type: leaveType,
    startDate: isoDate,
    endDate: isoDate,
    reason: z.string().max(2000).optional(),
  }),
});

export const requestLeaveForEmployeeSchema = z.object({
  params: z.object({ employeeId: z.string().uuid() }),
  body: requestLeaveSchema.shape.body,
});

export const decideLeaveSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ note: z.string().max(2000).optional() }),
});

export const myLeaveQuerySchema = z.object({
  query: z.object({ year: z.coerce.number().int().min(2000).max(2100).optional() }),
});

export const calendarQuerySchema = z.object({
  query: z.object({ from: isoDate, to: isoDate }),
});

export const createPolicySchema = z.object({
  body: z.object({
    employment_type: z.enum(["fellow", "analyst", "staff", "contractor", "intern"]),
    type: leaveType,
    annual_days: z.coerce.number().min(0).max(365),
    max_carry_over: z.coerce.number().min(0).max(365).optional(),
  }),
});

export const updatePolicySchema = z.object({
  params: z.object({ id: numericIdParam }),
  body: z.object({
    annual_days: z.coerce.number().min(0).max(365).optional(),
    max_carry_over: z.coerce.number().min(0).max(365).optional(),
  }),
});

export const policyIdSchema = z.object({ params: z.object({ id: numericIdParam }) });

export const createHolidaySchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
    name: z.string().min(1).max(200),
  }),
});

export const holidayQuerySchema = z.object({
  query: z.object({ year: z.coerce.number().int().min(2000).max(2100).optional() }),
});

export const adjustBalanceSchema = z.object({
  params: z.object({ id: numericIdParam }),
  body: z.object({
    entitled_days: z.coerce.number().min(0).max(365).optional(),
    carried_over_days: z.coerce.number().min(0).max(365).optional(),
    used_days: z.coerce.number().min(0).max(365).optional(),
    note: z.string().min(1, "An adjustment note is required").max(2000),
  }),
});
