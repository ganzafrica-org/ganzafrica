import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { hr_assets, hr_users } from "@/db/schema";
import { AppError } from "@/middlewares";
import { sendNotification } from "@/modules/hr/notifications/notification.service";

export type AssetIssue = "YES" | "NO";
export type AssetStatus = "AVAILABLE" | "ASSIGNED" | "UNDER_MAINTENANCE" | "DISPOSED";

export interface ListAssetsFilters {
  assignedTo?: string;
  hasIssue?: AssetIssue;
  isFlagged?: boolean;
}

export interface CreateAssetInput {
  deviceName: string;
  serialNumber: string;
  generation: string;
  core: string;
  ram: string;
  hardDisk: string;
  purchasePrice?: string | null;
  assignedToId?: string | null;
  hasIssue?: AssetIssue;
  isFlagged?: boolean;
  status?: AssetStatus;
}

export interface UpdateAssetInput {
  deviceName?: string;
  serialNumber?: string;
  generation?: string;
  core?: string;
  ram?: string;
  hardDisk?: string;
  purchasePrice?: string | null;
  assignedToId?: string | null;
  hasIssue?: AssetIssue;
  isFlagged?: boolean;
  status?: AssetStatus;
}

export interface AssetRecord {
  id: string;
  deviceName: string;
  serialNumber: string;
  generation: string;
  core: string;
  ram: string;
  hardDisk: string;
  purchasePrice: string | null;
  assignedToId: string | null;
  assignedAt: Date | null;
  hasIssue: AssetIssue;
  isFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function mapAsset(row: typeof hr_assets.$inferSelect): AssetRecord {
  return {
    id: row.id,
    deviceName: row.device_name,
    serialNumber: row.serial_number,
    generation: row.generation,
    core: row.core,
    ram: row.ram,
    hardDisk: row.hard_disk,
    purchasePrice: row.purchase_price ? String(row.purchase_price) : null,
    assignedToId: row.assigned_to_id,
    assignedAt: row.assigned_at,
    hasIssue: row.has_issue,
    isFlagged: row.is_flagged,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function assertUserExists(userId: string): Promise<void> {
  const rows = await db.select({ id: hr_users.id }).from(hr_users).where(eq(hr_users.id, userId)).limit(1);
  if (!rows.length) throw new AppError("Assigned user not found", 404);
}

async function assertSerialAvailable(serialNumber: string, excludeId?: string): Promise<void> {
  const rows = await db
    .select({ id: hr_assets.id })
    .from(hr_assets)
    .where(eq(hr_assets.serial_number, serialNumber))
    .limit(1);

  if (rows.length && rows[0].id !== excludeId) {
    throw new AppError("Serial number already exists", 409);
  }
}

export async function listAssets(filters: ListAssetsFilters = {}): Promise<AssetRecord[]> {
  const conditions = [];

  if (filters.assignedTo) {
    conditions.push(eq(hr_assets.assigned_to_id, filters.assignedTo));
  }
  if (filters.hasIssue) {
    conditions.push(eq(hr_assets.has_issue, filters.hasIssue));
  }
  if (filters.isFlagged !== undefined) {
    conditions.push(eq(hr_assets.is_flagged, filters.isFlagged));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;
  const rows = await db.select().from(hr_assets).where(whereClause);

  return rows.map(mapAsset);
}

export async function getAssetById(id: string): Promise<AssetRecord> {
  const rows = await db.select().from(hr_assets).where(eq(hr_assets.id, id)).limit(1);
  if (!rows.length) throw new AppError("Asset not found", 404);
  return mapAsset(rows[0]);
}

export async function createAsset(input: CreateAssetInput): Promise<AssetRecord> {
  await assertSerialAvailable(input.serialNumber);

  if (input.assignedToId) {
    await assertUserExists(input.assignedToId);
  }

  const [inserted] = await db
    .insert(hr_assets)
    .values({
      device_name: input.deviceName,
      serial_number: input.serialNumber,
      generation: input.generation,
      core: input.core,
      ram: input.ram,
      hard_disk: input.hardDisk,
      purchase_price: input.purchasePrice ?? null,
      assigned_to_id: input.assignedToId ?? null,
      assigned_at: input.assignedToId ? new Date() : null,
      has_issue: input.hasIssue ?? "NO",
      is_flagged: input.isFlagged ?? false,
    })
    .returning();

  if (!inserted) throw new AppError("Failed to create asset", 400);
  return mapAsset(inserted);
}

export async function updateAsset(id: string, input: UpdateAssetInput): Promise<AssetRecord> {
  const rows = await db.select().from(hr_assets).where(eq(hr_assets.id, id)).limit(1);
  if (!rows.length) throw new AppError("Asset not found", 404);

  if (input.serialNumber !== undefined) {
    await assertSerialAvailable(input.serialNumber, id);
  }

  if (input.assignedToId) {
    await assertUserExists(input.assignedToId);
  }

  const patch: Partial<typeof hr_assets.$inferInsert> = {
    updated_at: new Date(),
  };

  if (input.deviceName !== undefined) patch.device_name = input.deviceName;
  if (input.serialNumber !== undefined) patch.serial_number = input.serialNumber;
  if (input.generation !== undefined) patch.generation = input.generation;
  if (input.core !== undefined) patch.core = input.core;
  if (input.ram !== undefined) patch.ram = input.ram;
  if (input.hardDisk !== undefined) patch.hard_disk = input.hardDisk;
  if (input.purchasePrice !== undefined) patch.purchase_price = input.purchasePrice;
  if (input.hasIssue !== undefined) patch.has_issue = input.hasIssue;
  if (input.isFlagged !== undefined) patch.is_flagged = input.isFlagged;
  if (input.status !== undefined) patch.status = input.status;

  if (input.assignedToId !== undefined) {
    patch.assigned_to_id = input.assignedToId;
    patch.assigned_at = input.assignedToId ? new Date() : null;
    if (!input.assignedToId) {
      patch.returned_at = new Date();
    }
  }

  const [updated] = await db.update(hr_assets).set(patch).where(eq(hr_assets.id, id)).returning();
  if (!updated) throw new AppError("Asset not found", 404);

  try {
    if (
      input.assignedToId !== undefined &&
      input.assignedToId !== null &&
      input.assignedToId !== rows[0].assigned_to_id
    ) {
      await sendNotification({
        type: "ASSET_ASSIGNED",
        triggeredBy: 0,
        relatedEntity: { assetId: updated.id, employeeId: input.assignedToId },
        title: "Asset assigned",
        message: `Asset "${updated.device_name}" has been assigned.`,
        priority: "NORMAL",
      });
    }
    if (
      input.assignedToId !== undefined &&
      input.assignedToId === null &&
      rows[0].assigned_to_id !== null
    ) {
      await sendNotification({
        type: "ASSET_RETURNED",
        triggeredBy: 0,
        relatedEntity: { assetId: updated.id, employeeId: rows[0].assigned_to_id },
        title: "Asset returned",
        message: `Asset "${updated.device_name}" has been returned.`,
        priority: "LOW",
      });
    }
    if (input.status !== undefined && input.status !== rows[0].status) {
      await sendNotification({
        type: "ASSET_STATUS_CHANGED",
        triggeredBy: 0,
        relatedEntity: { assetId: updated.id, employeeId: updated.assigned_to_id ?? undefined },
        title: "Asset status updated",
        message: `Asset "${updated.device_name}" status is now ${updated.status}.`,
        priority: "LOW",
      });
    }
  } catch {
    // notification failure must not break the main operation
  }

  return mapAsset(updated);
}

export async function deleteAsset(id: string): Promise<void> {
  const deleted = await db.delete(hr_assets).where(eq(hr_assets.id, id)).returning({ id: hr_assets.id });
  if (!deleted.length) throw new AppError("Asset not found", 404);
}
