"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { helpdeskService } from "@/services/helpdesk.service";
import type { HelpdeskAnswerPayload, HelpdeskTicketPayload } from "@/types/api";

export function useCreateHelpdeskTicket() {
  return useMutation({
    mutationFn: (payload: HelpdeskTicketPayload) => helpdeskService.createTicket(payload),
  });
}

export function useAnswerHelpdeskTicket() {
  return useMutation({
    mutationFn: ({ ticketId, payload }: { ticketId: string; payload: HelpdeskAnswerPayload }) =>
      helpdeskService.answerTicket(ticketId, payload),
  });
}

export function useGetHelpdeskTickets() {
  return useQuery({
    queryKey: ["helpdesk-tickets"],
    queryFn: () => helpdeskService.getTickets(),
  });
}

export function useGetHelpdeskTicketById(ticketId: string) {
  return useQuery({
    queryKey: ["helpdesk-ticket", ticketId],
    queryFn: () => helpdeskService.getTicketById(ticketId),
  });
}

export function useDeleteHelpdeskTicket() {
  return useMutation({
    mutationFn: (ticketId: string) => helpdeskService.deleteTicket(ticketId),
  });
}

export function useUpdateHelpdeskTicket() {
  return useMutation({
    mutationFn: ({ ticketId, payload }: { ticketId: string; payload: HelpdeskTicketPayload }) =>
      helpdeskService.updateTicket(ticketId, payload),
  });
}

export function useGetHelpdeskTicketStats() {
  return useQuery({
    queryKey: ["helpdesk-tickets-stats"],
    queryFn: () => helpdeskService.getTickets(),
  });
}
