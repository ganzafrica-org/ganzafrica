import { httpClient } from "@/services/http.service";
import type { HelpdeskAnswerPayload, HelpdeskTicketPayload, PaginatedResponse } from "@/types/api";

export const helpdeskService = {
  async createTicket(payload: HelpdeskTicketPayload) {
    const response = await httpClient.post("/helpdesk", payload);
    return response.data;
  },
  async getTickets(params?: {
    search?: string;
    status?: string;
    category?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await httpClient.get<PaginatedResponse<HelpdeskTicketPayload>>("/helpdesk", {
      params,
    });

    return response.data;
  },
  async getTicketById(ticketId: string) {
    const response = await httpClient.get<HelpdeskTicketPayload>(`/helpdesk/${ticketId}`);
    return response.data;
  },
  async answerTicket(ticketId: string, payload: HelpdeskAnswerPayload) {
    const response = await httpClient.patch(`/helpdesk/${ticketId}/answer`, payload);
    return response.data;
  },
  async deleteTicket(ticketId: string) {
    await httpClient.delete(`/helpdesk/${ticketId}`);
  },
  async updateTicket(ticketId: string, payload: HelpdeskTicketPayload) {
    const response = await httpClient.patch<HelpdeskTicketPayload>(
      `/helpdesk/${ticketId}`,
      payload,
    );
    return response.data;
  },
};
