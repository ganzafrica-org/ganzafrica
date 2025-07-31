import { Request, Response } from 'express';
import { NotificationModel, CreateNotificationDto } from '../models/notification.model';
import { WebSocketService } from '../services/websocket.service';

export class NotificationController {
  // Get paginated notifications
  static async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await NotificationModel.getNotifications(userId, page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get unread notifications count
  static async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const count = await NotificationModel.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Mark a notification as read
  static async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: 'Invalid notification ID' });
      }

      const notification = await NotificationModel.markAsRead(notificationId, userId);
      res.json(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await NotificationModel.markAllAsRead(userId);
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Delete a notification
  static async delete(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: 'Invalid notification ID' });
      }

      await NotificationModel.delete(notificationId, userId);
      res.json({ message: 'Notification deleted' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create a new notification (admin only)
  static async create(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check if user is admin (implement your admin check logic here)
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const notificationData: CreateNotificationDto = {
        userId: req.body.userId,
        title: req.body.title,
        message: req.body.message,
        type: req.body.type,
        priority: req.body.priority || 'normal',
      };

      const notification = await NotificationModel.create(notificationData);

      // Send real-time notification via WebSocket
      WebSocketService.sendNotification(notificationData.userId, notification);

      res.status(201).json(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
} 