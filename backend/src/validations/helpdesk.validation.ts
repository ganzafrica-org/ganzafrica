import { z } from "zod";

export const ticketIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid ticket id"),
  }),
});

export const listTicketsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 10)),
  }),
});

export const createTicketSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
});

export const assignTicketSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const answerTicketSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    answer: z.string().min(1),
  }),
});

export const updateTicketStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  }),
});

