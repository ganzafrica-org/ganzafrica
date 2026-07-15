import { z } from "zod";

const employeeId = z.string().uuid("Invalid employee id");
const contractId = z.string().uuid("Invalid contract id");

const contractBodyBase = {
  // Job details
  jobTitle: z.string().min(1),
  department: z.string().nullable().optional(),
  workLocation: z.string().nullable().optional(),
  manager: z.string().nullable().optional(),
  reportTo: z.string().nullable().optional(),
  // Contract details
  startDate: z.string().datetime(),
  employmentTerm: z.enum(["indefinite", "definite"]),
  endDate: z.string().datetime().nullable().optional(),
  employmentType: z.enum(["full-time", "part-time"]),
  daysPerWeek: z.number().int().min(1).max(6).nullable().optional(),
  compensationType: z.enum(["hourly", "salaried"]),
  salaryScale: z.enum(["annual", "monthly", "weekly", "daily"]).nullable().optional(),
  currency: z.string().min(1).optional(),
  baseMonthlyRate: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .nullable()
    .optional(),
  grossAnnualRate: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .nullable()
    .optional(),
  employmentAgreementUrl: z.string().url().nullable().optional(),
  status: z.enum(["ACTIVE", "EXPIRED", "TERMINATED"]).optional(),
  notes: z.string().nullable().optional(),
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
    jobTitle: contractBodyBase.jobTitle.optional(),
    department: contractBodyBase.department,
    workLocation: contractBodyBase.workLocation,
    manager: contractBodyBase.manager,
    reportTo: contractBodyBase.reportTo,
    startDate: contractBodyBase.startDate.optional(),
    employmentTerm: contractBodyBase.employmentTerm.optional(),
    endDate: contractBodyBase.endDate,
    employmentType: contractBodyBase.employmentType.optional(),
    daysPerWeek: contractBodyBase.daysPerWeek,
    compensationType: contractBodyBase.compensationType.optional(),
    salaryScale: contractBodyBase.salaryScale,
    currency: contractBodyBase.currency,
    baseMonthlyRate: contractBodyBase.baseMonthlyRate,
    grossAnnualRate: contractBodyBase.grossAnnualRate,
    employmentAgreementUrl: contractBodyBase.employmentAgreementUrl,
    status: contractBodyBase.status,
    notes: contractBodyBase.notes,
  }),
});
