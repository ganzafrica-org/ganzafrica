"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactValidation = exports.listNewsletterSubscribersSchema = exports.newsletterUnsubscribeSchema = exports.newsletterSubscribeSchema = exports.listContactsSchema = exports.deleteContactSchema = exports.updateContactSchema = exports.getContactSchema = exports.createContactSchema = void 0;
const zod_1 = require("zod");
// Schema for creating a new contact message
exports.createContactSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(2, "Name must be at least 2 characters long")
            .max(200, "Name must be at most 200 characters long"),
        email: zod_1.z
            .string()
            .email("Email must be a valid email address"),
        phone: zod_1.z
            .string()
            .max(50, "Phone number must be at most 50 characters long")
            .optional(),
        message: zod_1.z
            .string()
            .min(10, "Message must be at least 10 characters long"),
        location: zod_1.z
            .string()
            .max(100, "Location must be at most 100 characters long")
            .optional(),
    }),
});
// Schema for getting a contact by ID
exports.getContactSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
});
// Schema for updating a contact
exports.updateContactSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
    body: zod_1.z
        .object({
        status: zod_1.z
            .string()
            .min(2, "Status must be at least 2 characters long")
            .max(50, "Status must be at most 50 characters long")
            .optional(),
        is_resolved: zod_1.z
            .boolean()
            .optional(),
        responded_at: zod_1.z
            .string()
            .datetime({ offset: true })
            .optional()
            .nullable(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field to update must be provided",
    }),
});
// Schema for deleting a contact
exports.deleteContactSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
});
// Schema for listing contacts with optional filters
exports.listContactsSchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z
            .string()
            .optional(),
        is_resolved: zod_1.z
            .string()
            .refine((value) => value === "true" || value === "false" || value === undefined, {
            message: "is_resolved must be 'true' or 'false'",
        })
            .optional(),
        location: zod_1.z
            .string()
            .optional(),
        sort_by: zod_1.z
            .string()
            .optional(),
        sort_order: zod_1.z
            .string()
            .refine((value) => value === "asc" || value === "desc" || value === undefined, {
            message: "sort_order must be 'asc' or 'desc'",
        })
            .optional(),
    }),
});
// Newsletter subscription schema
exports.newsletterSubscribeSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string()
            .email("Email must be a valid email address"),
    }),
});
// Newsletter unsubscribe schema
exports.newsletterUnsubscribeSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((value) => !isNaN(parseInt(value)), {
            message: "ID must be a number",
        }),
    }),
});
// Schema for listing newsletter subscribers
exports.listNewsletterSubscribersSchema = zod_1.z.object({
    query: zod_1.z.object({
        active_only: zod_1.z
            .string()
            .refine((value) => value === "true" || value === "false" || value === undefined, {
            message: "active_only must be 'true' or 'false'",
        })
            .optional(),
        sort_by: zod_1.z
            .string()
            .optional(),
        sort_order: zod_1.z
            .string()
            .refine((value) => value === "asc" || value === "desc" || value === undefined, {
            message: "sort_order must be 'asc' or 'desc'",
        })
            .optional(),
    }),
});
// Export all contact validation schemas
exports.contactValidation = {
    createContactSchema: exports.createContactSchema,
    getContactSchema: exports.getContactSchema,
    updateContactSchema: exports.updateContactSchema,
    deleteContactSchema: exports.deleteContactSchema,
    listContactsSchema: exports.listContactsSchema,
    newsletterSubscribeSchema: exports.newsletterSubscribeSchema,
    newsletterUnsubscribeSchema: exports.newsletterUnsubscribeSchema,
    listNewsletterSubscribersSchema: exports.listNewsletterSubscribersSchema
};
// Default export
exports.default = exports.contactValidation;
