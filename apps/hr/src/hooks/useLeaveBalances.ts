"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  leaveBalancesService,
  type EmploymentType,
  type LeaveDraft,
  type LeaveTypeName,
} from "@/services/leave-balances.service";
import { toast } from "@/lib/toast";

const MY_LEAVE = "my-leave";
const APPROVALS = "leave-approvals";
const CALENDAR = "leave-calendar";
const POLICIES = "leave-policies";
const HOLIDAYS = "org-holidays";

export function useMyLeave(year?: number) {
  return useQuery({
    queryKey: [MY_LEAVE, year],
    queryFn: () => leaveBalancesService.getMine(year),
  });
}

export function useRequestLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LeaveDraft) => leaveBalancesService.request(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [MY_LEAVE] });
      qc.invalidateQueries({ queryKey: [APPROVALS] });
      toast.success("Leave request submitted");
    },
  });
}

/** Dry run for the request dialog — never writes, so it does not invalidate anything. */
export function useValidateLeave() {
  return useMutation({
    mutationFn: (payload: LeaveDraft) => leaveBalancesService.validate(payload),
    // Fires on every date/type change while the user is still picking a range —
    // an error toast per keystroke would be noise, not feedback.
    meta: { silentError: true },
  });
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: [APPROVALS],
    queryFn: () => leaveBalancesService.pendingApprovals(),
  });
}

export function useDecideLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      decision,
      note,
    }: {
      id: string;
      decision: "approve" | "reject";
      note?: string;
    }) =>
      decision === "approve"
        ? leaveBalancesService.approve(id, note)
        : leaveBalancesService.reject(id, note ?? ""),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [APPROVALS] });
      qc.invalidateQueries({ queryKey: [MY_LEAVE] });
      qc.invalidateQueries({ queryKey: [CALENDAR] });
      toast.success(variables.decision === "approve" ? "Leave approved" : "Leave rejected");
    },
  });
}

export function useCancelLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveBalancesService.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [MY_LEAVE] });
      qc.invalidateQueries({ queryKey: [APPROVALS] });
      qc.invalidateQueries({ queryKey: [CALENDAR] });
    },
  });
}

export function useLeaveCalendar(from: string, to: string) {
  return useQuery({
    queryKey: [CALENDAR, from, to],
    queryFn: () => leaveBalancesService.calendar(from, to),
    enabled: Boolean(from && to),
  });
}

export function useLeavePolicies() {
  return useQuery({ queryKey: [POLICIES], queryFn: () => leaveBalancesService.listPolicies() });
}

export function useSavePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      employment_type: EmploymentType;
      type: LeaveTypeName;
      annual_days: number;
      max_carry_over?: number;
    }) => leaveBalancesService.savePolicy(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [POLICIES] });
      toast.success("Leave policy saved");
    },
  });
}

export function useDeletePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leaveBalancesService.deletePolicy(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [POLICIES] });
      toast.success("Leave policy deleted");
    },
  });
}

export function useHolidays(year?: number) {
  return useQuery({
    queryKey: [HOLIDAYS, year],
    queryFn: () => leaveBalancesService.listHolidays(year),
  });
}

export function useCreateHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { date: string; name: string }) =>
      leaveBalancesService.createHoliday(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [HOLIDAYS] });
      toast.success("Holiday added");
    },
  });
}

export function useDeleteHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leaveBalancesService.deleteHoliday(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [HOLIDAYS] });
      toast.success("Holiday removed");
    },
  });
}
