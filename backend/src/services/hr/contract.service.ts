import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { hr_contracts } from "@/db/schema";
import { AppError } from "@/middlewares";
import { getActiveEmployee } from "../../services/hr/employee.service";
import type {
  CompensationType,
  ContractRecord,
  ContractStatus,
  CreateContractInput,
  EmploymentTerm,
  EmploymentType,
  SalaryScale,
  UpdateContractInput,
} from "@/types/contract.types";
import {
  sendNotification,
  resolveTriggeredByFromHrUser,
} from "@/modules/hr/notifications/notification.service";
import type { HrRequester } from "@/types/employee.types";

function mapContract(row: typeof hr_contracts.$inferSelect): ContractRecord {
  return {
    id: row.id,
    employeeId: row.employee_id,
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

function assertContractAccess(requester: HrRequester): void {
  if (requester.role !== "IT" && requester.role !== "HR") {
    throw new AppError("Forbidden", 403);
  }
}

export async function listContractsByEmployee(
  requester: HrRequester,
  employeeId: string,
): Promise<ContractRecord[]> {
  assertContractAccess(requester);
  await getActiveEmployee(employeeId);

  const rows = await db.select().from(hr_contracts).where(eq(hr_contracts.employee_id, employeeId));

  return rows.map(mapContract);
}

export async function getContractById(
  requester: HrRequester,
  employeeId: string,
  contractId: string,
): Promise<ContractRecord> {
  assertContractAccess(requester);

  const rows = await db
    .select()
    .from(hr_contracts)
    .where(and(eq(hr_contracts.id, contractId), eq(hr_contracts.employee_id, employeeId)))
    .limit(1);

  if (!rows.length) throw new AppError("Contract not found", 404);
  return mapContract(rows[0]);
}

export async function createContract(
  requester: HrRequester,
  employeeId: string,
  input: CreateContractInput,
): Promise<ContractRecord> {
  if (requester.role !== "HR") throw new AppError("Forbidden", 403);

  await getActiveEmployee(employeeId);
  validateDateRange(input.startDate, input.endDate);

  const [inserted] = await db
    .insert(hr_contracts)
    .values({
      employee_id: employeeId,
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
      triggeredBy: await resolveTriggeredByFromHrUser(requester.id),
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
  requester: HrRequester,
  employeeId: string,
  contractId: string,
  input: UpdateContractInput,
): Promise<ContractRecord> {
  if (requester.role !== "HR") throw new AppError("Forbidden", 403);

  const rows = await db
    .select()
    .from(hr_contracts)
    .where(and(eq(hr_contracts.id, contractId), eq(hr_contracts.employee_id, employeeId)))
    .limit(1);

  if (!rows.length) throw new AppError("Contract not found", 404);

  const startDate = input.startDate ?? rows[0].start_date;
  const endDate = input.endDate !== undefined ? input.endDate : rows[0].end_date;
  validateDateRange(startDate, endDate);

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

export async function deleteContract(
  requester: HrRequester,
  employeeId: string,
  contractId: string,
): Promise<void> {
  if (requester.role !== "HR") throw new AppError("Forbidden", 403);

  const deleted = await db
    .delete(hr_contracts)
    .where(and(eq(hr_contracts.id, contractId), eq(hr_contracts.employee_id, employeeId)))
    .returning({ id: hr_contracts.id });

  if (!deleted.length) throw new AppError("Contract not found", 404);
}
