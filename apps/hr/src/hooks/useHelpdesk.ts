"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  helpdeskService,
  type CreateTicketInput,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
  type TransitionInput,
} from "@/services/helpdesk.service";

const MY = "my-tickets";
const TRIAGE = "triage-tickets";
const ONE = "ticket";

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: [MY] });
  qc.invalidateQueries({ queryKey: [TRIAGE] });
  qc.invalidateQueries({ queryKey: [ONE] });
}

export function useMyTickets() {
  return useQuery({ queryKey: [MY], queryFn: () => helpdeskService.myTickets() });
}

export function useTriageTickets(
  filters: { status?: TicketStatus; category?: TicketCategory; priority?: TicketPriority } = {},
) {
  return useQuery({
    queryKey: [TRIAGE, filters],
    queryFn: () => helpdeskService.triageList(filters),
  });
}

export function useTicket(id: string | null) {
  return useQuery({
    queryKey: [ONE, id],
    queryFn: () => helpdeskService.get(id!),
    enabled: Boolean(id),
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTicketInput) => helpdeskService.create(payload),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useTransitionTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & TransitionInput) =>
      helpdeskService.transition(id, payload),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useReopenTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => helpdeskService.reopen(id),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => helpdeskService.comment(id, body),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: [ONE, vars.id] }),
  });
}
