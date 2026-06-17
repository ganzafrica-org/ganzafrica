import { Request, Response } from "express";
import { constants, Logger } from "@/config";
import { AppError } from "@/middlewares";
import * as notificationService from "./notification.service";
import type { NotificationFilters, NotificationStatus, NotificationType } from "./notification.types";

const logger = new Logger("NotificationController");

function handleErrorResponse(error: unknown, res: Response, errorType: string): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: errorType, message: error.message });
  } else {
    res.status(500).json({
      error: errorType,
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
}

export const listNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await notificationService.resolvePlatformUserIdFromHrUser(req.user!.id);
    const q = req.query as Record<string, string | undefined>;

    const filters: NotificationFilters = {
      status: q.status as NotificationStatus | undefined,
      type: q.type as NotificationType | undefined,
      limit: q.limit ? Number(q.limit) : undefined,
      offset: q.offset ? Number(q.offset) : undefined,
    };

    const result = await notificationService.getNotifications(userId, filters);
    res.status(200).json(result);
  } catch (error) {
    logger.error("List notifications error", error);
    handleErrorResponse(error, res, "List Notifications Error");
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await notificationService.resolvePlatformUserIdFromHrUser(req.user!.id);
    const count = await notificationService.getUnreadCount(userId);
    res.status(200).json({ count });
  } catch (error) {
    logger.error("Get unread count error", error);
    handleErrorResponse(error, res, "Unread Count Error");
  }
};

export const markNotificationRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await notificationService.resolvePlatformUserIdFromHrUser(req.user!.id);
    await notificationService.markAsRead(req.params.id, userId);
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    logger.error("Mark notification read error", error);
    handleErrorResponse(error, res, "Mark Read Error");
  }
};

export const markAllNotificationsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await notificationService.resolvePlatformUserIdFromHrUser(req.user!.id);
    await notificationService.markAllAsRead(userId);
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    logger.error("Mark all notifications read error", error);
    handleErrorResponse(error, res, "Mark All Read Error");
  }
};

export const archiveNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await notificationService.resolvePlatformUserIdFromHrUser(req.user!.id);
    await notificationService.archiveNotification(req.params.id, userId);
    res.status(200).json({ message: "Notification archived" });
  } catch (error) {
    logger.error("Archive notification error", error);
    handleErrorResponse(error, res, "Archive Notification Error");
  }
};

export const getNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await notificationService.resolvePlatformUserIdFromHrUser(req.user!.id);
    const preferences = await notificationService.getPreferences(userId);
    res.status(200).json(preferences);
  } catch (error) {
    logger.error("Get notification preferences error", error);
    handleErrorResponse(error, res, "Get Preferences Error");
  }
};

export const updateNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await notificationService.resolvePlatformUserIdFromHrUser(req.user!.id);
    const preferences = await notificationService.updatePreferences(userId, req.body);
    res.status(200).json(preferences);
  } catch (error) {
    logger.error("Update notification preferences error", error);
    handleErrorResponse(error, res, "Update Preferences Error");
  }
};
