import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateContactDto {
  name: string;
  email: string;
  phone?: string;
  message: string;
  location: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ContactModel {
  // Create a new contact submission
  static async create(data: CreateContactDto): Promise<Contact> {
    return prisma.contact.create({
      data,
    });
  }

  // Get all contacts (admin only)
  static async getAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contact.count(),
    ]);

    return {
      contacts,
      total,
      hasMore: skip + contacts.length < total,
    };
  }

  // Get a single contact by ID (admin only)
  static async getById(id: number): Promise<Contact | null> {
    return prisma.contact.findUnique({
      where: { id },
    });
  }

  // Delete a contact (admin only)
  static async delete(id: number): Promise<void> {
    await prisma.contact.delete({
      where: { id },
    });
  }
} 