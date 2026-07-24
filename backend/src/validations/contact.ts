import { z } from "zod";

// Schema for creating a new contact message
export const createContactSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(200, "Name must be at most 200 characters long"),
    email: z.string().email("Email must be a valid email address"),
    phone: z.string().max(50, "Phone number must be at most 50 characters long").optional(),
    message: z.string().min(10, "Message must be at least 10 characters long"),
    location: z.string().max(100, "Location must be at most 100 characters long").optional(),
  }),
});

// Schema for getting a contact by ID
export const getContactSchema = z.object({
  params: z.object({
    id: z.string().refine((value) => !isNaN(parseInt(value)), {
      message: "ID must be a number",
    }),
  }),
});

// Schema for updating a contact
export const updateContactSchema = z.object({
  params: z.object({
    id: z.string().refine((value) => !isNaN(parseInt(value)), {
      message: "ID must be a number",
    }),
  }),
  body: z
    .object({
      status: z
        .string()
        .min(2, "Status must be at least 2 characters long")
        .max(50, "Status must be at most 50 characters long")
        .optional(),
      is_resolved: z.boolean().optional(),
      responded_at: z.string().datetime({ offset: true }).optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field to update must be provided",
    }),
});

// Schema for deleting a contact
export const deleteContactSchema = z.object({
  params: z.object({
    id: z.string().refine((value) => !isNaN(parseInt(value)), {
      message: "ID must be a number",
    }),
  }),
});

// Schema for listing contacts with optional filters
export const listContactsSchema = z.object({
  query: z.object({
    status: z.string().optional(),
    is_resolved: z
      .string()
      .refine((value) => value === "true" || value === "false" || value === undefined, {
        message: "is_resolved must be 'true' or 'false'",
      })
      .optional(),
    location: z.string().optional(),
    sort_by: z.string().optional(),
    sort_order: z
      .string()
      .refine((value) => value === "asc" || value === "desc" || value === undefined, {
        message: "sort_order must be 'asc' or 'desc'",
      })
      .optional(),
  }),
});

// Newsletter subscription schema
export const newsletterSubscribeSchema = z.object({
  body: z.object({
    email: z.string().email("Email must be a valid email address"),
  }),
});

// Newsletter unsubscribe schema
export const newsletterUnsubscribeSchema = z.object({
  params: z.object({
    id: z.string().refine((value) => !isNaN(parseInt(value)), {
      message: "ID must be a number",
    }),
  }),
});
// Schema for listing newsletter subscribers
export const listNewsletterSubscribersSchema = z.object({
  query: z.object({
    active_only: z
      .string()
      .refine((value) => value === "true" || value === "false" || value === undefined, {
        message: "active_only must be 'true' or 'false'",
      })
      .optional(),
    sort_by: z.string().optional(),
    sort_order: z
      .string()
      .refine((value) => value === "asc" || value === "desc" || value === undefined, {
        message: "sort_order must be 'asc' or 'desc'",
      })
      .optional(),
  }),
});
// Export all contact validation schemas
export const contactValidation = {
  createContactSchema,
  getContactSchema,
  updateContactSchema,
  deleteContactSchema,
  listContactsSchema,
  newsletterSubscribeSchema,
  newsletterUnsubscribeSchema,
  listNewsletterSubscribersSchema,
};

// Default export
export default contactValidation;
