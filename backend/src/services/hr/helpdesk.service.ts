/**
 * MOD-08 helpdesk. Employees raise tickets; triage staff (helpdesk:manage) assign, transition, and
 * resolve; both sides thread comments. Eligibility is a relationship — requester or triage — so the
 * service resolves it from the authenticated user rather than trusting the caller.
 */
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  employees,
  hr_assets,
  hr_helpdesk_comments,
  hr_helpdesk_tickets,
  roles,
  user_roles,
} from "@/db/schema";
import { AppError } from "@/middlewares";
import { sendNotification } from "@/modules/hr/notifications/notification.service";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REOPENED";
export type TicketCategory = "IT" | "HR" | "FACILITIES" | "OTHER";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const REOPEN_WINDOW_DAYS = 14;

/** Legal forward transitions. Reopen (RESOLVED→REOPENED) is a separate requester-only path. */
const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ["IN_PROGRESS", "RESOLVED", "CLOSED"],
  IN_PROGRESS: ["RESOLVED", "CLOSED", "OPEN"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  REOPENED: ["IN_PROGRESS", "RESOLVED", "CLOSED"],
  CLOSED: [],
};

export interface TicketRecord {
  id: string;
  title: string;
  description: string;
  submittedById: string | null;
  assignedToId: string | null;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  source: "manual" | "asset_issue";
  assetId: string | null;
  resolvedAt: Date | null;
  closedAt: Date | null;
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
    category: row.category,
    status: row.status,
    priority: row.priority,
    source: row.source,
    assetId: row.asset_id,
    resolvedAt: row.resolved_at,
    closedAt: row.closed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function employeeForUser(userId: number): Promise<string | null> {
  const [row] = await db
    .select({ id: employees.id })
    .from(employees)
    .where(eq(employees.user_id, userId))
    .limit(1);
  return row?.id ?? null;
}

async function userForEmployee(employeeId: string | null): Promise<number | null> {
  if (!employeeId) return null;
  const [row] = await db
    .select({ userId: employees.user_id })
    .from(employees)
    .where(eq(employees.id, employeeId))
    .limit(1);
  return row?.userId ?? null;
}

async function isTriage(userId: number): Promise<boolean> {
  const rows = await db
    .select({ name: roles.name })
    .from(user_roles)
    .innerJoin(roles, eq(user_roles.role_id, roles.id))
    .where(eq(user_roles.user_id, userId));
  return rows.some((r) => ["hr", "admin"].includes(r.name));
}

async function requireTicket(ticketId: string) {
  const [row] = await db
    .select()
    .from(hr_helpdesk_tickets)
    .where(eq(hr_helpdesk_tickets.id, ticketId))
    .limit(1);
  if (!row) throw new AppError("Ticket not found", 404, "TICKET_NOT_FOUND");
  return row;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
  asset_id?: string | null;
}

/** Raise a ticket. A linked asset flips the source to `asset_issue` (MOD-04's report-issue hook). */
export async function createTicket(actorUserId: number, input: CreateTicketInput) {
  const employeeId = await employeeForUser(actorUserId);
  if (!employeeId) {
    throw new AppError("No employee profile for this account", 404, "EMPLOYEE_PROFILE_MISSING");
  }

  if (input.asset_id) {
    const [asset] = await db
      .select({ id: hr_assets.id })
      .from(hr_assets)
      .where(eq(hr_assets.id, input.asset_id))
      .limit(1);
    if (!asset) throw new AppError("Linked asset not found", 404, "ASSET_NOT_FOUND");
  }

  const [inserted] = await db
    .insert(hr_helpdesk_tickets)
    .values({
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority ?? "MEDIUM",
      submitted_by_employee_id: employeeId,
      source: input.asset_id ? "asset_issue" : "manual",
      asset_id: input.asset_id ?? null,
      status: "OPEN",
    })
    .returning();

  await notify("TICKET_CREATED", inserted.id, {
    title: "New helpdesk ticket",
    message: `"${inserted.title}" (${inserted.category}) was submitted.`,
    priority: "HIGH",
  });

  return mapTicket(inserted);
}

export interface TransitionInput {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignee_user_id?: number | null;
  category?: TicketCategory;
}

/** Triage-only update: status transitions, priority, assignment, recategorization. */
export async function transitionTicket(
  actorUserId: number,
  ticketId: string,
  input: TransitionInput,
) {
  if (!(await isTriage(actorUserId))) {
    throw new AppError("Only triage staff can update this ticket", 403, "FORBIDDEN");
  }
  const ticket = await requireTicket(ticketId);

  if (input.status && input.status !== ticket.status) {
    const legal = ALLOWED_TRANSITIONS[ticket.status as TicketStatus];
    if (!legal.includes(input.status)) {
      throw new AppError(
        `Cannot move a ${ticket.status} ticket to ${input.status}`,
        400,
        "ILLEGAL_TRANSITION",
      );
    }
  }

  const patch: Partial<typeof hr_helpdesk_tickets.$inferInsert> = { updated_at: new Date() };
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.category !== undefined) patch.category = input.category;

  if (input.assignee_user_id !== undefined) {
    patch.assigned_to_employee_id =
      input.assignee_user_id === null ? null : await employeeForUser(input.assignee_user_id);
  }

  if (input.status !== undefined) {
    patch.status = input.status;
    if (input.status === "RESOLVED") patch.resolved_at = new Date();
    if (input.status === "CLOSED") patch.closed_at = new Date();
  }

  const [updated] = await db
    .update(hr_helpdesk_tickets)
    .set(patch)
    .where(eq(hr_helpdesk_tickets.id, ticketId))
    .returning();

  if (input.status && input.status !== ticket.status) {
    const requesterUserId = await userForEmployee(updated.submitted_by_employee_id);
    if (requesterUserId != null) {
      await notify("TICKET_STATUS_CHANGED", ticketId, {
        title: "Ticket status updated",
        message: `"${updated.title}" is now ${updated.status}.`,
        priority: "NORMAL",
        recipientUserIds: [requesterUserId],
      });
    }
  }

  if (
    input.assignee_user_id != null &&
    updated.assigned_to_employee_id !== ticket.assigned_to_employee_id
  ) {
    await notify("TICKET_ASSIGNED", ticketId, {
      title: "Ticket assigned to you",
      message: `You have been assigned "${updated.title}".`,
      priority: "NORMAL",
      recipientUserIds: [input.assignee_user_id],
    });
  }

  return mapTicket(updated);
}

/** Requester-only reopen, allowed for RESOLVED tickets within the reopen window. */
export async function reopenTicket(actorUserId: number, ticketId: string) {
  const ticket = await requireTicket(ticketId);
  const actorEmployeeId = await employeeForUser(actorUserId);

  if (ticket.submitted_by_employee_id !== actorEmployeeId) {
    throw new AppError("Only the requester can reopen a ticket", 403, "FORBIDDEN");
  }
  if (ticket.status !== "RESOLVED") {
    throw new AppError("Only a resolved ticket can be reopened", 400, "NOT_RESOLVED");
  }

  const resolvedAt = ticket.resolved_at ?? ticket.updated_at;
  const ageDays = (Date.now() - resolvedAt.getTime()) / 86400_000;
  if (ageDays > REOPEN_WINDOW_DAYS) {
    throw new AppError(
      `The ${REOPEN_WINDOW_DAYS}-day reopen window has closed`,
      422,
      "REOPEN_WINDOW_CLOSED",
    );
  }

  const [updated] = await db
    .update(hr_helpdesk_tickets)
    .set({ status: "REOPENED", resolved_at: null, updated_at: new Date() })
    .where(eq(hr_helpdesk_tickets.id, ticketId))
    .returning();

  const assigneeUserId = await userForEmployee(updated.assigned_to_employee_id);
  await notify("TICKET_STATUS_CHANGED", ticketId, {
    title: "Ticket reopened",
    message: `"${updated.title}" was reopened by the requester.`,
    priority: "HIGH",
    recipientUserIds: assigneeUserId != null ? [assigneeUserId] : [],
  });

  return mapTicket(updated);
}

export interface TicketView {
  ticket: typeof hr_helpdesk_tickets.$inferSelect;
  comments: (typeof hr_helpdesk_comments.$inferSelect)[];
  can_manage: boolean;
}

/** Requester, assignee, or triage may read a ticket + its thread. */
export async function getTicketForViewer(
  viewerUserId: number,
  ticketId: string,
): Promise<TicketView> {
  const ticket = await requireTicket(ticketId);
  const canManage = await isTriage(viewerUserId);
  const viewerEmployeeId = await employeeForUser(viewerUserId);

  const isParticipant =
    viewerEmployeeId != null &&
    (viewerEmployeeId === ticket.submitted_by_employee_id ||
      viewerEmployeeId === ticket.assigned_to_employee_id);

  if (!canManage && !isParticipant) {
    throw new AppError("You cannot view this ticket", 403, "FORBIDDEN");
  }

  const comments = await db
    .select()
    .from(hr_helpdesk_comments)
    .where(eq(hr_helpdesk_comments.ticket_id, ticketId))
    .orderBy(asc(hr_helpdesk_comments.created_at));

  return { ticket, comments, can_manage: canManage };
}

/** Comment on a ticket; the counterpart (requester ⇄ assignee/triage) is notified. */
export async function addComment(actorUserId: number, ticketId: string, body: string) {
  if (!body?.trim()) throw new AppError("Comment body is required", 422, "EMPTY_COMMENT");

  const ticket = await requireTicket(ticketId);
  const actorEmployeeId = await employeeForUser(actorUserId);
  const canManage = await isTriage(actorUserId);

  const isParticipant =
    actorEmployeeId != null &&
    (actorEmployeeId === ticket.submitted_by_employee_id ||
      actorEmployeeId === ticket.assigned_to_employee_id);

  if (!canManage && !isParticipant) {
    throw new AppError("You cannot comment on this ticket", 403, "FORBIDDEN");
  }

  const [comment] = await db
    .insert(hr_helpdesk_comments)
    .values({ ticket_id: ticketId, author_employee_id: actorEmployeeId, body: body.trim() })
    .returning();

  // Notify the other side: if the requester commented, ping the assignee; otherwise the requester.
  const actorIsRequester = actorEmployeeId === ticket.submitted_by_employee_id;
  const counterpartEmployeeId = actorIsRequester
    ? ticket.assigned_to_employee_id
    : ticket.submitted_by_employee_id;
  const counterpartUserId = await userForEmployee(counterpartEmployeeId);

  if (counterpartUserId != null && counterpartUserId !== actorUserId) {
    await notify("TICKET_COMMENT", ticketId, {
      title: "New comment on your ticket",
      message: `"${ticket.title}" has a new comment.`,
      priority: "NORMAL",
      recipientUserIds: [counterpartUserId],
    });
  }

  return comment;
}

export interface ListTicketsFilters {
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
  assignee_user_id?: number;
}

/** Triage list (helpdesk:manage). */
export async function listTickets(filters: ListTicketsFilters = {}) {
  const conditions = [];
  if (filters.status) conditions.push(eq(hr_helpdesk_tickets.status, filters.status));
  if (filters.category) conditions.push(eq(hr_helpdesk_tickets.category, filters.category));
  if (filters.priority) conditions.push(eq(hr_helpdesk_tickets.priority, filters.priority));
  if (filters.assignee_user_id != null) {
    const empId = await employeeForUser(filters.assignee_user_id);
    conditions.push(eq(hr_helpdesk_tickets.assigned_to_employee_id, empId ?? ""));
  }

  const rows = await db
    .select()
    .from(hr_helpdesk_tickets)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(hr_helpdesk_tickets.created_at));

  return rows.map(mapTicket);
}

/** The caller's own tickets (self-service list). */
export async function listMyTickets(actorUserId: number) {
  const employeeId = await employeeForUser(actorUserId);
  if (!employeeId) return [];

  const rows = await db
    .select()
    .from(hr_helpdesk_tickets)
    .where(eq(hr_helpdesk_tickets.submitted_by_employee_id, employeeId))
    .orderBy(desc(hr_helpdesk_tickets.created_at));

  return rows.map(mapTicket);
}

interface NotifyOpts {
  title: string;
  message: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
  recipientUserIds?: number[];
}

async function notify(
  type: "TICKET_CREATED" | "TICKET_STATUS_CHANGED" | "TICKET_ASSIGNED" | "TICKET_COMMENT",
  ticketId: string,
  opts: NotifyOpts,
) {
  try {
    await sendNotification({
      type,
      triggeredBy: 0,
      relatedEntity: { ticketId },
      recipientUserIds: opts.recipientUserIds,
      title: opts.title,
      message: opts.message,
      priority: opts.priority,
    });
  } catch {
    // A notification failure must never fail the ticket operation.
  }
}
