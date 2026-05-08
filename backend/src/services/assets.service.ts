import { and, asc, desc, eq, gte, isNull, lte } from "drizzle-orm";
import { db } from "@/db/client";
import { hr_assets, hr_users } from "@/db/schema";
import { AppError } from "@/middlewares";

export interface RequestUser {
  id: string;
  role?: string;
}

export interface ListAssetsQuery {
  page: number;
  limit: number;
  owner?: string;
  hasIssue?: "YES" | "NO";
  isFlagged?: boolean;
  assignedFrom?: Date;
  assignedTo?: Date;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

function requireIt(requester: RequestUser): void {
  if (requester.role !== "IT") throw new AppError("Forbidden", 403);
}

export async function listAssets(requester: RequestUser, query: ListAssetsQuery) {
  requireIt(requester);

  const conditions = [];
  if (query.owner) {
    if (query.owner === "unassigned") conditions.push(isNull(hr_assets.assigned_to_id));
    else conditions.push(eq(hr_assets.assigned_to_id, query.owner));
  }
  if (query.hasIssue) conditions.push(eq(hr_assets.has_issue, query.hasIssue));
  if (query.isFlagged !== undefined) conditions.push(eq(hr_assets.is_flagged, query.isFlagged));
  if (query.assignedFrom) conditions.push(gte(hr_assets.assigned_at, query.assignedFrom));
  if (query.assignedTo) conditions.push(lte(hr_assets.assigned_at, query.assignedTo));

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const all = await db.select().from(hr_assets).where(whereClause);
  const total = all.length;

  const sortColumn = (() => {
    switch (query.sortBy) {
      case "deviceName":
        return hr_assets.device_name;
      case "serialNumber":
        return hr_assets.serial_number;
      case "assignedAt":
        return hr_assets.assigned_at;
      case "hasIssue":
        return hr_assets.has_issue;
      case "isFlagged":
        return hr_assets.is_flagged;
      default:
        return hr_assets.created_at;
    }
  })();

  const order = query.sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const rows = await db
    .select()
    .from(hr_assets)
    .where(whereClause)
    .orderBy(order)
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);

  const userIds = rows.map((a) => a.assigned_to_id).filter((v): v is string => Boolean(v));
  const assignedUsers = userIds.length
    ? await db
        .select({ id: hr_users.id, first: hr_users.first_name, last: hr_users.last_name, email: hr_users.email })
        .from(hr_users)
        .where(and(...userIds.map((id) => eq(hr_users.id, id))))
    : [];

  const map = new Map(assignedUsers.map((u) => [u.id, u]));

  const data = rows.map((a) => {
    const u = a.assigned_to_id ? map.get(a.assigned_to_id) : undefined;
    return {
      id: a.id,
      deviceName: a.device_name,
      serialNumber: a.serial_number,
      generation: a.generation,
      core: a.core,
      ram: a.ram,
      hardDisk: a.hard_disk,
      purchasePrice: a.purchase_price ? String(a.purchase_price) : null,
      assignedTo: a.assigned_to_id
        ? {
            id: a.assigned_to_id,
            fullName: u ? `${u.first} ${u.last}` : "UNASSIGNED",
            email: u?.email ?? "",
          }
        : null,
      assignedAt: a.assigned_at,
      hasIssue: a.has_issue,
      isFlagged: a.is_flagged,
    };
  });

  return { data, total };
}

export async function getAsset(requester: RequestUser, id: string) {
  requireIt(requester);
  const rows = await db.select().from(hr_assets).where(eq(hr_assets.id, id)).limit(1);
  if (!rows.length) throw new AppError("Asset not found", 404);
  return rows[0];
}

export async function createAsset(requester: RequestUser, body: any) {
  requireIt(requester);
  const inserted = await db
    .insert(hr_assets)
    .values({
      device_name: body.deviceName,
      serial_number: body.serialNumber,
      generation: body.generation,
      core: body.core,
      ram: body.ram,
      hard_disk: body.hardDisk,
      purchase_price: body.purchasePrice ?? null,
      has_issue: body.hasIssue ?? "NO",
      is_flagged: body.isFlagged ?? false,
    })
    .returning();
  return inserted[0];
}

export async function updateAsset(requester: RequestUser, id: string, body: any) {
  requireIt(requester);
  const updated = await db
    .update(hr_assets)
    .set({
      device_name: body.deviceName ?? undefined,
      serial_number: body.serialNumber ?? undefined,
      generation: body.generation ?? undefined,
      core: body.core ?? undefined,
      ram: body.ram ?? undefined,
      hard_disk: body.hardDisk ?? undefined,
      purchase_price: body.purchasePrice ?? undefined,
      has_issue: body.hasIssue ?? undefined,
      updated_at: new Date(),
    })
    .where(eq(hr_assets.id, id))
    .returning();
  if (!updated.length) throw new AppError("Asset not found", 404);
  return updated[0];
}

export async function deleteAsset(requester: RequestUser, id: string): Promise<void> {
  requireIt(requester);
  const result = await db.delete(hr_assets).where(eq(hr_assets.id, id)).returning({ id: hr_assets.id });
  if (!result.length) throw new AppError("Asset not found", 404);
}

export async function assignAsset(requester: RequestUser, id: string, userId: string | null) {
  requireIt(requester);
  const updated = await db
    .update(hr_assets)
    .set({
      assigned_to_id: userId,
      assigned_at: userId ? new Date() : null,
      updated_at: new Date(),
    })
    .where(eq(hr_assets.id, id))
    .returning();
  if (!updated.length) throw new AppError("Asset not found", 404);
  return updated[0];
}

export async function toggleFlag(requester: RequestUser, id: string) {
  requireIt(requester);
  const rows = await db.select().from(hr_assets).where(eq(hr_assets.id, id)).limit(1);
  if (!rows.length) throw new AppError("Asset not found", 404);
  const next = !rows[0].is_flagged;
  const updated = await db
    .update(hr_assets)
    .set({ is_flagged: next, updated_at: new Date() })
    .where(eq(hr_assets.id, id))
    .returning();
  return updated[0];
}

