import { z } from "zod";

const employeeId = z.string().uuid("Invalid employee id");
const leaveId = z.string().uuid("Invalid leave id");

const leaveBodyBase = {
  type: z.enum(["ANNUAL", "SICK", "MATERNITY", "PATERNITY", "UNPAID", "OTHER"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().optional().nullable(),
};

export const listAllLeavesSchema = z.object({
  query: z.object({}).optional(),
});

export const listEmployeeLeavesSchema = z.object({
  params: z.object({ employeeId }),
});

export const leaveIdParamSchema = z.object({
  params: z.object({ id: leaveId }),
});

export const createLeaveSchema = z.object({
  params: z.object({ employeeId }),
  body: z.object(leaveBodyBase),
});

export const updateLeaveSchema = z.object({
  params: z.object({ id: leaveId }),
  body: z.object({
    type: leaveBodyBase.type.optional(),
    startDate: leaveBodyBase.startDate.optional(),
    endDate: leaveBodyBase.endDate.optional(),
    reason: leaveBodyBase.reason.optional(),
  }),
});
