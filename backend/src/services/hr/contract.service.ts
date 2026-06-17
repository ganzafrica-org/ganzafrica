import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { hr_contracts } from "@/db/schema";
import { AppError } from "@/middlewares";
import { getActiveEmployee } from "../../services/hr/employee.service";
import type {
  ContractRecord,
  ContractStatus,
  CreateContractInput,
  UpdateContractInput,
} from "@/types/contract.types";
import { sendNotification, resolveTriggeredByFromHrUser } from "@/modules/hr/notifications/notification.service";
import type { HrRequester } from "@/types/employee.types";

function mapContract(row: typeof hr_contracts.$inferSelect): ContractRecord {
  return {
    id: row.id,
    employeeId: row.employee_id,
    type: row.type,
    startDate: row.start_date,
    endDate: row.end_date,
    salary: String(row.salary),
    currency: row.currency,
    status: row.status,
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

  const rows = await db
    .select()
    .from(hr_contracts)
    .where(eq(hr_contracts.employee_id, employeeId));

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
      type: input.type,
      start_date: input.startDate,
      end_date: input.endDate ?? null,
      salary: input.salary,
      currency: input.currency ?? "USD",
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
      message: `A new ${inserted.type} contract has been created.`,
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

  if (input.type !== undefined) patch.type = input.type;
  if (input.startDate !== undefined) patch.start_date = input.startDate;
  if (input.endDate !== undefined) patch.end_date = input.endDate;
  if (input.salary !== undefined) patch.salary = input.salary;
  if (input.currency !== undefined) patch.currency = input.currency;
  if (input.status !== undefined) patch.status = input.status as ContractStatus;
  if (input.notes !== undefined) patch.notes = input.notes;

  const [updated] = await db
    .update(hr_contracts)
    .set(patch)
    .where(eq(hr_contracts.id, contractId))
    .returning();

  if (!updated) throw new AppError("Contract not found", 404);

  try {
    await sendNotification({
      type: "CONTRACT_UPDATED",
      triggeredBy: await resolveTriggeredByFromHrUser(requester.id),
      relatedEntity: { contractId: updated.id, employeeId },
      title: "Contract updated",
      message: `Contract ${updated.id} has been updated.`,
      priority: "NORMAL",
    });
  } catch {
    // notification failure must not break the main operation
  }

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
