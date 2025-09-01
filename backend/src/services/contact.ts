import { db } from "../db/client";
import { contacts, newsletter_subscribers } from "../db/schema/contact";
import { eq, sql, desc, asc } from "drizzle-orm";
import { AppError } from "../middlewares";
import { Logger } from "../config";

const logger = new Logger("ContactService");

// Interface for contact creation
interface ContactData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  location?: string;
}

// Interface for contact update
interface ContactUpdateData {
  status?: string;
  is_resolved?: boolean;
  responded_at?: Date | null;
}

/**
 * Creates a new contact form submission
 * @param contactData The contact form data
 * @returns The created contact record
 */
export const createContact = async (contactData: ContactData) => {
  try {
    // Insert contact submission
    const [createdContact] = await db.insert(contacts).values({
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      message: contactData.message,
      location: contactData.location || "global",
      status: "pending",
      is_resolved: false,
    }).returning();

    return createdContact;
  } catch (error) {
    logger.error("Error creating contact", error);
    throw new AppError("Failed to submit contact form", 500);
  }
};

/**
 * Lists contact form submissions with optional filtering
 * @param status Optional status to filter by
 * @param isResolved Optional resolution status to filter by
 * @param location Optional location to filter by
 * @param sortBy Field to sort by (defaults to created_at)
 * @param sortOrder Sort order (asc or desc, defaults to desc)
 * @returns Array of contact form submissions
 */
export const listContacts = async (
  status?: string,
  isResolved?: boolean,
  location?: string,
  sortBy: string = 'created_at',
  sortOrder: string = 'desc'
) => {
  try {
    // Validate sort field to prevent SQL injection
    const validSortFields = ['id', 'name', 'email', 'status', 'created_at', 'responded_at'];
    const actualSortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    
    // Create sort params
    let orderByColumn;
    switch (actualSortField) {
      case 'id':
        orderByColumn = contacts.id;
        break;
      case 'name':
        orderByColumn = contacts.name;
        break;
      case 'email':
        orderByColumn = contacts.email;
        break;
      case 'status':
        orderByColumn = contacts.status;
        break;
      case 'responded_at':
        orderByColumn = contacts.responded_at;
        break;
      case 'created_at':
      default:
        orderByColumn = contacts.created_at;
        break;
    }
    
    // Use any type to bypass TypeScript's checks
    let queryBuilder: any = db.select().from(contacts);
    
    // Add filters
    if (status) {
      queryBuilder = queryBuilder.where(eq(contacts.status, status));
    }
    
    if (isResolved !== undefined) {
      queryBuilder = queryBuilder.where(eq(contacts.is_resolved, isResolved));
    }
    
    if (location) {
      queryBuilder = queryBuilder.where(eq(contacts.location, location));
    }
    
    // Add ordering
    if (sortOrder.toLowerCase() === 'asc') {
      queryBuilder = queryBuilder.orderBy(asc(orderByColumn));
    } else {
      queryBuilder = queryBuilder.orderBy(desc(orderByColumn));
    }
    
    // Execute the query
    const results = await queryBuilder;
    return results;
  } catch (error) {
    logger.error("Error listing contacts", error);
    throw new AppError("Failed to list contact submissions", 500);
  }
};

/**
 * Gets a contact submission by ID
 * @param id The contact ID
 * @returns The contact submission
 */
export const getContactById = async (id: number) => {
  try {
    const contact = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1).then(results => results[0]);

    if (!contact) {
      throw new AppError("Contact submission not found", 404);
    }

    return contact;
  } catch (error) {
    logger.error(`Error getting contact ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to get contact submission", 500);
  }
};

/**
 * Updates a contact submission
 * @param id The contact ID
 * @param updateData The update data
 * @returns The updated contact
 */
export const updateContact = async (id: number, updateData: ContactUpdateData) => {
  try {
    // Verify contact exists
    await getContactById(id);
    
    // Build update data
    const dataToUpdate: any = {};
    
    if (updateData.status) {
      dataToUpdate.status = updateData.status;
    }
    
    if (updateData.is_resolved !== undefined) {
      dataToUpdate.is_resolved = updateData.is_resolved;
      
      // If marking as resolved, automatically set responded_at to now
      if (updateData.is_resolved && !updateData.responded_at) {
        dataToUpdate.responded_at = new Date();
      }
    }
    
    if (updateData.responded_at !== undefined) {
      dataToUpdate.responded_at = updateData.responded_at;
    }
    
    // Always update the updated_at timestamp
    dataToUpdate.updated_at = new Date();
    
    // Update contact
    const [updatedContact] = await db.update(contacts)
      .set(dataToUpdate)
      .where(eq(contacts.id, id))
      .returning();

    if (!updatedContact) {
      throw new AppError("Contact submission not found", 404);
    }

    return updatedContact;
  } catch (error) {
    logger.error(`Error updating contact ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to update contact submission", 500);
  }
};

/**
 * Deletes a contact submission
 * @param id The contact ID
 */
export const deleteContact = async (id: number) => {
  try {
    // Verify contact exists
    await getContactById(id);
    
    // Delete contact
    const result = await db.delete(contacts)
      .where(eq(contacts.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new AppError("Contact submission not found", 404);
    }
    
    return true;
  } catch (error) {
    logger.error(`Error deleting contact ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to delete contact submission", 500);
  }
};

/**
 * Subscribes an email to the newsletter
 * @param email The email to subscribe
 * @returns The created subscription
 */
export const subscribeNewsletter = async (email: string) => {
  try {
    // Check if email already exists
    const existingSubscription = await db.select().from(newsletter_subscribers).where(eq(newsletter_subscribers.email, email)).limit(1).then(results => results[0]);

    // If exists but inactive, reactivate it
    if (existingSubscription) {
      if (!existingSubscription.is_active) {
        const [updatedSubscription] = await db.update(newsletter_subscribers)
          .set({
            is_active: true,
            unsubscribed_at: null,
            updated_at: new Date()
          })
          .where(eq(newsletter_subscribers.id, existingSubscription.id))
          .returning();
        
        return updatedSubscription;
      }
      
      // Already subscribed and active
      return existingSubscription;
    }

    // Insert new subscription
    const [newSubscription] = await db.insert(newsletter_subscribers).values({
      email: email,
      is_active: true,
      subscribed_at: new Date(),
    }).returning();

    return newSubscription;
  } catch (error) {
    logger.error("Error subscribing to newsletter", error);
    throw new AppError("Failed to subscribe to newsletter", 500);
  }
};

/**
 * Unsubscribes an email from the newsletter
 * @param id The subscription ID
 * @returns The updated subscription
 */
export const unsubscribeNewsletter = async (id: number) => {
  try {
    // Check if subscription exists
    const subscription = await db.select().from(newsletter_subscribers).where(eq(newsletter_subscribers.id, id)).limit(1).then(results => results[0]);

    if (!subscription) {
      throw new AppError("Subscription not found", 404);
    }

    // Update subscription to inactive
    const [updatedSubscription] = await db.update(newsletter_subscribers)
      .set({
        is_active: false,
        unsubscribed_at: new Date(),
        updated_at: new Date()
      })
      .where(eq(newsletter_subscribers.id, id))
      .returning();

    return updatedSubscription;
  } catch (error) {
    logger.error(`Error unsubscribing from newsletter ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to unsubscribe from newsletter", 500);
  }
};

/**
 * Lists all newsletter subscribers
 * @param activeOnly If true, only return active subscribers
 * @param sortBy Field to sort by (defaults to subscribed_at)
 * @param sortOrder Sort order (asc or desc, defaults to desc)
 * @returns Array of newsletter subscribers
 */
export const listNewsletterSubscribers = async (
  activeOnly: boolean = false,
  sortBy: string = 'subscribed_at',
  sortOrder: string = 'desc'
) => {
  try {
    // Validate sort field to prevent SQL injection
    const validSortFields = ['id', 'email', 'is_active', 'subscribed_at', 'unsubscribed_at', 'created_at', 'updated_at'];
    const actualSortField = validSortFields.includes(sortBy) ? sortBy : 'subscribed_at';
    
    // Create sort params
    let orderByColumn;
    switch (actualSortField) {
      case 'id':
        orderByColumn = newsletter_subscribers.id;
        break;
      case 'email':
        orderByColumn = newsletter_subscribers.email;
        break;
      case 'is_active':
        orderByColumn = newsletter_subscribers.is_active;
        break;
      case 'unsubscribed_at':
        orderByColumn = newsletter_subscribers.unsubscribed_at;
        break;
      case 'created_at':
        orderByColumn = newsletter_subscribers.created_at;
        break;
      case 'updated_at':
        orderByColumn = newsletter_subscribers.updated_at;
        break;
      case 'subscribed_at':
      default:
        orderByColumn = newsletter_subscribers.subscribed_at;
        break;
    }
    
    // Use any type to bypass TypeScript's checks
    let queryBuilder: any = db.select().from(newsletter_subscribers);
    
    // Apply active filter if requested
    if (activeOnly) {
      queryBuilder = queryBuilder.where(eq(newsletter_subscribers.is_active, true));
    }
    
    // Apply sorting
    if (sortOrder.toLowerCase() === 'asc') {
      queryBuilder = queryBuilder.orderBy(asc(orderByColumn));
    } else {
      queryBuilder = queryBuilder.orderBy(desc(orderByColumn));
    }
    
    // Execute the query
    const results = await queryBuilder;
    return results;
  } catch (error) {
    logger.error("Error listing newsletter subscribers", error);
    throw new AppError("Failed to list newsletter subscribers", 500);
  }
};

/**
 * Delete a newsletter subscriber by ID
 */
export const deleteNewsletterSubscriber = async (id: number): Promise<void> => {
  try {
    // Check if subscriber exists
    const existingSubscriber = await db.select()
      .from(newsletter_subscribers)
      .where(eq(newsletter_subscribers.id, id))
      .limit(1);

    if (existingSubscriber.length === 0) {
      throw new AppError('Newsletter subscriber not found', 404);
    }

    // Delete the subscriber
    await db.delete(newsletter_subscribers)
      .where(eq(newsletter_subscribers.id, id));

    logger.info(`Newsletter subscriber ${id} deleted successfully`);
  } catch (error) {
    logger.error(`Error deleting newsletter subscriber: ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete newsletter subscriber', 500);
  }
};

// Create contact service object for export
export const contactService = {
  createContact,
  listContacts,
  getContactById,
  updateContact,
  deleteContact,
  subscribeNewsletter,
  unsubscribeNewsletter,
  listNewsletterSubscribers,
  deleteNewsletterSubscriber
};

// Default export
export default contactService;