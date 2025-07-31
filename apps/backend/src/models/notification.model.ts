import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateNotificationDto {
  userId: number;
  title: string;
  message: string;
  type: string;
  priority: 'normal' | 'high';
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  priority: 'normal' | 'high';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationModel {
  // Create a new notification
  static async create(data: CreateNotificationDto): Promise<Notification> {
    return prisma.notification.create({
      data: {
        ...data,
        isRead: false,
      },
    });
  }

  // Get paginated notifications for a user
  static async getNotifications(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({
        where: { userId },
      }),
    ]);

    return {
      notifications,
      total,
      hasMore: skip + notifications.length < total,
    };
  }

  // Get unread notifications count for a user
  static async getUnreadCount(userId: number): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  // Mark a notification as read
  static async markAsRead(id: number, userId: number): Promise<Notification> {
    return prisma.notification.update({
      where: {
        id,
        userId, // Ensure the notification belongs to the user
      },
      data: {
        isRead: true,
      },
    });
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: number): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  // Delete a notification
  static async delete(id: number, userId: number): Promise<void> {
    await prisma.notification.delete({
      where: {
        id,
        userId, // Ensure the notification belongs to the user
      },
    });
  }
} 