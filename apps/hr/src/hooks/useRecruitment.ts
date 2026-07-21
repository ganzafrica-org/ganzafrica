"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recruitmentService } from "@/services/recruitment.service";

const keys = {
  opportunities: ["recruitment", "opportunities"] as const,
  applications: (params: Record<string, unknown>) =>
    ["recruitment", "applications", params] as const,
  application: (id: number) => ["recruitment", "application", id] as const,
  criteria: (id: number) => ["recruitment", "criteria", id] as const,
  funnel: (id: number) => ["recruitment", "funnel", id] as const,
};

export function useFunnel(opportunityId: number | null) {
  return useQuery({
    queryKey: keys.funnel(opportunityId ?? -1),
    queryFn: () => recruitmentService.getFunnel(opportunityId as number),
    enabled: opportunityId != null,
  });
}

export function useRankingCriteria(opportunityId: number | null) {
  return useQuery({
    queryKey: ["recruitment", "ranking-criteria", opportunityId ?? -1],
    queryFn: () => recruitmentService.listRankingCriteria(opportunityId as number),
    enabled: opportunityId != null,
  });
}

export function useRankingMutations(opportunityId: number) {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["recruitment", "ranking-criteria", opportunityId] });
  return {
    create: useMutation({
      mutationFn: (payload: { keyword: string; weight?: number; category?: string }) =>
        recruitmentService.createRankingCriterion(opportunityId, payload),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (criterionId: number) =>
        recruitmentService.deleteRankingCriterion(opportunityId, criterionId),
      onSuccess: invalidate,
    }),
    rescore: useMutation({
      mutationFn: () => recruitmentService.rescore(opportunityId),
      onSuccess: () => qc.invalidateQueries({ queryKey: ["recruitment", "applications"] }),
    }),
  };
}

export function useReviewers(applicationId: number | null) {
  return useQuery({
    queryKey: ["recruitment", "reviewers", applicationId ?? -1],
    queryFn: () => recruitmentService.listReviewers(applicationId as number),
    enabled: applicationId != null,
  });
}

export function useNotes(applicationId: number | null) {
  return useQuery({
    queryKey: ["recruitment", "notes", applicationId ?? -1],
    queryFn: () => recruitmentService.listNotes(applicationId as number),
    enabled: applicationId != null,
  });
}

export function useReviewMutations(applicationId: number) {
  const qc = useQueryClient();
  return {
    assignReviewer: useMutation({
      mutationFn: (args: { reviewer_user_id: number; role?: string }) =>
        recruitmentService.assignReviewer(applicationId, args.reviewer_user_id, args.role),
      onSuccess: () =>
        qc.invalidateQueries({ queryKey: ["recruitment", "reviewers", applicationId] }),
    }),
    removeReviewer: useMutation({
      mutationFn: (reviewerUserId: number) =>
        recruitmentService.removeReviewer(applicationId, reviewerUserId),
      onSuccess: () =>
        qc.invalidateQueries({ queryKey: ["recruitment", "reviewers", applicationId] }),
    }),
    addNote: useMutation({
      mutationFn: (payload: { stage: string; note: string; rating?: number }) =>
        recruitmentService.addNote(applicationId, payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: ["recruitment", "notes", applicationId] }),
    }),
  };
}

export function useApplicationOffer(applicationId: number | null) {
  return useQuery({
    queryKey: ["recruitment", "offer", applicationId ?? -1],
    queryFn: () => recruitmentService.getOfferForApplication(applicationId as number),
    enabled: applicationId != null,
  });
}

export function useOfferMutations(applicationId: number) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["recruitment", "offer", applicationId] });
    qc.invalidateQueries({ queryKey: keys.application(applicationId) });
    qc.invalidateQueries({ queryKey: ["recruitment", "applications"] });
  };
  return {
    create: useMutation({
      mutationFn: (payload: Parameters<typeof recruitmentService.createOffer>[1]) =>
        recruitmentService.createOffer(applicationId, payload),
      onSuccess: invalidate,
    }),
    setLetter: useMutation({
      mutationFn: (args: { offerId: number; key: string }) =>
        recruitmentService.setOfferLetter(args.offerId, args.key),
      onSuccess: invalidate,
    }),
    send: useMutation({
      mutationFn: (offerId: number) => recruitmentService.sendOffer(offerId),
      onSuccess: invalidate,
    }),
    withdraw: useMutation({
      mutationFn: (offerId: number) => recruitmentService.withdrawOffer(offerId),
      onSuccess: invalidate,
    }),
  };
}

export function useRecruitmentOpportunities() {
  return useQuery({
    queryKey: keys.opportunities,
    queryFn: () => recruitmentService.listOpportunities(),
  });
}

export function useRecruitmentApplications(params: {
  opportunity_id?: number;
  stage?: string;
  flagged?: boolean;
  search?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: keys.applications(params),
    queryFn: () => recruitmentService.listApplications(params),
  });
}

export function useApplicationDetail(id: number | null) {
  return useQuery({
    queryKey: keys.application(id ?? -1),
    queryFn: () => recruitmentService.getApplication(id as number),
    enabled: id != null,
  });
}

export function useCriteria(opportunityId: number | null) {
  return useQuery({
    queryKey: keys.criteria(opportunityId ?? -1),
    queryFn: () => recruitmentService.listCriteria(opportunityId as number),
    enabled: opportunityId != null,
  });
}

export function useTransition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: number; to_stage: string; note?: string; send_email?: boolean }) =>
      recruitmentService.transition(args.id, args.to_stage, {
        note: args.note,
        send_email: args.send_email,
      }),
    onSuccess: (_data, args) => {
      qc.invalidateQueries({ queryKey: ["recruitment", "applications"] });
      qc.invalidateQueries({ queryKey: keys.opportunities });
      qc.invalidateQueries({ queryKey: keys.application(args.id) });
    },
  });
}

export function usePutScores() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      applicationId: number;
      scores: { criterion_id: number; score: number; comment?: string }[];
    }) => recruitmentService.putScores(args.applicationId, args.scores),
    onSuccess: (_data, args) => {
      qc.invalidateQueries({ queryKey: keys.application(args.applicationId) });
    },
  });
}
