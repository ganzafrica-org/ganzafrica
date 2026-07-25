import { z } from "zod";

const category = z.enum(["IT", "HR", "FACILITIES", "OTHER"]);
const status = z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"]);
const priority = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const ticketIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid("Invalid ticket id") }),
});

export const listTicketsSchema = z.object({
  query: z.object({
    status: status.optional(),
    category: category.optional(),
    priority: priority.optional(),
    assignee: z.coerce.number().int().positive().optional(),
  }),
});

export const createTicketSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().min(1, "Description is required").max(5000),
    category,
    priority: priority.optional(),
    asset_id: z.string().uuid().nullable().optional(),
  }),
});

export const transitionTicketSchema = z.object({
  params: z.object({ id: z.string().uuid("Invalid ticket id") }),
  body: z.object({
    status: status.optional(),
    priority: priority.optional(),
    category: category.optional(),
    assignee_user_id: z.number().int().positive().nullable().optional(),
  }),
});

export const addCommentSchema = z.object({
  params: z.object({ id: z.string().uuid("Invalid ticket id") }),
  body: z.object({ body: z.string().min(1, "Comment body is required").max(5000) }),
});
