import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { hr_contracts } from "@/db/schema";
import { AppError } from "@/middlewares";
import { requireEmployee } from "./employee-context";
import {
  HR_SETTABLE_CONTRACT_STATUSES,
  type CompensationType,
  type ContractRecord,
  type ContractStatus,
  type CreateContractInput,
  type EmploymentTerm,
  type EmploymentType,
  type SalaryScale,
  type UpdateContractInput,
} from "@/types/contract.types";
import { sendNotification } from "@/modules/hr/notifications/notification.service";

function mapContract(row: typeof hr_contracts.$inferSelect): ContractRecord {
  return {
    id: row.id,
    employeeId: row.employee_ref_id ?? "",
    jobTitle: row.job_title,
    department: row.department,
    workLocation: row.work_location,
    manager: row.manager,
    reportTo: row.report_to,
    startDate: row.start_date,
    employmentTerm: row.employment_term as EmploymentTerm,
    endDate: row.end_date,
    employmentType: row.employment_type as EmploymentType,
    daysPerWeek: row.days_per_week,
    compensationType: row.compensation_type as CompensationType,
    salaryScale: row.salary_scale as SalaryScale | null,
    currency: row.currency,
    baseMonthlyRate: row.base_monthly_rate,
    grossAnnualRate: row.gross_annual_rate,
    employmentAgreementUrl: row.employment_agreement_url,
    status: row.status as ContractStatus,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateDateRange(startDate: Date, endDate?: Date | null): void {
  if (endDate && endDate < startDate) {
    throw new AppError("End date must be after start date", 400);
  }
}

export async function listContractsByEmployee(employeeId: string): Promise<ContractRecord[]> {
  await requireEmployee(employeeId);

  const rows = await db
    .select()
    .from(hr_contracts)
    .where(eq(hr_contracts.employee_ref_id, employeeId));

  return rows.map(mapContract);
}

export async function getContractById(
  employeeId: string,
  contractId: string,
): Promise<ContractRecord> {
  const rows = await db
    .select()
    .from(hr_contracts)
    .where(and(eq(hr_contracts.id, contractId), eq(hr_contracts.employee_ref_id, employeeId)))
    .limit(1);

  if (!rows.length) throw new AppError("Contract not found", 404);
  return mapContract(rows[0]);
}

export async function createContract(
  employeeId: string,
  input: CreateContractInput,
): Promise<ContractRecord> {
  await requireEmployee(employeeId);
  validateDateRange(input.startDate, input.endDate);

  if (input.status !== undefined && !HR_SETTABLE_CONTRACT_STATUSES.includes(input.status)) {
    throw new AppError(
      `Status '${input.status}' is set by the offboarding process, not directly`,
      422,
      "CONTRACT_STATUS_NOT_SETTABLE",
    );
  }

  // DRAFT → ACTIVE requires the signed agreement on file.
  if ((input.status ?? "ACTIVE") === "ACTIVE" && !input.employmentAgreementUrl) {
    throw new AppError(
      "An active contract needs the signed employment agreement URL",
      422,
      "AGREEMENT_URL_REQUIRED",
    );
  }

  const [inserted] = await db
    .insert(hr_contracts)
    .values({
      employee_ref_id: employeeId,
      job_title: input.jobTitle,
      department: input.department ?? null,
      work_location: input.workLocation ?? null,
      manager: input.manager ?? null,
      report_to: input.reportTo ?? null,
      start_date: input.startDate,
      employment_term: input.employmentTerm,
      end_date: input.endDate ?? null,
      employment_type: input.employmentType,
      days_per_week: input.daysPerWeek ?? null,
      compensation_type: input.compensationType,
      salary_scale: input.salaryScale ?? null,
      currency: input.currency ?? "RWF",
      base_monthly_rate: input.baseMonthlyRate ?? null,
      gross_annual_rate: input.grossAnnualRate ?? null,
      employment_agreement_url: input.employmentAgreementUrl ?? null,
      status: input.status ?? "ACTIVE",
      notes: input.notes ?? null,
    })
    .returning();

  if (!inserted) throw new AppError("Failed to create contract", 400);

  try {
    await sendNotification({
      type: "CONTRACT_CREATED",
      triggeredBy: 0,
      relatedEntity: { contractId: inserted.id, employeeId },
      title: "New contract created",
      message: `A new ${inserted.employment_type} contract has been created for employee ${employeeId}.`,
      priority: "HIGH",
    });
  } catch {
    // notification failure must not break the main operation
  }

  return mapContract(inserted);
}

export async function updateContract(
  employeeId: string,
  contractId: string,
  input: UpdateContractInput,
): Promise<ContractRecord> {
  const rows = await db
    .select()
    .from(hr_contracts)
    .where(and(eq(hr_contracts.id, contractId), eq(hr_contracts.employee_ref_id, employeeId)))
    .limit(1);

  if (!rows.length) throw new AppError("Contract not found", 404);

  if (
    input.status !== undefined &&
    !HR_SETTABLE_CONTRACT_STATUSES.includes(input.status as ContractStatus)
  ) {
    throw new AppError(
      `Status '${input.status}' is set by the offboarding process, not directly`,
      422,
      "CONTRACT_STATUS_NOT_SETTABLE",
    );
  }

  const startDate = input.startDate ?? rows[0].start_date;
  const endDate = input.endDate !== undefined ? input.endDate : rows[0].end_date;
  validateDateRange(startDate, endDate);

  // Guard the DRAFT → ACTIVE transition: the signed agreement must be present.
  const nextStatus = (input.status as ContractStatus | undefined) ?? rows[0].status;
  const nextAgreement =
    input.employmentAgreementUrl !== undefined
      ? input.employmentAgreementUrl
      : rows[0].employment_agreement_url;
  if (nextStatus === "ACTIVE" && !nextAgreement) {
    throw new AppError(
      "An active contract needs the signed employment agreement URL",
      422,
      "AGREEMENT_URL_REQUIRED",
    );
  }

  const patch: Partial<typeof hr_contracts.$inferInsert> = { updated_at: new Date() };

  if (input.jobTitle !== undefined) patch.job_title = input.jobTitle;
  if (input.department !== undefined) patch.department = input.department;
  if (input.workLocation !== undefined) patch.work_location = input.workLocation;
  if (input.manager !== undefined) patch.manager = input.manager;
  if (input.reportTo !== undefined) patch.report_to = input.reportTo;
  if (input.startDate !== undefined) patch.start_date = input.startDate;
  if (input.employmentTerm !== undefined) patch.employment_term = input.employmentTerm;
  if (input.endDate !== undefined) patch.end_date = input.endDate;
  if (input.employmentType !== undefined) patch.employment_type = input.employmentType;
  if (input.daysPerWeek !== undefined) patch.days_per_week = input.daysPerWeek;
  if (input.compensationType !== undefined) patch.compensation_type = input.compensationType;
  if (input.salaryScale !== undefined) patch.salary_scale = input.salaryScale;
  if (input.currency !== undefined) patch.currency = input.currency;
  if (input.baseMonthlyRate !== undefined) patch.base_monthly_rate = input.baseMonthlyRate;
  if (input.grossAnnualRate !== undefined) patch.gross_annual_rate = input.grossAnnualRate;
  if (input.employmentAgreementUrl !== undefined)
    patch.employment_agreement_url = input.employmentAgreementUrl;
  if (input.status !== undefined) patch.status = input.status as ContractStatus;
  if (input.notes !== undefined) patch.notes = input.notes;

  const [updated] = await db
    .update(hr_contracts)
    .set(patch)
    .where(eq(hr_contracts.id, contractId))
    .returning();

  if (!updated) throw new AppError("Contract not found", 404);

  return mapContract(updated);
}

export async function deleteContract(employeeId: string, contractId: string): Promise<void> {
  const deleted = await db
    .delete(hr_contracts)
    .where(and(eq(hr_contracts.id, contractId), eq(hr_contracts.employee_ref_id, employeeId)))
    .returning({ id: hr_contracts.id });

  if (!deleted.length) throw new AppError("Contract not found", 404);
}
