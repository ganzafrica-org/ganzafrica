import { httpClient } from "@/services/http.service";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REOPENED";
export type TicketCategory = "IT" | "HR" | "FACILITIES" | "OTHER";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Ticket {
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
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_employee_id: string | null;
  body: string;
  created_at: string;
}

export interface TicketDetail {
  ticket: Ticket & { asset_id: string | null };
  comments: TicketComment[];
  can_manage: boolean;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
  asset_id?: string | null;
}

export interface TransitionInput {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignee_user_id?: number | null;
}

export const helpdeskService = {
  async myTickets(): Promise<Ticket[]> {
    const { data } = await httpClient.get<{ tickets: Ticket[] }>("/hr/me/helpdesk");
    return data.tickets;
  },

  async triageList(
    params: {
      status?: TicketStatus;
      category?: TicketCategory;
      priority?: TicketPriority;
      assignee?: number;
    } = {},
  ): Promise<Ticket[]> {
    const { data } = await httpClient.get<{ tickets: Ticket[] }>("/hr/helpdesk", { params });
    return data.tickets;
  },

  async get(id: string): Promise<TicketDetail> {
    const { data } = await httpClient.get<TicketDetail>(`/hr/helpdesk/${id}`);
    return data;
  },

  async create(payload: CreateTicketInput): Promise<Ticket> {
    const { data } = await httpClient.post<{ ticket: Ticket }>("/hr/helpdesk", payload);
    return data.ticket;
  },

  async transition(id: string, payload: TransitionInput): Promise<Ticket> {
    const { data } = await httpClient.patch<{ ticket: Ticket }>(`/hr/helpdesk/${id}`, payload);
    return data.ticket;
  },

  async reopen(id: string): Promise<Ticket> {
    const { data } = await httpClient.post<{ ticket: Ticket }>(`/hr/helpdesk/${id}/reopen`, {});
    return data.ticket;
  },

  async comment(id: string, body: string): Promise<TicketComment> {
    const { data } = await httpClient.post<{ comment: TicketComment }>(
      `/hr/helpdesk/${id}/comments`,
      { body },
    );
    return data.comment;
  },
};
