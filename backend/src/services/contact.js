"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactService = exports.listNewsletterSubscribers = exports.unsubscribeNewsletter = exports.subscribeNewsletter = exports.deleteContact = exports.updateContact = exports.getContactById = exports.listContacts = exports.createContact = void 0;
const client_1 = require("../db/client");
const contact_1 = require("../db/schema/contact");
const drizzle_orm_1 = require("drizzle-orm");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger("ContactService");
/**
 * Creates a new contact form submission
 * @param contactData The contact form data
 * @returns The created contact record
 */
const createContact = async (contactData) => {
    try {
        // Insert contact submission
        const [createdContact] = await client_1.db.insert(contact_1.contacts).values({
            name: contactData.name,
            email: contactData.email,
            phone: contactData.phone,
            message: contactData.message,
            location: contactData.location || "global",
            status: "pending",
            is_resolved: false,
        }).returning();
        return createdContact;
    }
    catch (error) {
        logger.error("Error creating contact", error);
        throw new middlewares_1.AppError("Failed to submit contact form", 500);
    }
};
exports.createContact = createContact;
/**
 * Lists contact form submissions with optional filtering
 * @param status Optional status to filter by
 * @param isResolved Optional resolution status to filter by
 * @param location Optional location to filter by
 * @param sortBy Field to sort by (defaults to created_at)
 * @param sortOrder Sort order (asc or desc, defaults to desc)
 * @returns Array of contact form submissions
 */
const listContacts = async (status, isResolved, location, sortBy = 'created_at', sortOrder = 'desc') => {
    try {
        // Validate sort field to prevent SQL injection
        const validSortFields = ['id', 'name', 'email', 'status', 'created_at', 'responded_at'];
        const actualSortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
        // Create sort params
        let orderByColumn;
        switch (actualSortField) {
            case 'id':
                orderByColumn = contact_1.contacts.id;
                break;
            case 'name':
                orderByColumn = contact_1.contacts.name;
                break;
            case 'email':
                orderByColumn = contact_1.contacts.email;
                break;
            case 'status':
                orderByColumn = contact_1.contacts.status;
                break;
            case 'responded_at':
                orderByColumn = contact_1.contacts.responded_at;
                break;
            case 'created_at':
            default:
                orderByColumn = contact_1.contacts.created_at;
                break;
        }
        // Use any type to bypass TypeScript's checks
        let queryBuilder = client_1.db.select().from(contact_1.contacts);
        // Add filters
        if (status) {
            queryBuilder = queryBuilder.where((0, drizzle_orm_1.eq)(contact_1.contacts.status, status));
        }
        if (isResolved !== undefined) {
            queryBuilder = queryBuilder.where((0, drizzle_orm_1.eq)(contact_1.contacts.is_resolved, isResolved));
        }
        if (location) {
            queryBuilder = queryBuilder.where((0, drizzle_orm_1.eq)(contact_1.contacts.location, location));
        }
        // Add ordering
        if (sortOrder.toLowerCase() === 'asc') {
            queryBuilder = queryBuilder.orderBy((0, drizzle_orm_1.asc)(orderByColumn));
        }
        else {
            queryBuilder = queryBuilder.orderBy((0, drizzle_orm_1.desc)(orderByColumn));
        }
        // Execute the query
        const results = await queryBuilder;
        return results;
    }
    catch (error) {
        logger.error("Error listing contacts", error);
        throw new middlewares_1.AppError("Failed to list contact submissions", 500);
    }
};
exports.listContacts = listContacts;
/**
 * Gets a contact submission by ID
 * @param id The contact ID
 * @returns The contact submission
 */
const getContactById = async (id) => {
    try {
        const contact = await client_1.db.select().from(contact_1.contacts).where((0, drizzle_orm_1.eq)(contact_1.contacts.id, id)).limit(1).then(results => results[0]);
        if (!contact) {
            throw new middlewares_1.AppError("Contact submission not found", 404);
        }
        return contact;
    }
    catch (error) {
        logger.error(`Error getting contact ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to get contact submission", 500);
    }
};
exports.getContactById = getContactById;
/**
 * Updates a contact submission
 * @param id The contact ID
 * @param updateData The update data
 * @returns The updated contact
 */
const updateContact = async (id, updateData) => {
    try {
        // Verify contact exists
        await (0, exports.getContactById)(id);
        // Build update data
        const dataToUpdate = {};
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
        const [updatedContact] = await client_1.db.update(contact_1.contacts)
            .set(dataToUpdate)
            .where((0, drizzle_orm_1.eq)(contact_1.contacts.id, id))
            .returning();
        if (!updatedContact) {
            throw new middlewares_1.AppError("Contact submission not found", 404);
        }
        return updatedContact;
    }
    catch (error) {
        logger.error(`Error updating contact ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to update contact submission", 500);
    }
};
exports.updateContact = updateContact;
/**
 * Deletes a contact submission
 * @param id The contact ID
 */
const deleteContact = async (id) => {
    try {
        // Verify contact exists
        await (0, exports.getContactById)(id);
        // Delete contact
        const result = await client_1.db.delete(contact_1.contacts)
            .where((0, drizzle_orm_1.eq)(contact_1.contacts.id, id))
            .returning();
        if (result.length === 0) {
            throw new middlewares_1.AppError("Contact submission not found", 404);
        }
        return true;
    }
    catch (error) {
        logger.error(`Error deleting contact ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to delete contact submission", 500);
    }
};
exports.deleteContact = deleteContact;
/**
 * Subscribes an email to the newsletter
 * @param email The email to subscribe
 * @returns The created subscription
 */
const subscribeNewsletter = async (email) => {
    try {
        // Check if email already exists
        const existingSubscription = await client_1.db.select().from(contact_1.newsletter_subscribers).where((0, drizzle_orm_1.eq)(contact_1.newsletter_subscribers.email, email)).limit(1).then(results => results[0]);
        // If exists but inactive, reactivate it
        if (existingSubscription) {
            if (!existingSubscription.is_active) {
                const [updatedSubscription] = await client_1.db.update(contact_1.newsletter_subscribers)
                    .set({
                    is_active: true,
                    unsubscribed_at: null,
                    updated_at: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(contact_1.newsletter_subscribers.id, existingSubscription.id))
                    .returning();
                return updatedSubscription;
            }
            // Already subscribed and active
            return existingSubscription;
        }
        // Insert new subscription
        const [newSubscription] = await client_1.db.insert(contact_1.newsletter_subscribers).values({
            email: email,
            is_active: true,
            subscribed_at: new Date(),
        }).returning();
        return newSubscription;
    }
    catch (error) {
        logger.error("Error subscribing to newsletter", error);
        throw new middlewares_1.AppError("Failed to subscribe to newsletter", 500);
    }
};
exports.subscribeNewsletter = subscribeNewsletter;
/**
 * Unsubscribes an email from the newsletter
 * @param id The subscription ID
 * @returns The updated subscription
 */
const unsubscribeNewsletter = async (id) => {
    try {
        // Check if subscription exists
        const subscription = await client_1.db.select().from(contact_1.newsletter_subscribers).where((0, drizzle_orm_1.eq)(contact_1.newsletter_subscribers.id, id)).limit(1).then(results => results[0]);
        if (!subscription) {
            throw new middlewares_1.AppError("Subscription not found", 404);
        }
        // Update subscription to inactive
        const [updatedSubscription] = await client_1.db.update(contact_1.newsletter_subscribers)
            .set({
            is_active: false,
            unsubscribed_at: new Date(),
            updated_at: new Date()
        })
            .where((0, drizzle_orm_1.eq)(contact_1.newsletter_subscribers.id, id))
            .returning();
        return updatedSubscription;
    }
    catch (error) {
        logger.error(`Error unsubscribing from newsletter ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to unsubscribe from newsletter", 500);
    }
};
exports.unsubscribeNewsletter = unsubscribeNewsletter;
/**
 * Lists all newsletter subscribers
 * @param activeOnly If true, only return active subscribers
 * @param sortBy Field to sort by (defaults to subscribed_at)
 * @param sortOrder Sort order (asc or desc, defaults to desc)
 * @returns Array of newsletter subscribers
 */
const listNewsletterSubscribers = async (activeOnly = false, sortBy = 'subscribed_at', sortOrder = 'desc') => {
    try {
        // Validate sort field to prevent SQL injection
        const validSortFields = ['id', 'email', 'is_active', 'subscribed_at', 'unsubscribed_at', 'created_at', 'updated_at'];
        const actualSortField = validSortFields.includes(sortBy) ? sortBy : 'subscribed_at';
        // Create sort params
        let orderByColumn;
        switch (actualSortField) {
            case 'id':
                orderByColumn = contact_1.newsletter_subscribers.id;
                break;
            case 'email':
                orderByColumn = contact_1.newsletter_subscribers.email;
                break;
            case 'is_active':
                orderByColumn = contact_1.newsletter_subscribers.is_active;
                break;
            case 'unsubscribed_at':
                orderByColumn = contact_1.newsletter_subscribers.unsubscribed_at;
                break;
            case 'created_at':
                orderByColumn = contact_1.newsletter_subscribers.created_at;
                break;
            case 'updated_at':
                orderByColumn = contact_1.newsletter_subscribers.updated_at;
                break;
            case 'subscribed_at':
            default:
                orderByColumn = contact_1.newsletter_subscribers.subscribed_at;
                break;
        }
        // Use any type to bypass TypeScript's checks
        let queryBuilder = client_1.db.select().from(contact_1.newsletter_subscribers);
        // Apply active filter if requested
        if (activeOnly) {
            queryBuilder = queryBuilder.where((0, drizzle_orm_1.eq)(contact_1.newsletter_subscribers.is_active, true));
        }
        // Apply sorting
        if (sortOrder.toLowerCase() === 'asc') {
            queryBuilder = queryBuilder.orderBy((0, drizzle_orm_1.asc)(orderByColumn));
        }
        else {
            queryBuilder = queryBuilder.orderBy((0, drizzle_orm_1.desc)(orderByColumn));
        }
        // Execute the query
        const results = await queryBuilder;
        return results;
    }
    catch (error) {
        logger.error("Error listing newsletter subscribers", error);
        throw new middlewares_1.AppError("Failed to list newsletter subscribers", 500);
    }
};
exports.listNewsletterSubscribers = listNewsletterSubscribers;
// Create contact service object for export
exports.contactService = {
    createContact: exports.createContact,
    listContacts: exports.listContacts,
    getContactById: exports.getContactById,
    updateContact: exports.updateContact,
    deleteContact: exports.deleteContact,
    subscribeNewsletter: exports.subscribeNewsletter,
    unsubscribeNewsletter: exports.unsubscribeNewsletter,
    listNewsletterSubscribers: exports.listNewsletterSubscribers
};
// Default export
exports.default = exports.contactService;
