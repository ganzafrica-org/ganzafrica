import { and, count, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  hr_assets,
  hr_contracts,
  hr_helpdesk_tickets,
  hr_leaves,
  hr_notification_preferences,
  hr_notifications,
  hr_users,
} from "@/db/schema";
import { AppError } from "@/middlewares";
import type {
  NotificationFilters,
  NotificationPriority,
  NotificationType,
  RelatedEntityIds,
  SendNotificationPayload,
  UpdateNotificationPreferencesInput,
} from "./notification.types";

type RoutingTarget = { it: boolean; hr: boolean; employee: false | true | "all" };

const NOTIFICATION_ROUTING: Record<NotificationType, RoutingTarget> = {
  EMPLOYEE_CREATED: { it: true, hr: true, employee: false },
  EMPLOYEE_STATUS_CHANGED: { it: true, hr: true, employee: true },
  CONTRACT_CREATED: { it: true, hr: true, employee: true },
  CONTRACT_UPDATED: { it: true, hr: true, employee: true },
  CONTRACT_EXPIRING: { it: true, hr: true, employee: true },
  LEAVE_REQUESTED: { it: true, hr: true, employee: false },
  // Targets the approver directly (manager, or HR when the requester has no manager); the explicit
  // recipient is set by the caller rather than fanned out by role.
  LEAVE_PENDING_APPROVAL: { it: false, hr: false, employee: false },
  LEAVE_APPROVED: { it: true, hr: false, employee: true },
  LEAVE_REJECTED: { it: true, hr: false, employee: true },
  LEAVE_CANCELLED: { it: true, hr: true, employee: false },
  TICKET_CREATED: { it: true, hr: false, employee: false },
  TICKET_STATUS_CHANGED: { it: true, hr: false, employee: true },
  TICKET_ASSIGNED: { it: true, hr: false, employee: true },
  ASSET_ASSIGNED: { it: true, hr: true, employee: true },
  ASSET_RETURNED: { it: true, hr: true, employee: false },
  ASSET_STATUS_CHANGED: { it: true, hr: true, employee: false },
  DOCUMENT_PUBLISHED: { it: true, hr: true, employee: "all" },
  // Lifecycle tasks address a specific assignee, resolved by the caller (LCM-01/02).
  // All three address specific people the caller resolves on the employees model; the role fan-out
  // here still reads legacy hr_users, so it would silently drop these.
  PROCESS_TASK_ASSIGNED: { it: false, hr: false, employee: false },
  PROCESS_TASK_OVERDUE: { it: false, hr: false, employee: false },
  PROCESS_COMPLETED: { it: false, hr: false, employee: false },
};

const LEAVE_TYPES: NotificationType[] = [
  "LEAVE_REQUESTED",
  "LEAVE_PENDING_APPROVAL",
  "LEAVE_APPROVED",
  "LEAVE_REJECTED",
  "LEAVE_CANCELLED",
];

const TICKET_TYPES: NotificationType[] = [
  "TICKET_CREATED",
  "TICKET_STATUS_CHANGED",
  "TICKET_ASSIGNED",
];

const ASSET_TYPES: NotificationType[] = [
  "ASSET_ASSIGNED",
  "ASSET_RETURNED",
  "ASSET_STATUS_CHANGED",
];

function isPreferenceEnabled(
  prefs: typeof hr_notification_preferences.$inferSelect | undefined,
  type: NotificationType,
): boolean {
  if (!prefs) return true;

  if (type === "CONTRACT_EXPIRING") return prefs.contract_expiry;
  if (LEAVE_TYPES.includes(type)) return prefs.leave_updates;
  if (TICKET_TYPES.includes(type)) return prefs.ticket_updates;
  if (ASSET_TYPES.includes(type)) return prefs.asset_updates;
  if (type === "DOCUMENT_PUBLISHED") return prefs.policy_updates;

  return true;
}

async function platformUserIdsByHrRole(role: "IT" | "HR"): Promise<number[]> {
  const rows = await db
    .select({ platformUserId: hr_users.platform_user_id })
    .from(hr_users)
    .where(eq(hr_users.role, role));

  return rows.map((r) => r.platformUserId).filter((id): id is number => id != null);
}

async function platformUserIdForHrEmployee(employeeId: string): Promise<number | null> {
  const rows = await db
    .select({ platformUserId: hr_users.platform_user_id })
    .from(hr_users)
    .where(eq(hr_users.id, employeeId))
    .limit(1);

  return rows.length ? rows[0].platformUserId : null;
}

async function allEmployeePlatformUserIds(): Promise<number[]> {
  const rows = await db.select({ platformUserId: hr_users.platform_user_id }).from(hr_users);

  return rows.map((r) => r.platformUserId).filter((id): id is number => id != null);
}

async function resolveEmployeeIdFromEntity(
  relatedEntity: RelatedEntityIds,
  type: NotificationType,
): Promise<string | null> {
  if (relatedEntity.employeeId) return relatedEntity.employeeId;

  if (relatedEntity.contractId) {
    const rows = await db
      .select({ employeeId: hr_contracts.employee_id })
      .from(hr_contracts)
      .where(eq(hr_contracts.id, relatedEntity.contractId))
      .limit(1);
    return rows.length ? rows[0].employeeId : null;
  }

  if (relatedEntity.leaveId) {
    const rows = await db
      .select({ employeeId: hr_leaves.user_id })
      .from(hr_leaves)
      .where(eq(hr_leaves.id, relatedEntity.leaveId))
      .limit(1);
    return rows.length ? rows[0].employeeId : null;
  }

  if (relatedEntity.ticketId) {
    const rows = await db
      .select({
        submittedById: hr_helpdesk_tickets.submitted_by_id,
        assignedToId: hr_helpdesk_tickets.assigned_to_id,
      })
      .from(hr_helpdesk_tickets)
      .where(eq(hr_helpdesk_tickets.id, relatedEntity.ticketId))
      .limit(1);

    if (!rows.length) return null;
    if (type === "TICKET_ASSIGNED") return rows[0].assignedToId;
    if (type === "TICKET_STATUS_CHANGED") return rows[0].submittedById;
    return rows[0].submittedById;
  }

  if (relatedEntity.assetId) {
    const rows = await db
      .select({ employeeId: hr_assets.assigned_to_id })
      .from(hr_assets)
      .where(eq(hr_assets.id, relatedEntity.assetId))
      .limit(1);
    return rows.length ? rows[0].employeeId : null;
  }

  return null;
}

export async function resolveRecipients(
  type: NotificationType,
  relatedEntity: RelatedEntityIds,
  explicitRecipientIds: number[] = [],
): Promise<number[]> {
  const routing = NOTIFICATION_ROUTING[type];
  const recipientSet = new Set<number>(explicitRecipientIds);

  if (routing.it) {
    for (const id of await platformUserIdsByHrRole("IT")) {
      recipientSet.add(id);
    }
  }

  if (routing.hr) {
    for (const id of await platformUserIdsByHrRole("HR")) {
      recipientSet.add(id);
    }
  }

  if (routing.employee === "all") {
    for (const id of await allEmployeePlatformUserIds()) {
      recipientSet.add(id);
    }
  } else if (routing.employee === true) {
    const employeeId = await resolveEmployeeIdFromEntity(relatedEntity, type);
    if (employeeId) {
      const platformUserId = await platformUserIdForHrEmployee(employeeId);
      if (platformUserId != null) recipientSet.add(platformUserId);
    }
  }

  if (!recipientSet.size) return [];

  const recipientIds = [...recipientSet];
  const prefsRows = await db
    .select()
    .from(hr_notification_preferences)
    .where(inArray(hr_notification_preferences.user_id, recipientIds));

  const prefsByUser = new Map(prefsRows.map((p) => [p.user_id, p]));

  return recipientIds.filter((userId) => isPreferenceEnabled(prefsByUser.get(userId), type));
}

export async function sendNotification(payload: SendNotificationPayload): Promise<void> {
  const recipients = await resolveRecipients(
    payload.type,
    payload.relatedEntity,
    payload.recipientUserIds ?? [],
  );
  if (!recipients.length) return;

  const priority: NotificationPriority = payload.priority ?? "NORMAL";
  const metadata = payload.relatedEntity;

  await db.insert(hr_notifications).values(
    recipients.map((recipientId) => ({
      recipient_id: recipientId,
      type: payload.type,
      priority,
      status: "UNREAD" as const,
      title: payload.title,
      message: payload.message,
      metadata,
      updated_at: new Date(),
    })),
  );
}

export async function resolvePlatformUserIdFromHrUser(hrUserId: string): Promise<number> {
  const platformUserId = await platformUserIdForHrEmployee(hrUserId);
  if (platformUserId == null) {
    throw new AppError("Platform account not linked to HR user", 400);
  }
  return platformUserId;
}

export async function resolveTriggeredByFromHrUser(hrUserId: string): Promise<number> {
  try {
    return await resolvePlatformUserIdFromHrUser(hrUserId);
  } catch {
    return 0;
  }
}

export async function getNotifications(userId: number, filters: NotificationFilters = {}) {
  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;
  const conditions = [eq(hr_notifications.recipient_id, userId)];

  if (filters.status) conditions.push(eq(hr_notifications.status, filters.status));
  if (filters.type) conditions.push(eq(hr_notifications.type, filters.type));

  const whereClause = and(...conditions);

  const [rows, totalRow, unreadRow] = await Promise.all([
    db
      .select()
      .from(hr_notifications)
      .where(whereClause)
      .orderBy(desc(hr_notifications.created_at))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(hr_notifications).where(whereClause),
    db
      .select({ unread: count() })
      .from(hr_notifications)
      .where(and(eq(hr_notifications.recipient_id, userId), eq(hr_notifications.status, "UNREAD"))),
  ]);

  return {
    data: rows,
    total: totalRow[0]?.total ?? 0,
    unreadCount: unreadRow[0]?.unread ?? 0,
  };
}

export async function getUnreadCount(userId: number): Promise<number> {
  const [row] = await db
    .select({ unread: count() })
    .from(hr_notifications)
    .where(and(eq(hr_notifications.recipient_id, userId), eq(hr_notifications.status, "UNREAD")));

  return row?.unread ?? 0;
}

export async function markAsRead(notificationId: string, userId: number): Promise<void> {
  const now = new Date();
  const updated = await db
    .update(hr_notifications)
    .set({ status: "READ", read_at: now, updated_at: now })
    .where(and(eq(hr_notifications.id, notificationId), eq(hr_notifications.recipient_id, userId)))
    .returning({ id: hr_notifications.id });

  if (!updated.length) throw new AppError("Notification not found", 404);
}

export async function markAllAsRead(userId: number): Promise<void> {
  const now = new Date();
  await db
    .update(hr_notifications)
    .set({ status: "READ", read_at: now, updated_at: now })
    .where(and(eq(hr_notifications.recipient_id, userId), eq(hr_notifications.status, "UNREAD")));
}

export async function archiveNotification(notificationId: string, userId: number): Promise<void> {
  const now = new Date();
  const updated = await db
    .update(hr_notifications)
    .set({ status: "ARCHIVED", updated_at: now })
    .where(and(eq(hr_notifications.id, notificationId), eq(hr_notifications.recipient_id, userId)))
    .returning({ id: hr_notifications.id });

  if (!updated.length) throw new AppError("Notification not found", 404);
}

export async function getPreferences(userId: number) {
  const rows = await db
    .select()
    .from(hr_notification_preferences)
    .where(eq(hr_notification_preferences.user_id, userId))
    .limit(1);

  if (rows.length) return rows[0];

  const [created] = await db
    .insert(hr_notification_preferences)
    .values({ user_id: userId })
    .returning();

  return created;
}

export async function updatePreferences(userId: number, input: UpdateNotificationPreferencesInput) {
  const existing = await db
    .select()
    .from(hr_notification_preferences)
    .where(eq(hr_notification_preferences.user_id, userId))
    .limit(1);

  const patch: Partial<typeof hr_notification_preferences.$inferInsert> = {
    updated_at: new Date(),
  };

  if (input.contractExpiry !== undefined) patch.contract_expiry = input.contractExpiry;
  if (input.leaveUpdates !== undefined) patch.leave_updates = input.leaveUpdates;
  if (input.ticketUpdates !== undefined) patch.ticket_updates = input.ticketUpdates;
  if (input.assetUpdates !== undefined) patch.asset_updates = input.assetUpdates;
  if (input.policyUpdates !== undefined) patch.policy_updates = input.policyUpdates;

  if (existing.length) {
    const [updated] = await db
      .update(hr_notification_preferences)
      .set(patch)
      .where(eq(hr_notification_preferences.user_id, userId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(hr_notification_preferences)
    .values({ user_id: userId, ...patch })
    .returning();

  return created;
}

async function contractExpiryAlreadyNotified(contractId: string): Promise<boolean> {
  const since = new Date(Date.now() - 25 * 60 * 60 * 1000);
  const rows = await db
    .select({ id: hr_notifications.id })
    .from(hr_notifications)
    .where(
      and(
        eq(hr_notifications.type, "CONTRACT_EXPIRING"),
        gte(hr_notifications.created_at, since),
        sql`${hr_notifications.metadata}->>'contractId' = ${contractId}`,
      ),
    )
    .limit(1);

  return rows.length > 0;
}

export async function scheduleContractExpiryCheck(): Promise<void> {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const contracts = await db
    .select()
    .from(hr_contracts)
    .where(
      and(
        eq(hr_contracts.status, "ACTIVE"),
        sql`${hr_contracts.end_date} IS NOT NULL`,
        gte(hr_contracts.end_date, now),
        lte(hr_contracts.end_date, in30Days),
      ),
    );

  for (const contract of contracts) {
    if (await contractExpiryAlreadyNotified(contract.id)) continue;

    const endDateLabel = contract.end_date?.toISOString().slice(0, 10) ?? "unknown";

    try {
      await sendNotification({
        type: "CONTRACT_EXPIRING",
        triggeredBy: 0,
        relatedEntity: {
          contractId: contract.id,
          employeeId: contract.employee_id ?? contract.employee_ref_id ?? undefined,
        },
        title: "Contract expiring soon",
        message: `A contract is set to expire on ${endDateLabel}. Review and renew if needed.`,
        priority: "HIGH",
      });
    } catch {
      // cron must not fail on individual contract errors
    }
  }
}
