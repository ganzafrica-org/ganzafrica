import { httpClient } from "@/services/http.service";
import type { FormDefinition } from "@/lib/recruitment/form-types";
import type { RuleDraft } from "@/components/recruitment/form-builder";

export type PipelineStage =
  | "submitted"
  | "screening"
  | "shortlisted"
  | "interview"
  | "evaluation"
  | "offer"
  | "hired"
  | "rejected"
  | "withdrawn";

export interface OpportunityStageCounts {
  opportunity_id: number;
  title: string;
  status: string;
  stages: Partial<Record<PipelineStage, number>>;
  total: number;
}

export interface ApplicationListItem {
  id: number;
  opportunity_id: number | null;
  first_name: string;
  last_name: string;
  email: string;
  pipeline_stage: PipelineStage;
  flagged: boolean;
  submission_date: string;
}

export interface StageEvent {
  id: number;
  from_stage: string | null;
  to_stage: string;
  actor_user_id: number | null;
  note: string | null;
  created_at: string;
}

export interface ApplicationScore {
  id: number;
  criterion_id: number;
  reviewer_user_id: number;
  score: number;
  comment: string | null;
}

export interface RecruitmentEmail {
  id: number;
  email_type: string;
  sent_at: string;
}

export interface ApplicationDetail {
  application: Record<string, unknown> & {
    id: number;
    opportunity_id: number | null;
    pipeline_stage: PipelineStage;
    flagged: boolean;
    flag_note: string | null;
    rejection_reason: string | null;
    form_version: number | null;
    custom_answers: Record<string, unknown> | null;
  };
  stage_events: StageEvent[];
  scores: ApplicationScore[];
  emails: RecruitmentEmail[];
}

export interface ScreeningRule {
  id: number;
  field_key: string;
  operator: string;
  value: unknown;
  action: "auto_reject" | "flag";
  email_template: string | null;
  rejection_reason: string | null;
  is_active: boolean;
  hit_count: number;
}

export interface Criterion {
  id: number;
  name: string;
  weight: string;
  max_score: number;
  sort_order: number;
}

export interface Funnel {
  views: number;
  form_starts: number;
  submissions: number;
  eligibility_blocks: {
    rule_id: number;
    field_key: string;
    reject_message: string;
    hits: number;
  }[];
  conversion: { view_to_start: number; start_to_submit: number };
}

export const recruitmentService = {
  async listOpportunities() {
    const res = await httpClient.get<{ opportunities: OpportunityStageCounts[] }>(
      "/hr/recruitment/opportunities",
    );
    return res.data.opportunities;
  },

  async listApplications(params: {
    opportunity_id?: number;
    stage?: string;
    flagged?: boolean;
    search?: string;
    page?: number;
  }) {
    const res = await httpClient.get<{
      data: ApplicationListItem[];
      page: number;
      pageSize: number;
      total: number;
    }>("/hr/recruitment/applications", { params });
    return res.data;
  },

  async getApplication(id: number) {
    const res = await httpClient.get<ApplicationDetail>(`/hr/recruitment/applications/${id}`);
    return res.data;
  },

  async transition(
    id: number,
    to_stage: string,
    opts: { note?: string; send_email?: boolean } = {},
  ) {
    const res = await httpClient.post(`/hr/recruitment/applications/${id}/transition`, {
      to_stage,
      ...opts,
    });
    return res.data;
  },

  async rescreen(id: number) {
    const res = await httpClient.post(`/hr/recruitment/applications/${id}/rescreen`);
    return res.data;
  },

  // Screening rules
  async listScreeningRules(opportunityId: number) {
    const res = await httpClient.get<{ rules: ScreeningRule[] }>(
      `/hr/recruitment/opportunities/${opportunityId}/screening-rules`,
    );
    return res.data.rules;
  },
  async createScreeningRule(opportunityId: number, rule: Partial<ScreeningRule>) {
    const res = await httpClient.post(
      `/hr/recruitment/opportunities/${opportunityId}/screening-rules`,
      rule,
    );
    return res.data;
  },

  // Criteria
  async listCriteria(opportunityId: number) {
    const res = await httpClient.get<{ criteria: Criterion[] }>(
      `/hr/recruitment/opportunities/${opportunityId}/criteria`,
    );
    return res.data.criteria;
  },

  // Scores
  async putScores(
    applicationId: number,
    scores: { criterion_id: number; score: number; comment?: string }[],
  ) {
    const res = await httpClient.put<{ weighted_total: number }>(
      `/hr/recruitment/applications/${applicationId}/scores`,
      { scores },
    );
    return res.data;
  },

  // REC-01 form + eligibility rules (reused by the posting editor)
  async getForm(opportunityId: number) {
    const res = await httpClient.get<{ draft: unknown; published: unknown }>(
      `/hr/opportunities/${opportunityId}/form`,
    );
    return res.data;
  },
  async saveForm(opportunityId: number, definition: FormDefinition) {
    const res = await httpClient.put(`/hr/opportunities/${opportunityId}/form`, { definition });
    return res.data;
  },
  async publishForm(opportunityId: number) {
    const res = await httpClient.put(`/hr/opportunities/${opportunityId}/form/publish`);
    return res.data;
  },
  async listEligibilityRules(opportunityId: number) {
    const res = await httpClient.get<{ rules: RuleDraft[] }>(
      `/hr/opportunities/${opportunityId}/rules`,
    );
    return res.data.rules;
  },

  async createOpportunity(payload: {
    title: string;
    description: string;
    type: "fellowship" | "employment";
    application_deadline: string;
    location_type?: string;
    location?: string;
    employment_details?: { employment_type: string; department?: string; position_level?: string };
    fellowship_details?: { program_name: string; cohort?: string };
  }) {
    const res = await httpClient.post<{ opportunity: { id: number } }>("/opportunities", payload);
    return res.data;
  },

  async publishOpportunity(id: number) {
    const res = await httpClient.post(`/opportunities/${id}/publish`);
    return res.data;
  },

  async getFunnel(opportunityId: number) {
    const res = await httpClient.get<Funnel>(
      `/hr/recruitment/opportunities/${opportunityId}/funnel`,
    );
    return res.data;
  },

  // REC-05 offers
  async getOfferForApplication(applicationId: number) {
    const res = await httpClient.get<{ offer: Offer | null }>(
      `/hr/recruitment/applications/${applicationId}/offer`,
    );
    return res.data.offer;
  },
  async createOffer(applicationId: number, payload: CreateOfferPayload) {
    const res = await httpClient.post<{ offer: Offer }>(
      `/hr/recruitment/applications/${applicationId}/offer`,
      payload,
    );
    return res.data.offer;
  },
  async updateOffer(offerId: number, payload: Partial<CreateOfferPayload>) {
    const res = await httpClient.patch<{ offer: Offer }>(`/hr/offers/${offerId}`, payload);
    return res.data.offer;
  },
  async setOfferLetter(offerId: number, letter_file_key: string) {
    const res = await httpClient.post<{ offer: Offer }>(`/hr/offers/${offerId}/letter`, {
      letter_file_key,
    });
    return res.data.offer;
  },
  async sendOffer(offerId: number) {
    const res = await httpClient.post<{ offer: Offer }>(`/hr/offers/${offerId}/send`);
    return res.data.offer;
  },
  async withdrawOffer(offerId: number) {
    const res = await httpClient.post<{ offer: Offer }>(`/hr/offers/${offerId}/withdraw`);
    return res.data.offer;
  },

  // REC-06 reviewers + notes + close-out
  async listReviewers(applicationId: number) {
    const res = await httpClient.get<{ reviewers: Reviewer[] }>(
      `/hr/recruitment/applications/${applicationId}/reviewers`,
    );
    return res.data.reviewers;
  },
  async assignReviewer(applicationId: number, reviewer_user_id: number, role?: string) {
    const res = await httpClient.post(`/hr/recruitment/applications/${applicationId}/reviewers`, {
      reviewer_user_id,
      role,
    });
    return res.data;
  },
  async removeReviewer(applicationId: number, reviewerUserId: number) {
    const res = await httpClient.delete(
      `/hr/recruitment/applications/${applicationId}/reviewers/${reviewerUserId}`,
    );
    return res.data;
  },
  async listNotes(applicationId: number) {
    const res = await httpClient.get<{ notes: InterviewNote[] }>(
      `/hr/recruitment/applications/${applicationId}/notes`,
    );
    return res.data.notes;
  },
  async addNote(applicationId: number, payload: { stage: string; note: string; rating?: number }) {
    const res = await httpClient.post(
      `/hr/recruitment/applications/${applicationId}/notes`,
      payload,
    );
    return res.data;
  },
  async closeOutPreview(opportunityId: number) {
    const res = await httpClient.get<CloseOutPreview>(
      `/hr/recruitment/opportunities/${opportunityId}/close-out`,
    );
    return res.data;
  },
  async closeOut(opportunityId: number, rejection_reason?: string) {
    const res = await httpClient.post<{ closed: number }>(
      `/hr/recruitment/opportunities/${opportunityId}/close-out`,
      { rejection_reason },
    );
    return res.data;
  },

  // REC-07 CV ranking
  async listRankingCriteria(opportunityId: number) {
    const res = await httpClient.get<{ criteria: RankingCriterion[] }>(
      `/hr/recruitment/opportunities/${opportunityId}/ranking-criteria`,
    );
    return res.data.criteria;
  },
  async createRankingCriterion(
    opportunityId: number,
    payload: { keyword: string; weight?: number; category?: string },
  ) {
    const res = await httpClient.post(
      `/hr/recruitment/opportunities/${opportunityId}/ranking-criteria`,
      payload,
    );
    return res.data;
  },
  async deleteRankingCriterion(opportunityId: number, criterionId: number) {
    const res = await httpClient.delete(
      `/hr/recruitment/opportunities/${opportunityId}/ranking-criteria/${criterionId}`,
    );
    return res.data;
  },
  async rescore(opportunityId: number) {
    const res = await httpClient.post<{ scored: number }>(
      `/hr/recruitment/opportunities/${opportunityId}/rescore`,
    );
    return res.data;
  },
  async listRanked(opportunityId: number) {
    const res = await httpClient.get<{ applications: RankedApplication[] }>(
      `/hr/recruitment/opportunities/${opportunityId}/ranked`,
    );
    return res.data.applications;
  },
};

export interface RankingCriterion {
  id: number;
  keyword: string;
  weight: string;
  category: string | null;
  is_active: boolean;
}

export interface RankedApplication {
  application_id: number;
  first_name: string;
  last_name: string;
  pipeline_stage: string;
  cv_score: string | null;
}

export interface Reviewer {
  id: number;
  reviewer_user_id: number;
  role: string | null;
  name: string;
  email: string;
}

export interface InterviewNote {
  id: number;
  author_user_id: number;
  author_name: string;
  stage: string;
  rating: number | null;
  note: string;
  created_at: string;
}

export interface CloseOutPreview {
  target_hires: number;
  accepted_offers: number;
  target_met: boolean;
  remaining: number;
}

export interface Offer {
  id: number;
  application_id: number;
  position_title: string;
  employment_type: string;
  department: string | null;
  start_date: string | null;
  gross_salary: string | null;
  currency: string;
  additional_terms: string | null;
  letter_file_key: string | null;
  status: "draft" | "sent" | "accepted" | "declined" | "expired" | "withdrawn";
  expires_at: string | null;
  sent_at: string | null;
  responded_at: string | null;
  decline_reason: string | null;
}

export interface CreateOfferPayload {
  position_title: string;
  employment_type: "fellow" | "analyst" | "staff" | "contractor" | "intern";
  department?: string | null;
  start_date?: string | null;
  gross_salary?: string | number | null;
  currency?: string;
  additional_terms?: string | null;
}
