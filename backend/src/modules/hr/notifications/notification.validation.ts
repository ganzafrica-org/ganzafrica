import { z } from "zod";

const notificationType = z.enum([
  "EMPLOYEE_CREATED",
  "EMPLOYEE_STATUS_CHANGED",
  "CONTRACT_CREATED",
  "CONTRACT_UPDATED",
  "CONTRACT_EXPIRING",
  "LEAVE_REQUESTED",
  "LEAVE_APPROVED",
  "LEAVE_REJECTED",
  "LEAVE_CANCELLED",
  "TICKET_CREATED",
  "TICKET_STATUS_CHANGED",
  "TICKET_ASSIGNED",
  "ASSET_ASSIGNED",
  "ASSET_RETURNED",
  "ASSET_STATUS_CHANGED",
  "POLICY_PUBLISHED",
]);

const notificationStatus = z.enum(["UNREAD", "READ", "ARCHIVED"]);

export const getNotificationsQuerySchema = z.object({
  query: z.object({
    status: notificationStatus.optional(),
    type: notificationType.optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  }),
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid notification id"),
  }),
});

export const updatePreferencesBodySchema = z.object({
  body: z.object({
    contractExpiry: z.boolean().optional(),
    leaveUpdates: z.boolean().optional(),
    ticketUpdates: z.boolean().optional(),
    assetUpdates: z.boolean().optional(),
    policyUpdates: z.boolean().optional(),
  }),
});
