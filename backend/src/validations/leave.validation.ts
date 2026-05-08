import { z } from "zod";

export const leaveIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid leave id"),
  }),
});

export const listLeaveSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 10)),
  }),
});

export const createLeaveSchema = z.object({
  body: z.object({
    type: z.enum(["ANNUAL", "SICK", "MATERNITY", "PATERNITY", "OTHER"]),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    reason: z.string().min(1),
  }),
});

export const reviewLeaveSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid leave id"),
  }),
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
  }),
});

