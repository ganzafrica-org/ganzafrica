import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get paginated notifications
router.get('/', NotificationController.getNotifications);

// Get unread notifications count
router.get('/unread-count', NotificationController.getUnreadCount);

// Mark a notification as read
router.patch('/:id/read', NotificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', NotificationController.markAllAsRead);

// Delete a notification
router.delete('/:id', NotificationController.delete);

// Create a new notification (admin only)
router.post('/', NotificationController.create);

export default router; 