import type {
  Notification,
  NewNotification,
  NotificationPreference,
} from "@/db/schema/hr/notification";
import type { notificationTypeEnum } from "@/db/schema/hr/hr.enums";

export type { Notification, NewNotification, NotificationPreference };

export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];

export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export type NotificationStatus = "UNREAD" | "READ" | "ARCHIVED";

export interface RelatedEntityIds {
  employeeId?: string;
  contractId?: string;
  leaveId?: string;
  ticketId?: string;
  assetId?: string;
  policyId?: string;
}

export interface SendNotificationPayload {
  type: NotificationType;
  triggeredBy: number;
  relatedEntity: RelatedEntityIds;
  title: string;
  message: string;
  priority?: NotificationPriority;
}

export interface NotificationFilters {
  status?: NotificationStatus;
  type?: NotificationType;
  limit?: number;
  offset?: number;
}

export interface UpdateNotificationPreferencesInput {
  contractExpiry?: boolean;
  leaveUpdates?: boolean;
  ticketUpdates?: boolean;
  assetUpdates?: boolean;
  policyUpdates?: boolean;
}
