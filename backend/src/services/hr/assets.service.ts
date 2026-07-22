import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import {
  hr_assets,
  hr_users,
  hr_asset_categories,
  hr_asset_specs,
  hr_asset_images,
  hr_asset_maintenance,
  hr_asset_assignments,
} from "@/db/schema";
import { AppError } from "@/middlewares";
import { sendNotification } from "@/modules/hr/notifications/notification.service";

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
    assignedToId: row.assigned_to_id,
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

export function validateStatusTransition(from: AssetStatus, to: AssetStatus) {
  if (from === "DISPOSED") throw new AppError("Asset is disposed and cannot change status", 409);

  const allowed: Record<AssetStatus, AssetStatus[]> = {
    AVAILABLE: ["ASSIGNED", "UNDER_MAINTENANCE", "DISPOSED"],
    ASSIGNED: ["AVAILABLE", "UNDER_MAINTENANCE"],
    UNDER_MAINTENANCE: ["AVAILABLE", "DISPOSED"],
    DISPOSED: [],
  };

  if (from === to || !allowed[from].includes(to)) {
    throw new AppError(`Illegal status transition from ${from} to ${to}`, 409);
  }
}

async function assertUserExists(userId: string): Promise<void> {
  const rows = await db
    .select({ id: hr_users.id })
    .from(hr_users)
    .where(eq(hr_users.id, userId))
    .limit(1);
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
    await assertUserExists(input.assignedToId);
  }

  const [inserted] = await db
    .insert(hr_assets)
    .values({
      device_name: input.deviceName,
      serial_number: input.serialNumber,
      category_id: input.categoryId,
      purchase_price: input.purchasePrice ?? null,
      assigned_to_id: input.assignedToId ?? null,
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
    await assertUserExists(input.assignedToId);
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
  if (input.status !== undefined) {
    validateStatusTransition(rows[0].status, input.status);
    patch.status = input.status;
  }

  if (input.assignedToId !== undefined) {
    patch.assigned_to_id = input.assignedToId;
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
  await assertUserExists(input.requesterId);

  const [inserted] = await db
    .insert(hr_asset_maintenance)
    .values({
      asset_id: input.assetId,
      requester_id: input.requesterId,
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

export async function assignAsset(
  assetId: string,
  employeeId: string,
  assignedBy: string,
  notes?: string,
): Promise<AssetRecord> {
  await assertUserExists(employeeId);
  await assertUserExists(assignedBy);

  return await db.transaction(async (tx) => {
    const [asset] = await tx
      .select()
      .from(hr_assets)
      .where(eq(hr_assets.id, assetId))
      .limit(1)
      .for("update");

    if (!asset) throw new AppError("Asset not found", 404);
    validateStatusTransition(asset.status, "ASSIGNED");

    // Create assignment record
    await tx.insert(hr_asset_assignments).values({
      asset_id: assetId,
      employee_id: employeeId,
      assigned_by: assignedBy,
      notes: notes ?? null,
    });

    // Update asset
    const [updated] = await tx
      .update(hr_assets)
      .set({
        status: "ASSIGNED",
        assigned_to_id: employeeId,
        assigned_at: new Date(),
        returned_at: null,
        updated_at: new Date(),
      })
      .where(eq(hr_assets.id, assetId))
      .returning();

    return {
      ...mapAsset(updated),
    };
  });
}

export async function returnAsset(
  assetId: string,
  condition: string,
  notes: string,
  hasIssue: boolean,
): Promise<AssetRecord> {
  return await db.transaction(async (tx) => {
    const [asset] = await tx
      .select()
      .from(hr_assets)
      .where(eq(hr_assets.id, assetId))
      .limit(1)
      .for("update");

    if (!asset) throw new AppError("Asset not found", 404);
    const newStatus = hasIssue ? "UNDER_MAINTENANCE" : "AVAILABLE";
    validateStatusTransition(asset.status, newStatus);

    // Close the open assignment
    const [assignment] = await tx
      .update(hr_asset_assignments)
      .set({
        returned_at: new Date(),
        return_condition: condition,
        notes: notes,
      })
      .where(
        and(eq(hr_asset_assignments.asset_id, assetId), isNull(hr_asset_assignments.returned_at)),
      )
      .returning();

    if (!assignment) throw new AppError("No open assignment found for this asset", 409);

    // Update asset
    const [updated] = await tx
      .update(hr_assets)
      .set({
        status: newStatus,
        assigned_to_id: null,
        returned_at: new Date(),
        has_issue: hasIssue ? "YES" : "NO",
        updated_at: new Date(),
      })
      .where(eq(hr_assets.id, assetId))
      .returning();

    return {
      ...mapAsset(updated),
    };
  });
}

export async function getEmployeeAssets(employeeId: string, filters: { open?: boolean } = {}) {
  const conditions = [eq(hr_assets.assigned_to_id, employeeId)];
  if (filters.open) {
    conditions.push(eq(hr_assets.status, "ASSIGNED"));
  }

  const rows = await db
    .select()
    .from(hr_assets)
    .where(and(...conditions));
  return rows.map(mapAsset);
}

export type AssetHistoryEntry = {
  type: "ASSIGNMENT" | "RETURN" | "MAINTENANCE";
  occurredAt: Date;
  title: string;
  description?: string | null;
  employeeId?: string | null;
  employeeName?: string | null;
  notes?: string | null;
  condition?: string | null;
  status?: string | null;
};

export async function getAssetHistory(assetId: string): Promise<AssetHistoryEntry[]> {
  const [asset] = await db
    .select({ id: hr_assets.id })
    .from(hr_assets)
    .where(eq(hr_assets.id, assetId))
    .limit(1);
  if (!asset) throw new AppError("Asset not found", 404);

  const [assignmentRows, maintenanceRows] = await Promise.all([
    db
      .select({
        id: hr_asset_assignments.id,
        employee_id: hr_asset_assignments.employee_id,
        assigned_by: hr_asset_assignments.assigned_by,
        assigned_at: hr_asset_assignments.assigned_at,
        returned_at: hr_asset_assignments.returned_at,
        return_condition: hr_asset_assignments.return_condition,
        notes: hr_asset_assignments.notes,
      })
      .from(hr_asset_assignments)
      .where(eq(hr_asset_assignments.asset_id, assetId)),
    db
      .select({
        id: hr_asset_maintenance.id,
        title: hr_asset_maintenance.title,
        description: hr_asset_maintenance.description,
        status: hr_asset_maintenance.status,
        rejection_reason: hr_asset_maintenance.rejection_reason,
        maintenance_date: hr_asset_maintenance.maintenance_date,
      })
      .from(hr_asset_maintenance)
      .where(eq(hr_asset_maintenance.asset_id, assetId)),
  ]);

  const userIds = Array.from(
    new Set(
      assignmentRows.flatMap(
        (row) => [row.employee_id, row.assigned_by].filter(Boolean) as string[],
      ),
    ),
  );

  const userMap = new Map<string, string>();
  if (userIds.length > 0) {
    const users = await db
      .select({
        id: hr_users.id,
        first_name: hr_users.first_name,
        last_name: hr_users.last_name,
      })
      .from(hr_users)
      .where(inArray(hr_users.id, userIds));

    users.forEach((user) => {
      userMap.set(user.id, `${user.first_name} ${user.last_name}`.trim());
    });
  }

  const events: AssetHistoryEntry[] = [];

  for (const row of assignmentRows) {
    events.push({
      type: "ASSIGNMENT",
      occurredAt: row.assigned_at,
      title: "Asset assigned",
      description: `Assigned by ${userMap.get(row.assigned_by) ?? row.assigned_by}`,
      employeeId: row.employee_id,
      employeeName: userMap.get(row.employee_id) ?? row.employee_id,
      notes: row.notes,
    });

    if (row.returned_at) {
      events.push({
        type: "RETURN",
        occurredAt: row.returned_at,
        title: "Asset returned",
        description: `Returned from ${userMap.get(row.employee_id) ?? row.employee_id}`,
        employeeId: row.employee_id,
        employeeName: userMap.get(row.employee_id) ?? row.employee_id,
        condition: row.return_condition,
        notes: row.notes,
      });
    }
  }

  for (const row of maintenanceRows) {
    events.push({
      type: "MAINTENANCE",
      occurredAt: row.maintenance_date ?? new Date(),
      title: row.title,
      description: row.description,
      status: row.status,
      notes: row.rejection_reason,
    });
  }

  return events.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
}
