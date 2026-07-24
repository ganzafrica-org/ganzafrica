import { z } from "zod";
import { notificationTypeEnum } from "@/db/schema/hr/hr.enums";

// Derived from the DB enum so the two cannot drift (a hand-copied list here had gone stale).
const notificationType = z.enum(notificationTypeEnum.enumValues);

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
