import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import {
  hr_assets,
  hr_asset_categories,
  hr_asset_specs,
  hr_asset_images,
  hr_asset_maintenance,
  hr_asset_assignments,
} from "@/db/schema";
import { AppError } from "@/middlewares";
import { sendNotification } from "@/modules/hr/notifications/notification.service";
import { requireEmployee } from "./employee-context";
import { assertAssetStatusTransition } from "./asset-status";

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
  hasIssue?: AssetIssue;
  isFlagged?: boolean;
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

function mapImage(row: {
  id: string;
  url: string;
  storage_key: string;
  is_primary: boolean;
  sort_order: number;
}) {
  return {
    id: row.id,
    url: row.url,
    storageKey: row.storage_key,
    isPrimary: row.is_primary,
    sortOrder: row.sort_order,
  };
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
  if (rows.length === 0) return [];

  // One batched query for thumbnails instead of an image lookup per asset row.
  const imageRows = await db
    .select({
      id: hr_asset_images.id,
      asset_id: hr_asset_images.asset_id,
      url: hr_asset_images.url,
      storage_key: hr_asset_images.storage_key,
      is_primary: hr_asset_images.is_primary,
      sort_order: hr_asset_images.sort_order,
    })
    .from(hr_asset_images)
    .where(
      inArray(
        hr_asset_images.asset_id,
        rows.map((r) => r.id),
      ),
    )
    .orderBy(asc(hr_asset_images.sort_order));

  const imagesByAsset = new Map<string, typeof imageRows>();
  for (const image of imageRows) {
    const list = imagesByAsset.get(image.asset_id) ?? [];
    list.push(image);
    imagesByAsset.set(image.asset_id, list);
  }

  return rows.map((row) => ({
    ...mapAsset(row),
    images: (imagesByAsset.get(row.id) ?? []).map(mapImage),
  }));
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
    images: imageRows.map(mapImage),
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

  const patch: Partial<typeof hr_assets.$inferInsert> = {
    updated_at: new Date(),
  };

  if (input.deviceName !== undefined) patch.device_name = input.deviceName;
  if (input.serialNumber !== undefined) patch.serial_number = input.serialNumber;
  if (input.categoryId !== undefined) patch.category_id = input.categoryId;
  if (input.purchasePrice !== undefined) patch.purchase_price = input.purchasePrice;
  if (input.hasIssue !== undefined) patch.has_issue = input.hasIssue;
  if (input.isFlagged !== undefined) patch.is_flagged = input.isFlagged;

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

  return getAssetById(id);
}

/**
 * MOD-04 §4 delete guard:
 *   - currently ASSIGNED -> 409 (must be returned first; ASSIGNED->DISPOSED isn't a legal edge)
 *   - has any assignment history at all -> DISPOSED transition instead of a real delete
 *   - never assigned -> hard delete, as before
 */
export async function deleteAsset(id: string): Promise<{ disposed: boolean }> {
  const [asset] = await db.select().from(hr_assets).where(eq(hr_assets.id, id)).limit(1);
  if (!asset) throw new AppError("Asset not found", 404);

  if (asset.status === "ASSIGNED") {
    throw new AppError(
      "Asset is currently assigned — return it before deleting",
      409,
      "ASSET_CURRENTLY_ASSIGNED",
    );
  }

  const [historyRow] = await db
    .select({ id: hr_asset_assignments.id })
    .from(hr_asset_assignments)
    .where(eq(hr_asset_assignments.asset_id, id))
    .limit(1);

  if (historyRow) {
    assertAssetStatusTransition(asset.status, "DISPOSED");
    await db
      .update(hr_assets)
      .set({ status: "DISPOSED", updated_at: new Date() })
      .where(eq(hr_assets.id, id));
    return { disposed: true };
  }

  const deleted = await db
    .delete(hr_assets)
    .where(eq(hr_assets.id, id))
    .returning({ id: hr_assets.id });
  if (!deleted.length) throw new AppError("Asset not found", 404);
  return { disposed: false };
}

// List all active categories, grouped by parent_name
// Flat, frontend groups by parent_name itself (useAssetCategories' `grouped`) — matches
// the AssetCategory[] contract the client's Array.isArray guard expects.
export async function listAssetCategories() {
  return db
    .select()
    .from(hr_asset_categories)
    .where(eq(hr_asset_categories.is_active, true))
    .orderBy(hr_asset_categories.parent_name, hr_asset_categories.sort_order);
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
  completedAt?: Date;
}

function mapMaintenance(row: typeof hr_asset_maintenance.$inferSelect) {
  return {
    id: row.id,
    assetId: row.asset_id,
    requesterId: row.requester_employee_id,
    title: row.title,
    description: row.description,
    status: row.status,
    rejectionReason: row.rejection_reason,
    price: row.price,
    maintenanceDate: row.maintenance_date,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listAssetMaintenance(assetId?: string) {
  const conditions = [];
  if (assetId) {
    conditions.push(eq(hr_asset_maintenance.asset_id, assetId));
  }
  const whereClause = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(hr_asset_maintenance)
    .where(whereClause)
    .orderBy(asc(hr_asset_maintenance.maintenance_date));

  return rows.map(mapMaintenance);
}

export async function createAssetMaintenance(input: CreateMaintenanceInput) {
  // Verify asset exists — full row, not just id, since an APPROVED-at-creation request
  // may need to drive the asset's status.
  const [asset] = await db.select().from(hr_assets).where(eq(hr_assets.id, input.assetId)).limit(1);
  if (!asset) throw new AppError("Asset not found", 404);

  // Verify requester exists
  await requireEmployee(input.requesterId);

  // Coerce to Date — the validated body hands this in as an ISO string (z.string().datetime()
  // has no .transform()), but the drizzle timestamp column's driver mapping requires a Date.
  const maintenanceDateVal = input.maintenanceDate
    ? new Date(input.maintenanceDate as any)
    : new Date();

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
      maintenance_date: maintenanceDateVal,
    })
    .returning();

  if (!inserted) throw new AppError("Failed to create maintenance record", 400);

  // MOD-04 §4: an entry created (or arriving) as APPROVED opens the asset. If it's already
  // UNDER_MAINTENANCE (a second concurrent open entry), this is a no-op rather than an
  // illegal A->A transition — see asset-status.ts's note on self-transitions.
  if (input.status === "APPROVED" && asset.status !== "UNDER_MAINTENANCE") {
    assertAssetStatusTransition(asset.status, "UNDER_MAINTENANCE");
    await db
      .update(hr_assets)
      .set({ status: "UNDER_MAINTENANCE", updated_at: new Date() })
      .where(eq(hr_assets.id, input.assetId));
  }

  return mapMaintenance(inserted);
}

export async function updateAssetMaintenance(id: string, input: UpdateMaintenanceInput) {
  const [existing] = await db
    .select()
    .from(hr_asset_maintenance)
    .where(eq(hr_asset_maintenance.id, id))
    .limit(1);
  if (!existing) throw new AppError("Maintenance record not found", 404);

  // Coerce completedAt/maintenanceDate to Date if provided (tests + the validated body
  // both hand these in as ISO strings)
  const completedAtVal = input.completedAt ? new Date(input.completedAt as any) : undefined;
  const maintenanceDateVal = input.maintenanceDate
    ? new Date(input.maintenanceDate as any)
    : undefined;

  const [updated] = await db
    .update(hr_asset_maintenance)
    .set({
      title: input.title,
      description: input.description,
      status: input.status,
      rejection_reason: input.rejectionReason,
      price: input.price,
      maintenance_date: maintenanceDateVal,
      completed_at: completedAtVal,
      updated_at: new Date(),
    })
    .where(eq(hr_asset_maintenance.id, id))
    .returning();

  if (!updated) throw new AppError("Maintenance record not found", 404);

  // MOD-04 §4: when a maintenance entry receives completedAt, re-evaluate whether
  // the asset should return from UNDER_MAINTENANCE -> AVAILABLE. This is done by
  // checking for any remaining open (APPROVED & completed_at IS NULL) entries for
  // the same asset. PENDING/REJECTED entries never affect asset status.
  if (completedAtVal && existing.status === "APPROVED") {
    const [asset] = await db
      .select()
      .from(hr_assets)
      .where(eq(hr_assets.id, updated.asset_id))
      .limit(1);

    if (asset && asset.status === "UNDER_MAINTENANCE") {
      const stillOpen = await db
        .select({ id: hr_asset_maintenance.id })
        .from(hr_asset_maintenance)
        .where(
          and(
            eq(hr_asset_maintenance.asset_id, updated.asset_id),
            eq(hr_asset_maintenance.status, "APPROVED"),
            isNull(hr_asset_maintenance.completed_at),
          ),
        )
        .limit(1);

      if (!stillOpen.length) {
        assertAssetStatusTransition(asset.status, "AVAILABLE");
        await db
          .update(hr_assets)
          .set({ status: "AVAILABLE", updated_at: new Date() })
          .where(eq(hr_assets.id, updated.asset_id));
      }
    }
  }

  return mapMaintenance(updated);
}

export async function deleteAssetMaintenance(id: string) {
  const deleted = await db
    .delete(hr_asset_maintenance)
    .where(eq(hr_asset_maintenance.id, id))
    .returning();
  if (!deleted.length) throw new AppError("Maintenance record not found", 404);
}

// ── Assignment (MOD-04 §4) ───────────────────────────────────────────────────

export interface AssignAssetInput {
  employeeId: string;
  notes?: string;
  /** users.id of the actor performing the assignment — an HR/admin agent, not the holder. */
  assignedBy?: number | null;
}

/**
 * AVAILABLE-only. Writes the hr_asset_assignments row and the denormalized fields on
 * hr_assets in one transaction — a DB-level failure partway (e.g. the partial unique
 * index rejecting a second open assignment for the same asset) rolls both back.
 */
export async function assignAsset(assetId: string, input: AssignAssetInput): Promise<AssetRecord> {
  await requireEmployee(input.employeeId);

  const [asset] = await db.select().from(hr_assets).where(eq(hr_assets.id, assetId)).limit(1);
  if (!asset) throw new AppError("Asset not found", 404);

  assertAssetStatusTransition(asset.status, "ASSIGNED");

  try {
    await db.transaction(async (tx) => {
      await tx.insert(hr_asset_assignments).values({
        asset_id: assetId,
        employee_id: input.employeeId,
        assigned_by: input.assignedBy ?? null,
        notes: input.notes ?? null,
      });

      await tx
        .update(hr_assets)
        .set({
          status: "ASSIGNED",
          assigned_to_employee_id: input.employeeId,
          assigned_at: new Date(),
          returned_at: null,
          updated_at: new Date(),
        })
        .where(eq(hr_assets.id, assetId));
    });
  } catch (error) {
    if ((error as { code?: string })?.code === "23505") {
      throw new AppError("Asset already has an open assignment", 409, "ASSET_ALREADY_ASSIGNED");
    }
    throw error;
  }

  try {
    await sendNotification({
      type: "ASSET_ASSIGNED",
      triggeredBy: input.assignedBy ?? 0,
      relatedEntity: { assetId, employeeId: input.employeeId },
      title: "Asset assigned",
      message: `Asset "${asset.device_name}" has been assigned.`,
      priority: "NORMAL",
    });
  } catch {
    // notification failure must not break the main operation
  }

  return getAssetById(assetId);
}

export interface ReturnAssetInput {
  condition: string;
  notes?: string;
  hasIssue?: boolean;
}

/**
 * Closes the asset's open assignment (409 if there isn't one) and routes the asset to
 * AVAILABLE, or UNDER_MAINTENANCE when hasIssue is set — both legal from ASSIGNED.
 */
export async function returnAsset(assetId: string, input: ReturnAssetInput): Promise<AssetRecord> {
  const [asset] = await db.select().from(hr_assets).where(eq(hr_assets.id, assetId)).limit(1);
  if (!asset) throw new AppError("Asset not found", 404);

  const [openAssignment] = await db
    .select()
    .from(hr_asset_assignments)
    .where(
      and(eq(hr_asset_assignments.asset_id, assetId), isNull(hr_asset_assignments.returned_at)),
    )
    .limit(1);

  if (!openAssignment) {
    throw new AppError("Asset has no open assignment to return", 409, "ASSET_NOT_ASSIGNED");
  }

  const targetStatus = input.hasIssue ? ("UNDER_MAINTENANCE" as const) : ("AVAILABLE" as const);
  assertAssetStatusTransition(asset.status, targetStatus);

  await db.transaction(async (tx) => {
    await tx
      .update(hr_asset_assignments)
      .set({
        returned_at: new Date(),
        return_condition: input.condition,
        notes: input.notes ?? openAssignment.notes,
        updated_at: new Date(),
      })
      .where(eq(hr_asset_assignments.id, openAssignment.id));

    await tx
      .update(hr_assets)
      .set({
        status: targetStatus,
        assigned_to_employee_id: null,
        returned_at: new Date(),
        has_issue: input.hasIssue ? "YES" : asset.has_issue,
        updated_at: new Date(),
      })
      .where(eq(hr_assets.id, assetId));
  });

  try {
    await sendNotification({
      type: "ASSET_RETURNED",
      triggeredBy: 0,
      relatedEntity: { assetId, employeeId: openAssignment.employee_id },
      title: "Asset returned",
      message: `Asset "${asset.device_name}" has been returned.`,
      priority: "LOW",
    });
  } catch {
    // notification failure must not break the main operation
  }

  return getAssetById(assetId);
}

// ── Flags ─────────────────────────────────────────────────────────────────────

export async function flagAsset(id: string, note?: string): Promise<AssetRecord> {
  const [updated] = await db
    .update(hr_assets)
    .set({
      is_flagged: true,
      notes: note !== undefined ? note : undefined,
      updated_at: new Date(),
    })
    .where(eq(hr_assets.id, id))
    .returning();
  if (!updated) throw new AppError("Asset not found", 404);
  return getAssetById(id);
}

export async function unflagAsset(id: string): Promise<AssetRecord> {
  const [updated] = await db
    .update(hr_assets)
    .set({ is_flagged: false, updated_at: new Date() })
    .where(eq(hr_assets.id, id))
    .returning();
  if (!updated) throw new AppError("Asset not found", 404);
  return getAssetById(id);
}

// ── History (MOD-04 §4 GET /:id/history) ────────────────────────────────────

export async function getAssetHistory(id: string) {
  await getAssetById(id); // 404s if the asset doesn't exist

  const assignments = await db
    .select()
    .from(hr_asset_assignments)
    .where(eq(hr_asset_assignments.asset_id, id))
    .orderBy(desc(hr_asset_assignments.assigned_at));

  const maintenance = await db
    .select()
    .from(hr_asset_maintenance)
    .where(eq(hr_asset_maintenance.asset_id, id))
    .orderBy(desc(hr_asset_maintenance.maintenance_date));

  return { assignments, maintenance };
}

// ── Self-service + LCM-02 gate ──────────────────────────────────────────────

/** GET /hr/me/assets — an employee's own currently-assigned assets. */
export async function listMyAssets(employeeId: string): Promise<AssetRecord[]> {
  return listAssets({ assignedTo: employeeId });
}

/**
 * POST /hr/me/assets/:id/report-issue — employee self-service. Gated at the route on
 * assets:read (which employees hold for their own assigned assets per auth-and-rbac.md §3),
 * not assets:manage; ownership is enforced here in the service layer, the same pattern used
 * elsewhere in this file ("Ownership rules... enforced in the service layer, not the
 * middleware" — auth-and-rbac.md §3). Only sets has_issue; is_flagged stays an hr/admin-only
 * concern via flagAsset/unflagAsset above.
 */
export async function reportAssetIssue(
  id: string,
  employeeId: string,
  note?: string,
): Promise<AssetRecord> {
  const rows = await db.select().from(hr_assets).where(eq(hr_assets.id, id)).limit(1);
  if (!rows.length) throw new AppError("Asset not found", 404);

  if (rows[0].assigned_to_employee_id !== employeeId) {
    throw new AppError("You can only report issues on assets currently assigned to you", 403);
  }

  await db
    .update(hr_assets)
    .set({
      has_issue: "YES",
      notes: note !== undefined ? note : undefined,
      updated_at: new Date(),
    })
    .where(eq(hr_assets.id, id));

  return getAssetById(id);
}

export interface EmployeeAssetAssignmentRow {
  assetId: string;
  deviceName: string;
  serialNumber: string;
  assignedAt: Date;
  returnedAt: Date | null;
  notes: string | null;
}

/**
 * GET /hr/employees/:id/assets?open=true — the LCM-02 offboarding gate. Frozen shape once
 * consumed there: one row per assignment (not per asset), assetId + returnedAt so callers
 * can tell "currently holding" (returnedAt null) from history.
 */
export async function getAssetsForEmployee(
  employeeId: string,
  openOnly: boolean,
): Promise<EmployeeAssetAssignmentRow[]> {
  await requireEmployee(employeeId);

  const conditions = [eq(hr_asset_assignments.employee_id, employeeId)];
  if (openOnly) conditions.push(isNull(hr_asset_assignments.returned_at));

  const rows = await db
    .select({
      assetId: hr_asset_assignments.asset_id,
      deviceName: hr_assets.device_name,
      serialNumber: hr_assets.serial_number,
      assignedAt: hr_asset_assignments.assigned_at,
      returnedAt: hr_asset_assignments.returned_at,
      notes: hr_asset_assignments.notes,
    })
    .from(hr_asset_assignments)
    .innerJoin(hr_assets, eq(hr_asset_assignments.asset_id, hr_assets.id))
    .where(and(...conditions))
    .orderBy(desc(hr_asset_assignments.assigned_at));

  return rows;
}
