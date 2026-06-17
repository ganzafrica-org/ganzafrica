import { z } from "zod";

export const ticketIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid ticket id"),
  }),
});

export const listTicketsSchema = z.object({
  query: z.object({
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
    submittedBy: z.string().uuid("Invalid submittedBy id").optional(),
    assignedTo: z.string().uuid("Invalid assignedTo id").optional(),
  }),
});

export const createTicketSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    submittedById: z.string().uuid("Invalid submittedById"),
  }),
});

export const updateTicketSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid ticket id"),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
    assignedToId: z.string().uuid("Invalid assignedToId").optional().nullable(),
  }),
});

export const answerTicketSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid ticket id"),
  }),
  body: z.object({
    answer: z.string().min(1, "Answer is required"),
  }),
});
