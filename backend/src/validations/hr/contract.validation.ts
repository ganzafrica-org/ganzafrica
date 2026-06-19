import { z } from "zod";

const employeeId = z.string().uuid("Invalid employee id");
const contractId = z.string().uuid("Invalid contract id");

const contractBodyBase = {
  type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional().nullable(),
  salary: z.string().regex(/^\d+(\.\d{1,2})?$/, "Salary must be a positive number"),
  currency: z.string().min(1).optional(),
  status: z.enum(["ACTIVE", "EXPIRED", "TERMINATED"]).optional(),
  notes: z.string().optional().nullable(),
};

export const listContractsSchema = z.object({
  params: z.object({ employeeId }),
});

export const contractIdParamSchema = z.object({
  params: z.object({ employeeId, contractId }),
});

export const createContractSchema = z.object({
  params: z.object({ employeeId }),
  body: z.object(contractBodyBase),
});

export const updateContractSchema = z.object({
  params: z.object({ employeeId, contractId }),
  body: z.object({
    type: contractBodyBase.type.optional(),
    startDate: contractBodyBase.startDate.optional(),
    endDate: contractBodyBase.endDate.optional(),
    salary: contractBodyBase.salary.optional(),
    currency: contractBodyBase.currency.optional(),
    status: contractBodyBase.status.optional(),
    notes: contractBodyBase.notes.optional(),
  }),
});
