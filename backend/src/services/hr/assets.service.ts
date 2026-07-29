import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  hr_assets,
  hr_asset_categories,
  hr_asset_specs,
  hr_asset_images,
  hr_asset_maintenance,
} from "@/db/schema";
import { AppError } from "@/middlewares";
import { sendNotification } from "@/modules/hr/notifications/notification.service";
import { requireEmployee } from "./employee-context";

export type AssetIssue = "YES" | "NO";
export type AssetStatus = "AVAILABLE" | "ASSIGNED" | "UNDER_MAINTENANCE" | "DISPOSED";

export interface SpecInput {
  key: string;
  value: string;
}

export interface ImageInput {
  url: string;
  storageKey: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ListAssetsFilters {
  assignedTo?: string;
  hasIssue?: AssetIssue;
  isFlagged?: boolean;
}

export interface CreateAssetInput {
  deviceName: string;
  serialNumber: string;
  categoryId: string;
  specs?: SpecInput[];
  images?: ImageInput[];
  purchasePrice?: string | null;
  assignedToId?: string | null;
  hasIssue?: AssetIssue;
  isFlagged?: boolean;
  status?: AssetStatus;
}

export interface UpdateAssetInput {
  deviceName?: string;
  serialNumber?: string;
  categoryId?: string;
  specs?: SpecInput[];
  images?: ImageInput[];
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
  categoryId: string;
  purchasePrice: string | null;
  assignedToId: string | null;
  assignedAt: Date | null;
  returnedAt: Date | null;
  notes: string | null;
  hasIssue: AssetIssue;
  isFlagged: boolean;
  status: AssetStatus;
  createdAt: Date;
  updatedAt: Date;
  category?: any;
  specs?: any[];
  images?: any[];
}

function mapAsset(row: typeof hr_assets.$inferSelect): AssetRecord {
  return {
    id: row.id,
    deviceName: row.device_name,
    serialNumber: row.serial_number,
    categoryId: row.category_id,
    purchasePrice: row.purchase_price ? String(row.purchase_price) : null,
    assignedToId: row.assigned_to_employee_id,
    assignedAt: row.assigned_at,
    returnedAt: row.returned_at,
    notes: row.notes,
    hasIssue: row.has_issue,
    isFlagged: row.is_flagged,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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
    conditions.push(eq(hr_assets.assigned_to_employee_id, filters.assignedTo));
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

  const asset = rows[0];

  // Fetch category
  const categoryRows = await db
    .select()
    .from(hr_asset_categories)
    .where(eq(hr_asset_categories.id, asset.category_id))
    .limit(1);

  // Fetch specs
  const specRows = await db
    .select({
      spec_key: hr_asset_specs.spec_key,
      spec_value: hr_asset_specs.spec_value,
    })
    .from(hr_asset_specs)
    .where(eq(hr_asset_specs.asset_id, id));

  // Fetch images
  const imageRows = await db
    .select({
      id: hr_asset_images.id,
      url: hr_asset_images.url,
      storage_key: hr_asset_images.storage_key,
      is_primary: hr_asset_images.is_primary,
      sort_order: hr_asset_images.sort_order,
    })
    .from(hr_asset_images)
    .where(eq(hr_asset_images.asset_id, id))
    .orderBy(asc(hr_asset_images.sort_order));

  return {
    ...mapAsset(asset),
    category: categoryRows[0] || null,
    specs: specRows,
    images: imageRows,
  };
}

export async function createAsset(input: CreateAssetInput): Promise<AssetRecord> {
  await assertSerialAvailable(input.serialNumber);

  // Validate category exists
  const category = await db
    .select({ id: hr_asset_categories.id })
    .from(hr_asset_categories)
    .where(eq(hr_asset_categories.id, input.categoryId))
    .limit(1);
  if (!category.length) throw new AppError("Category not found", 404);

  if (input.assignedToId) {
    await requireEmployee(input.assignedToId);
  }

  const [inserted] = await db
    .insert(hr_assets)
    .values({
      device_name: input.deviceName,
      serial_number: input.serialNumber,
      category_id: input.categoryId,
      purchase_price: input.purchasePrice ?? null,
      assigned_to_employee_id: input.assignedToId ?? null,
      assigned_at: input.assignedToId ? new Date() : null,
      has_issue: input.hasIssue ?? "NO",
      is_flagged: input.isFlagged ?? false,
      status: input.status ?? "AVAILABLE",
    })
    .returning();

  if (!inserted) throw new AppError("Failed to create asset", 400);

  // Bulk insert specs
  if (input.specs && input.specs.length > 0) {
    await db.insert(hr_asset_specs).values(
      input.specs.map((s) => ({
        asset_id: inserted.id,
        spec_key: s.key,
        spec_value: s.value,
      })),
    );
  }

  // Bulk insert images
  if (input.images && input.images.length > 0) {
    await db.insert(hr_asset_images).values(
      input.images.map((i) => ({
        asset_id: inserted.id,
        url: i.url,
        storage_key: i.storageKey,
        is_primary: i.isPrimary,
        sort_order: i.sortOrder,
      })),
    );
  }

  return getAssetById(inserted.id);
}

export async function updateAsset(id: string, input: UpdateAssetInput): Promise<AssetRecord> {
  const rows = await db.select().from(hr_assets).where(eq(hr_assets.id, id)).limit(1);
  if (!rows.length) throw new AppError("Asset not found", 404);

  if (input.serialNumber !== undefined) {
    await assertSerialAvailable(input.serialNumber, id);
  }

  if (input.categoryId !== undefined) {
    const category = await db
      .select({ id: hr_asset_categories.id })
      .from(hr_asset_categories)
      .where(eq(hr_asset_categories.id, input.categoryId))
      .limit(1);
    if (!category.length) throw new AppError("Category not found", 404);
  }

  if (input.assignedToId) {
    await requireEmployee(input.assignedToId);
  }

  const patch: Partial<typeof hr_assets.$inferInsert> = {
    updated_at: new Date(),
  };

  if (input.deviceName !== undefined) patch.device_name = input.deviceName;
  if (input.serialNumber !== undefined) patch.serial_number = input.serialNumber;
  if (input.categoryId !== undefined) patch.category_id = input.categoryId;
  if (input.purchasePrice !== undefined) patch.purchase_price = input.purchasePrice;
  if (input.hasIssue !== undefined) patch.has_issue = input.hasIssue;
  if (input.isFlagged !== undefined) patch.is_flagged = input.isFlagged;
  if (input.status !== undefined) patch.status = input.status;

  if (input.assignedToId !== undefined) {
    patch.assigned_to_employee_id = input.assignedToId;
    patch.assigned_at = input.assignedToId ? new Date() : null;
    if (!input.assignedToId) {
      patch.returned_at = new Date();
    }
  }

  const [updated] = await db.update(hr_assets).set(patch).where(eq(hr_assets.id, id)).returning();
  if (!updated) throw new AppError("Asset not found", 404);

  // Update specs if provided
  if (input.specs !== undefined) {
    await db.delete(hr_asset_specs).where(eq(hr_asset_specs.asset_id, id));
    if (input.specs.length > 0) {
      await db.insert(hr_asset_specs).values(
        input.specs.map((s) => ({
          asset_id: id,
          spec_key: s.key,
          spec_value: s.value,
        })),
      );
    }
  }

  // Append new images if provided
  if (input.images && input.images.length > 0) {
    await db.insert(hr_asset_images).values(
      input.images.map((i) => ({
        asset_id: id,
        url: i.url,
        storage_key: i.storageKey,
        is_primary: i.isPrimary,
        sort_order: i.sortOrder,
      })),
    );
  }

  try {
    if (
      input.assignedToId !== undefined &&
      input.assignedToId !== null &&
      input.assignedToId !== rows[0].assigned_to_employee_id
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
      rows[0].assigned_to_employee_id !== null
    ) {
      await sendNotification({
        type: "ASSET_RETURNED",
        triggeredBy: 0,
        relatedEntity: { assetId: updated.id, employeeId: rows[0].assigned_to_employee_id },
        title: "Asset returned",
        message: `Asset "${updated.device_name}" has been returned.`,
        priority: "LOW",
      });
    }
    if (input.status !== undefined && input.status !== rows[0].status) {
      await sendNotification({
        type: "ASSET_STATUS_CHANGED",
        triggeredBy: 0,
        relatedEntity: {
          assetId: updated.id,
          employeeId: updated.assigned_to_employee_id ?? undefined,
        },
        title: "Asset status updated",
        message: `Asset "${updated.device_name}" status is now ${updated.status}.`,
        priority: "LOW",
      });
    }
  } catch {
    // notification failure must not break the main operation
  }

  return getAssetById(id);
}

export async function deleteAsset(id: string): Promise<void> {
  const deleted = await db
    .delete(hr_assets)
    .where(eq(hr_assets.id, id))
    .returning({ id: hr_assets.id });
  if (!deleted.length) throw new AppError("Asset not found", 404);
}

// List all active categories, grouped by parent_name
export async function listAssetCategories() {
  const rows = await db
    .select()
    .from(hr_asset_categories)
    .where(eq(hr_asset_categories.is_active, true))
    .orderBy(hr_asset_categories.parent_name, hr_asset_categories.sort_order);

  // Grouping by parent_name
  const grouped = rows.reduce((acc: any, category) => {
    const parent = category.parent_name || "Uncategorized";
    if (!acc[parent]) acc[parent] = [];
    acc[parent].push(category);
    return acc;
  }, {});

  return grouped;
}

// Get a single category with its spec_schema
export async function getAssetCategory(id: string) {
  const rows = await db
    .select()
    .from(hr_asset_categories)
    .where(eq(hr_asset_categories.id, id))
    .limit(1);
  if (!rows.length) throw new AppError("Category not found", 404);
  return rows[0];
}

// Create a new category (admin only)
export async function createAssetCategory(input: {
  name: string;
  parent_name?: string;
  slug: string;
  spec_schema: object[];
  sort_order?: number;
}) {
  const [inserted] = await db
    .insert(hr_asset_categories)
    .values({
      name: input.name,
      parent_name: input.parent_name ?? null,
      slug: input.slug,
      spec_schema: input.spec_schema,
      sort_order: input.sort_order ?? 0,
    })
    .returning();

  if (!inserted) throw new AppError("Failed to create category", 400);
  return inserted;
}

// Update a category's spec_schema or metadata
export async function updateAssetCategory(id: string, input: any) {
  const [updated] = await db
    .update(hr_asset_categories)
    .set({
      ...input,
      updated_at: new Date(),
    })
    .where(eq(hr_asset_categories.id, id))
    .returning();

  if (!updated) throw new AppError("Category not found", 404);
  return updated;
}

// Soft delete (set is_active = false)
export async function deactivateAssetCategory(id: string): Promise<void> {
  const [updated] = await db
    .update(hr_asset_categories)
    .set({ is_active: false, updated_at: new Date() })
    .where(eq(hr_asset_categories.id, id))
    .returning();

  if (!updated) throw new AppError("Category not found", 404);
}

// Delete a specific image from an asset (also used when removing from DO Spaces)
export async function deleteAssetImage(imageId: string): Promise<{ storage_key: string }> {
  const [deleted] = await db
    .delete(hr_asset_images)
    .where(eq(hr_asset_images.id, imageId))
    .returning({ storage_key: hr_asset_images.storage_key });

  if (!deleted) throw new AppError("Image not found", 404);
  return deleted;
}

// Maintenance operations

export interface CreateMaintenanceInput {
  assetId: string;
  requesterId: string;
  title: string;
  description?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  price?: string | null;
  maintenanceDate?: Date;
}

export interface UpdateMaintenanceInput {
  title?: string;
  description?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  price?: string | null;
  maintenanceDate?: Date;
}

export async function listAssetMaintenance(assetId?: string) {
  const conditions = [];
  if (assetId) {
    conditions.push(eq(hr_asset_maintenance.asset_id, assetId));
  }
  const whereClause = conditions.length ? and(...conditions) : undefined;

  return db
    .select()
    .from(hr_asset_maintenance)
    .where(whereClause)
    .orderBy(asc(hr_asset_maintenance.maintenance_date));
}

export async function createAssetMaintenance(input: CreateMaintenanceInput) {
  // Verify asset exists
  const asset = await db
    .select({ id: hr_assets.id })
    .from(hr_assets)
    .where(eq(hr_assets.id, input.assetId))
    .limit(1);
  if (!asset.length) throw new AppError("Asset not found", 404);

  // Verify requester exists
  await requireEmployee(input.requesterId);

  const [inserted] = await db
    .insert(hr_asset_maintenance)
    .values({
      asset_id: input.assetId,
      requester_employee_id: input.requesterId,
      title: input.title,
      description: input.description,
      status: input.status ?? "PENDING",
      rejection_reason: input.rejectionReason,
      price: input.price,
      maintenance_date: input.maintenanceDate ?? new Date(),
    })
    .returning();

  if (!inserted) throw new AppError("Failed to create maintenance record", 400);
  return inserted;
}

export async function updateAssetMaintenance(id: string, input: UpdateMaintenanceInput) {
  const [updated] = await db
    .update(hr_asset_maintenance)
    .set({
      title: input.title,
      description: input.description,
      status: input.status,
      rejection_reason: input.rejectionReason,
      price: input.price,
      maintenance_date: input.maintenanceDate,
      updated_at: new Date(),
    })
    .where(eq(hr_asset_maintenance.id, id))
    .returning();

  if (!updated) throw new AppError("Maintenance record not found", 404);
  return updated;
}

export async function deleteAssetMaintenance(id: string) {
  const deleted = await db
    .delete(hr_asset_maintenance)
    .where(eq(hr_asset_maintenance.id, id))
    .returning();
  if (!deleted.length) throw new AppError("Maintenance record not found", 404);
}
