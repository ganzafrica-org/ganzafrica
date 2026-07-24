import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { hr_helpdesk_tickets } from "@/db/schema";
import { AppError } from "@/middlewares";
import { sendNotification } from "@/modules/hr/notifications/notification.service";
import { requireEmployee } from "./employee-context";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface ListTicketsFilters {
  status?: TicketStatus;
  submittedBy?: string;
  assignedTo?: string;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  submittedById: string;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  status?: TicketStatus;
  assignedToId?: string | null;
}

export interface TicketRecord {
  id: string;
  title: string;
  description: string;
  submittedById: string | null;
  assignedToId: string | null;
  status: TicketStatus;
  answer: string | null;
  answeredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

function mapTicket(row: typeof hr_helpdesk_tickets.$inferSelect): TicketRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    submittedById: row.submitted_by_employee_id,
    assignedToId: row.assigned_to_employee_id,
    status: row.status,
    answer: row.answer,
    answeredAt: row.answered_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listTickets(filters: ListTicketsFilters = {}): Promise<TicketRecord[]> {
  const conditions = [];

  if (filters.status) conditions.push(eq(hr_helpdesk_tickets.status, filters.status));
  if (filters.submittedBy)
    conditions.push(eq(hr_helpdesk_tickets.submitted_by_employee_id, filters.submittedBy));
  if (filters.assignedTo)
    conditions.push(eq(hr_helpdesk_tickets.assigned_to_employee_id, filters.assignedTo));

  const whereClause = conditions.length ? and(...conditions) : undefined;
  const rows = await db.select().from(hr_helpdesk_tickets).where(whereClause);

  return rows.map(mapTicket);
}

export async function getTicketById(id: string): Promise<TicketRecord> {
  const rows = await db
    .select()
    .from(hr_helpdesk_tickets)
    .where(eq(hr_helpdesk_tickets.id, id))
    .limit(1);
  if (!rows.length) throw new AppError("Ticket not found", 404);
  return mapTicket(rows[0]);
}

export async function createTicket(input: CreateTicketInput): Promise<TicketRecord> {
  await requireEmployee(input.submittedById);

  const [inserted] = await db
    .insert(hr_helpdesk_tickets)
    .values({
      title: input.title,
      description: input.description,
      submitted_by_employee_id: input.submittedById,
      status: "OPEN",
    })
    .returning();

  if (!inserted) throw new AppError("Failed to create ticket", 400);

  try {
    await sendNotification({
      type: "TICKET_CREATED",
      triggeredBy: 0,
      relatedEntity: { ticketId: inserted.id },
      title: "New helpdesk ticket",
      message: `Ticket "${inserted.title}" was submitted.`,
      priority: "HIGH",
    });
  } catch {
    // notification failure must not break the main operation
  }

  return mapTicket(inserted);
}

export async function updateTicket(id: string, input: UpdateTicketInput): Promise<TicketRecord> {
  const rows = await db
    .select()
    .from(hr_helpdesk_tickets)
    .where(eq(hr_helpdesk_tickets.id, id))
    .limit(1);
  if (!rows.length) throw new AppError("Ticket not found", 404);
  const previous = rows[0];

  if (input.assignedToId) {
    await requireEmployee(input.assignedToId);
  }

  const patch: Partial<typeof hr_helpdesk_tickets.$inferInsert> = {
    updated_at: new Date(),
  };

  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.status !== undefined) patch.status = input.status;
  if (input.assignedToId !== undefined) patch.assigned_to_employee_id = input.assignedToId;

  const [updated] = await db
    .update(hr_helpdesk_tickets)
    .set(patch)
    .where(eq(hr_helpdesk_tickets.id, id))
    .returning();

  if (!updated) throw new AppError("Ticket not found", 404);

  try {
    if (input.status !== undefined && input.status !== previous.status) {
      await sendNotification({
        type: "TICKET_STATUS_CHANGED",
        triggeredBy: 0,
        relatedEntity: { ticketId: updated.id },
        title: "Ticket status updated",
        message: `Ticket "${updated.title}" is now ${updated.status}.`,
        priority: "NORMAL",
      });
    }
    if (
      input.assignedToId !== undefined &&
      input.assignedToId !== null &&
      input.assignedToId !== previous.assigned_to_employee_id
    ) {
      await sendNotification({
        type: "TICKET_ASSIGNED",
        triggeredBy: 0,
        relatedEntity: { ticketId: updated.id },
        title: "Ticket assigned",
        message: `Ticket "${updated.title}" has been assigned.`,
        priority: "NORMAL",
      });
    }
  } catch {
    // notification failure must not break the main operation
  }

  return mapTicket(updated);
}

export async function answerTicket(id: string, answer: string): Promise<TicketRecord> {
  const rows = await db
    .select()
    .from(hr_helpdesk_tickets)
    .where(eq(hr_helpdesk_tickets.id, id))
    .limit(1);
  if (!rows.length) throw new AppError("Ticket not found", 404);

  const now = new Date();
  const [updated] = await db
    .update(hr_helpdesk_tickets)
    .set({
      answer,
      answered_at: now,
      status: "RESOLVED",
      updated_at: now,
    })
    .where(eq(hr_helpdesk_tickets.id, id))
    .returning();

  if (!updated) throw new AppError("Ticket not found", 404);
  return mapTicket(updated);
}

export async function deleteTicket(id: string): Promise<void> {
  const deleted = await db
    .delete(hr_helpdesk_tickets)
    .where(eq(hr_helpdesk_tickets.id, id))
    .returning({ id: hr_helpdesk_tickets.id });

  if (!deleted.length) throw new AppError("Ticket not found", 404);
}
