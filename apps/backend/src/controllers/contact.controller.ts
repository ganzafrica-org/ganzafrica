import { Request, Response } from 'express';
import { ContactModel, CreateContactDto } from '../models/contact.model';
import { NotificationModel } from '../models/notification.model';
import { WebSocketService } from '../services/websocket.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ContactController {
  // Submit a contact form
  static async submit(req: Request, res: Response) {
    try {
      const contactData: CreateContactDto = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        message: req.body.message,
        location: req.body.location,
      };

      // Create contact submission
      const contact = await ContactModel.create(contactData);

      // Get all admin users
      const adminUsers = await prisma.user.findMany({
        where: { isAdmin: true },
      });

      // Create notifications for all admin users
      const notificationPromises = adminUsers.map(admin => 
        NotificationModel.create({
          userId: admin.id,
          title: 'New Contact Form Submission',
          message: `New message from ${contact.name} (${contact.email}) in ${contact.location}`,
          type: 'contact',
          priority: 'normal',
        })
      );

      const notifications = await Promise.all(notificationPromises);

      // Send real-time notifications via WebSocket
      notifications.forEach(notification => {
        WebSocketService.sendNotification(notification.userId, notification);
      });

      res.status(201).json({ message: 'Contact form submitted successfully' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get all contacts (admin only)
  static async getAll(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await ContactModel.getAll(page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get a single contact (admin only)
  static async getById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const contactId = parseInt(req.params.id);
      if (isNaN(contactId)) {
        return res.status(400).json({ message: 'Invalid contact ID' });
      }

      const contact = await ContactModel.getById(contactId);
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      res.json(contact);
    } catch (error) {
      console.error('Error fetching contact:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Delete a contact (admin only)
  static async delete(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const contactId = parseInt(req.params.id);
      if (isNaN(contactId)) {
        return res.status(400).json({ message: 'Invalid contact ID' });
      }

      await ContactModel.delete(contactId);
      res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
      console.error('Error deleting contact:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
} 