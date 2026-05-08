import { and, desc, eq, isNull, or } from "drizzle-orm";
import { db } from "@/db/client";
import { hr_helpdesk_tickets } from "@/db/schema";
import { AppError } from "@/middlewares";

export type HrRole = "EMPLOYEE" | "IT" | "HR";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface RequestUser {
  id: string;
  role?: string;
}

export interface ListQuery {
  page: number;
  limit: number;
}

export interface CreateTicketInput {
  title: string;
  description: string;
}

function requireNotHr(role?: string): void {
  if (role === "HR") throw new AppError("Forbidden", 403);
}

function requireIt(role?: string): void {
  if (role !== "IT") throw new AppError("Forbidden", 403);
}

export async function listTickets(requester: RequestUser, query: ListQuery) {
  requireNotHr(requester.role);

  const role = requester.role as HrRole | undefined;
  const whereClause =
    role === "EMPLOYEE"
      ? eq(hr_helpdesk_tickets.submitted_by_id, requester.id)
      : or(
          eq(hr_helpdesk_tickets.assigned_to_id, requester.id),
          isNull(hr_helpdesk_tickets.assigned_to_id),
        );

  const all = await db.select().from(hr_helpdesk_tickets).where(whereClause);
  const total = all.length;

  const rows = await db
    .select()
    .from(hr_helpdesk_tickets)
    .where(whereClause)
    .orderBy(desc(hr_helpdesk_tickets.created_at))
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);

  return { data: rows, total };
}

export async function getTicket(requester: RequestUser, id: string) {
  requireNotHr(requester.role);

  const rows = await db.select().from(hr_helpdesk_tickets).where(eq(hr_helpdesk_tickets.id, id)).limit(1);
  if (!rows.length) throw new AppError("Ticket not found", 404);
  const t = rows[0];

  if (requester.role === "EMPLOYEE" && t.submitted_by_id !== requester.id) throw new AppError("Forbidden", 403);
  // IT can view any

  return t;
}

export async function createTicket(requester: RequestUser, input: CreateTicketInput) {
  if (requester.role !== "EMPLOYEE") throw new AppError("Forbidden", 403);

  const inserted = await db
    .insert(hr_helpdesk_tickets)
    .values({
      title: input.title,
      description: input.description,
      submitted_by_id: requester.id,
      status: "OPEN",
    })
    .returning();

  return inserted[0];
}

export async function assignToSelf(requester: RequestUser, id: string) {
  requireIt(requester.role);

  const rows = await db.select().from(hr_helpdesk_tickets).where(eq(hr_helpdesk_tickets.id, id)).limit(1);
  if (!rows.length) throw new AppError("Ticket not found", 404);

  const updated = await db
    .update(hr_helpdesk_tickets)
    .set({ assigned_to_id: requester.id, updated_at: new Date() })
    .where(eq(hr_helpdesk_tickets.id, id))
    .returning();

  return updated[0];
}

export async function answerTicket(requester: RequestUser, id: string, answer: string) {
  requireIt(requester.role);

  const rows = await db.select().from(hr_helpdesk_tickets).where(eq(hr_helpdesk_tickets.id, id)).limit(1);
  if (!rows.length) throw new AppError("Ticket not found", 404);

  const now = new Date();
  const updated = await db
    .update(hr_helpdesk_tickets)
    .set({
      answer,
      answered_at: now,
      status: "RESOLVED",
      assigned_to_id: rows[0].assigned_to_id ?? requester.id,
      updated_at: now,
    })
    .where(eq(hr_helpdesk_tickets.id, id))
    .returning();

  return updated[0];
}

function isValidTransition(from: TicketStatus, to: TicketStatus): boolean {
  if (from === to) return true;
  if (from === "OPEN" && to === "IN_PROGRESS") return true;
  if (from === "IN_PROGRESS" && (to === "RESOLVED" || to === "CLOSED")) return true;
  if (from === "RESOLVED" && to === "CLOSED") return true;
  return false;
}

export async function updateStatus(requester: RequestUser, id: string, status: TicketStatus) {
  requireIt(requester.role);

  const rows = await db.select().from(hr_helpdesk_tickets).where(eq(hr_helpdesk_tickets.id, id)).limit(1);
  if (!rows.length) throw new AppError("Ticket not found", 404);
  const current = rows[0];

  if (!isValidTransition(current.status as TicketStatus, status)) {
    throw new AppError("Invalid status transition", 400);
  }

  const updated = await db
    .update(hr_helpdesk_tickets)
    .set({ status, updated_at: new Date() })
    .where(eq(hr_helpdesk_tickets.id, id))
    .returning();

  return updated[0];
}

export async function deleteTicket(requester: RequestUser, id: string): Promise<void> {
  if (requester.role !== "EMPLOYEE") throw new AppError("Forbidden", 403);

  const rows = await db.select().from(hr_helpdesk_tickets).where(eq(hr_helpdesk_tickets.id, id)).limit(1);
  if (!rows.length) throw new AppError("Ticket not found", 404);
  const t = rows[0];

  if (t.submitted_by_id !== requester.id) throw new AppError("Forbidden", 403);
  if (t.status !== "OPEN") throw new AppError("Only OPEN tickets can be deleted", 400);

  await db.delete(hr_helpdesk_tickets).where(and(eq(hr_helpdesk_tickets.id, id), eq(hr_helpdesk_tickets.submitted_by_id, requester.id)));
}

