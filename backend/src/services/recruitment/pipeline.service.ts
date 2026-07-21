/**
 * Recruitment pipeline (REC-02): staged transitions with an audit trail, post-submission
 * screening, idempotent applicant emails, and weighted evaluation scoring — all additive on the
 * existing applications table.
 */
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { applications, opportunities } from "../../db/schema/opportunities";
import {
  application_scores,
  application_stage_events,
  evaluation_criteria,
  recruitment_emails,
  screening_rules,
  PIPELINE_STAGES,
  type PipelineStage,
} from "../../db/schema/recruitment/pipeline";
import { AppError } from "../../middlewares";
import { Logger } from "../../config";
import { evaluate } from "./eligibility.service";
import type { EligibilityRuleInput } from "../../types/recruitment";
import { renderApplicantEmail, type ApplicantEmailType } from "./email-templates";
import { sendEmail } from "../email.service";

const logger = new Logger("PipelineService");

// Legal moves. Terminal stages (rejected/withdrawn/hired) go nowhere. withdrawn is reachable from
// any non-terminal stage. offer/hired transitions are executed by REC-05 but validated here.
export const ALLOWED_TRANSITIONS: Record<PipelineStage, PipelineStage[]> = {
  submitted: ["screening", "rejected", "withdrawn"],
  screening: ["shortlisted", "rejected", "withdrawn"],
  shortlisted: ["interview", "rejected", "withdrawn"],
  interview: ["evaluation", "rejected", "withdrawn"],
  evaluation: ["offer", "rejected", "withdrawn"],
  offer: ["hired", "rejected", "withdrawn"],
  hired: [],
  rejected: [],
  withdrawn: [],
};

// pipeline_stage → legacy applicationStatusEnum, kept coherent so the portal's existing views
// stay correct. Encoded as data + covered by a test (spec §6.7).
export const LEGACY_STATUS_MAP: Record<PipelineStage, string> = {
  submitted: "submitted",
  screening: "under_review",
  shortlisted: "shortlisted",
  interview: "interviewed",
  evaluation: "under_review",
  offer: "shortlisted",
  hired: "accepted",
  rejected: "rejected",
  withdrawn: "withdrawn",
};

// Which stages trigger an applicant email (when requested).
const STAGE_EMAIL: Partial<Record<PipelineStage, ApplicantEmailType>> = {
  submitted: "received",
  shortlisted: "shortlisted",
  interview: "interview",
  rejected: "rejected",
};

export function isValidStage(stage: string): stage is PipelineStage {
  return (PIPELINE_STAGES as readonly string[]).includes(stage);
}

export class IllegalTransitionError extends Error {
  constructor(
    public readonly from: string,
    public readonly to: string,
    public readonly allowed: PipelineStage[],
  ) {
    super(`Illegal transition ${from} → ${to}`);
    this.name = "IllegalTransitionError";
  }
}

type TransitionOpts = {
  note?: string;
  sendEmailToApplicant?: boolean;
  rejectionReason?: string | null;
};

/**
 * Move an application to `toStage`. Validates the matrix, then atomically updates the application
 * (optimistic on the current stage) and writes a stage event, syncing legacy status. The applicant
 * email is sent AFTER commit (non-blocking) so a mail failure never rolls back the move.
 */
export async function transition(
  applicationId: number,
  toStage: string,
  actorUserId: number | null,
  opts: TransitionOpts = {},
) {
  if (!isValidStage(toStage)) {
    throw new AppError(`Unknown stage: ${toStage}`, 400);
  }

  const [app] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);
  if (!app) throw new AppError("Application not found", 404);

  const fromStage = app.pipeline_stage as PipelineStage;
  const allowed = ALLOWED_TRANSITIONS[fromStage] ?? [];
  if (!allowed.includes(toStage)) {
    throw new IllegalTransitionError(fromStage, toStage, allowed);
  }

  // Optimistic concurrency: only move if still in the observed stage. 0 rows → someone raced us.
  const updated = await db
    .update(applications)
    .set({
      pipeline_stage: toStage,
      status: LEGACY_STATUS_MAP[toStage] as (typeof applications.status.enumValues)[number],
      rejection_reason: opts.rejectionReason ?? app.rejection_reason,
      updated_at: new Date(),
    })
    .where(and(eq(applications.id, applicationId), eq(applications.pipeline_stage, fromStage)))
    .returning();

  if (updated.length === 0) {
    // Re-read for the freshest allowed set.
    const [fresh] = await db
      .select({ stage: applications.pipeline_stage })
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1);
    const freshStage = (fresh?.stage ?? fromStage) as PipelineStage;
    throw new IllegalTransitionError(freshStage, toStage, ALLOWED_TRANSITIONS[freshStage] ?? []);
  }

  await db.insert(application_stage_events).values({
    application_id: applicationId,
    from_stage: fromStage,
    to_stage: toStage,
    actor_user_id: actorUserId,
    note: opts.note,
  });

  // Post-commit email — failure is logged, never surfaced as a transition failure.
  if (opts.sendEmailToApplicant && STAGE_EMAIL[toStage]) {
    try {
      await sendApplicantEmail(applicationId, STAGE_EMAIL[toStage]!);
    } catch (err) {
      logger.error(`Stage email failed for application ${applicationId} (${toStage})`, err);
    }
  }

  return updated[0];
}

/**
 * Post-insert screening (REC-02). Evaluates active screening rules with the REC-01 engine; a `flag`
 * sets flagged+flag_note, an `auto_reject` transitions to rejected (actor NULL) with the rule's
 * rejection_reason and optional email. WRAPPED so a screening error never fails the submission.
 */
export async function runScreening(applicationId: number): Promise<void> {
  try {
    const [app] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1);
    if (!app || !app.opportunity_id) return;
    // Only screen freshly-submitted applications.
    if (app.pipeline_stage !== "submitted") return;

    const rules = await db
      .select()
      .from(screening_rules)
      .where(
        and(
          eq(screening_rules.opportunity_id, app.opportunity_id),
          eq(screening_rules.is_active, true),
        ),
      );
    if (rules.length === 0) return;

    const answers: Record<string, unknown> = {
      ...((app.custom_answers as Record<string, unknown>) || {}),
      date_of_birth: app.date_of_birth,
      country_of_residence: app.country_of_residence,
      country_of_work: app.country_of_work,
      has_work_permit: app.has_work_permit,
    };

    const engineRules: EligibilityRuleInput[] = rules.map((r) => ({
      id: r.id,
      field_key: r.field_key,
      operator: r.operator,
      value: r.value,
      reject_message: "",
    }));
    const result = evaluate(engineRules, answers);
    if (result.eligible) return;

    const matchedIds = new Set(result.failedRuleIds);
    const matched = rules.filter((r) => matchedIds.has(r.id));

    // Record hits for every matched rule.
    await db
      .update(screening_rules)
      .set({ hit_count: sql`${screening_rules.hit_count} + 1` })
      .where(inArray(screening_rules.id, [...matchedIds]));

    const autoReject = matched.find((r) => r.action === "auto_reject");
    if (autoReject) {
      await transition(applicationId, "rejected", null, {
        note: "Auto-rejected by screening rule",
        rejectionReason: autoReject.rejection_reason,
        sendEmailToApplicant: Boolean(autoReject.email_template),
      });
      return;
    }

    // No auto-reject — apply flags.
    const flagNotes = matched
      .filter((r) => r.action === "flag")
      .map((r) => r.rejection_reason || `Flagged by rule ${r.id}`);
    if (flagNotes.length > 0) {
      await db
        .update(applications)
        .set({ flagged: true, flag_note: flagNotes.join("; "), updated_at: new Date() })
        .where(eq(applications.id, applicationId));
    }
  } catch (err) {
    logger.error(`Screening failed for application ${applicationId} (non-fatal)`, err);
  }
}

/**
 * Send an applicant email exactly once per (application, type). Inserts the idempotency row first;
 * a unique violation means it was already sent, so we skip. Only then does Resend fire.
 */
export async function sendApplicantEmail(
  applicationId: number,
  type: ApplicantEmailType,
): Promise<{ sent: boolean }> {
  try {
    await db.insert(recruitment_emails).values({ application_id: applicationId, email_type: type });
  } catch (err: unknown) {
    if (isUniqueViolation(err)) return { sent: false };
    throw err;
  }

  const [app] = await db
    .select({
      email: applications.email,
      first_name: applications.first_name,
      opportunity_id: applications.opportunity_id,
    })
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);
  if (!app) return { sent: false };

  let opportunityTitle = "your application";
  if (app.opportunity_id) {
    const [opp] = await db
      .select({ title: opportunities.title })
      .from(opportunities)
      .where(eq(opportunities.id, app.opportunity_id))
      .limit(1);
    if (opp) opportunityTitle = opp.title;
  }

  const [{ rejection_reason }] = await db
    .select({ rejection_reason: applications.rejection_reason })
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);

  const { subject, html } = renderApplicantEmail(type, {
    firstName: app.first_name,
    opportunityTitle,
    rejectionReason: rejection_reason,
  });
  await sendEmail(app.email, subject, html);
  return { sent: true };
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23505";
}

export type ScoreInput = { criterion_id: number; score: number; comment?: string };

/**
 * Upsert a reviewer's own criterion scores and return the weighted total. Each score is validated
 * against its criterion's max_score. Weighted total = Σ(score/max * weight) / Σweight.
 */
export async function upsertScores(
  applicationId: number,
  reviewerUserId: number,
  scores: ScoreInput[],
) {
  const [app] = await db
    .select({ opportunity_id: applications.opportunity_id })
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);
  if (!app) throw new AppError("Application not found", 404);

  const criteria = await db
    .select()
    .from(evaluation_criteria)
    .where(eq(evaluation_criteria.opportunity_id, app.opportunity_id ?? -1));
  const byId = new Map(criteria.map((c) => [c.id, c]));

  for (const s of scores) {
    const criterion = byId.get(s.criterion_id);
    if (!criterion) throw new AppError(`Unknown criterion ${s.criterion_id}`, 400);
    if (s.score < 0 || s.score > criterion.max_score) {
      throw new AppError(
        `Score for "${criterion.name}" must be between 0 and ${criterion.max_score}`,
        422,
      );
    }
  }

  for (const s of scores) {
    await db
      .insert(application_scores)
      .values({
        application_id: applicationId,
        criterion_id: s.criterion_id,
        reviewer_user_id: reviewerUserId,
        score: s.score,
        comment: s.comment,
      })
      .onConflictDoUpdate({
        target: [
          application_scores.application_id,
          application_scores.criterion_id,
          application_scores.reviewer_user_id,
        ],
        set: { score: s.score, comment: s.comment, updated_at: new Date() },
      });
  }

  return computeWeightedTotal(applicationId, reviewerUserId);
}

/** Weighted total for one reviewer over the opportunity's criteria. */
export async function computeWeightedTotal(
  applicationId: number,
  reviewerUserId: number,
): Promise<number> {
  const [app] = await db
    .select({ opportunity_id: applications.opportunity_id })
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);
  if (!app?.opportunity_id) return 0;

  const criteria = await db
    .select()
    .from(evaluation_criteria)
    .where(eq(evaluation_criteria.opportunity_id, app.opportunity_id));
  const scores = await db
    .select()
    .from(application_scores)
    .where(
      and(
        eq(application_scores.application_id, applicationId),
        eq(application_scores.reviewer_user_id, reviewerUserId),
      ),
    );
  const scoreByCriterion = new Map(scores.map((s) => [s.criterion_id, s.score]));

  let weightedSum = 0;
  let weightTotal = 0;
  for (const c of criteria) {
    const raw = scoreByCriterion.get(c.id);
    if (raw == null) continue;
    const weight = Number(c.weight);
    weightedSum += (raw / c.max_score) * weight;
    weightTotal += weight;
  }
  if (weightTotal === 0) return 0;
  return Math.round((weightedSum / weightTotal) * 10000) / 10000;
}

// --- Queries (HR list/detail) ---

/** Opportunities with a per-stage application count (one grouped query). */
export async function listOpportunitiesWithStageCounts() {
  const rows = await db
    .select({
      opportunity_id: opportunities.id,
      title: opportunities.title,
      status: opportunities.status,
      stage: applications.pipeline_stage,
      count: sql<number>`count(${applications.id})`,
    })
    .from(opportunities)
    .leftJoin(applications, eq(applications.opportunity_id, opportunities.id))
    .groupBy(
      opportunities.id,
      opportunities.title,
      opportunities.status,
      applications.pipeline_stage,
    );

  const byOpp = new Map<
    number,
    {
      opportunity_id: number;
      title: string;
      status: string;
      stages: Record<string, number>;
      total: number;
    }
  >();
  for (const r of rows) {
    let entry = byOpp.get(r.opportunity_id);
    if (!entry) {
      entry = {
        opportunity_id: r.opportunity_id,
        title: r.title,
        status: r.status,
        stages: {},
        total: 0,
      };
      byOpp.set(r.opportunity_id, entry);
    }
    if (r.stage) {
      const n = Number(r.count);
      entry.stages[r.stage] = n;
      entry.total += n;
    }
  }
  return [...byOpp.values()];
}

export type ApplicationListFilters = {
  opportunity_id?: number;
  stage?: string;
  flagged?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function listApplications(filters: ApplicationListFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const conds = [];
  if (filters.opportunity_id) conds.push(eq(applications.opportunity_id, filters.opportunity_id));
  if (filters.stage) conds.push(eq(applications.pipeline_stage, filters.stage));
  if (filters.flagged !== undefined) conds.push(eq(applications.flagged, filters.flagged));
  if (filters.search) {
    const like = `%${filters.search}%`;
    conds.push(
      sql`(${applications.first_name} ILIKE ${like} OR ${applications.last_name} ILIKE ${like} OR ${applications.email} ILIKE ${like})`,
    );
  }
  const where = conds.length ? and(...conds) : undefined;

  const rows = await db
    .select({
      id: applications.id,
      opportunity_id: applications.opportunity_id,
      first_name: applications.first_name,
      last_name: applications.last_name,
      email: applications.email,
      pipeline_stage: applications.pipeline_stage,
      flagged: applications.flagged,
      submission_date: applications.submission_date,
    })
    .from(applications)
    .where(where)
    .orderBy(sql`${applications.submission_date} desc`)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(applications)
    .where(where);

  return { data: rows, page, pageSize, total: Number(total) };
}

export async function getApplicationDetail(applicationId: number) {
  const [app] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);
  if (!app) throw new AppError("Application not found", 404);

  const events = await db
    .select()
    .from(application_stage_events)
    .where(eq(application_stage_events.application_id, applicationId))
    .orderBy(application_stage_events.created_at);
  const scores = await db
    .select()
    .from(application_scores)
    .where(eq(application_scores.application_id, applicationId));
  const emails = await db
    .select()
    .from(recruitment_emails)
    .where(eq(recruitment_emails.application_id, applicationId));

  return { application: app, stage_events: events, scores, emails };
}

// --- Screening rule CRUD ---

export type ScreeningRuleInput = {
  field_key: string;
  operator: string;
  value?: unknown;
  action: string; // 'auto_reject' | 'flag'
  email_template?: string | null;
  rejection_reason?: string | null;
  is_active?: boolean;
};

export async function listScreeningRules(opportunityId: number) {
  return db
    .select()
    .from(screening_rules)
    .where(eq(screening_rules.opportunity_id, opportunityId))
    .orderBy(screening_rules.id);
}

export async function createScreeningRule(opportunityId: number, input: ScreeningRuleInput) {
  const [row] = await db
    .insert(screening_rules)
    .values({
      opportunity_id: opportunityId,
      field_key: input.field_key,
      operator: input.operator,
      value: input.value ?? null,
      action: input.action,
      email_template: input.email_template ?? null,
      rejection_reason: input.rejection_reason ?? null,
      is_active: input.is_active ?? true,
    })
    .returning();
  return row;
}

export async function updateScreeningRule(ruleId: number, input: Partial<ScreeningRuleInput>) {
  const patch: Record<string, unknown> = { updated_at: new Date() };
  for (const k of [
    "field_key",
    "operator",
    "value",
    "action",
    "email_template",
    "rejection_reason",
    "is_active",
  ] as const) {
    if (input[k] !== undefined) patch[k] = input[k];
  }
  const [row] = await db
    .update(screening_rules)
    .set(patch)
    .where(eq(screening_rules.id, ruleId))
    .returning();
  if (!row) throw new AppError("Screening rule not found", 404);
  return row;
}

export async function deleteScreeningRule(ruleId: number) {
  const [rule] = await db
    .select()
    .from(screening_rules)
    .where(eq(screening_rules.id, ruleId))
    .limit(1);
  if (!rule) throw new AppError("Screening rule not found", 404);
  if (rule.hit_count > 0) {
    await db
      .update(screening_rules)
      .set({ is_active: false, updated_at: new Date() })
      .where(eq(screening_rules.id, ruleId));
    return { deleted: false, deactivated: true };
  }
  await db.delete(screening_rules).where(eq(screening_rules.id, ruleId));
  return { deleted: true, deactivated: false };
}

// --- Evaluation criteria CRUD ---

export type CriterionInput = {
  name: string;
  weight?: string | number;
  max_score?: number;
  sort_order?: number;
};

export async function listCriteria(opportunityId: number) {
  return db
    .select()
    .from(evaluation_criteria)
    .where(eq(evaluation_criteria.opportunity_id, opportunityId))
    .orderBy(evaluation_criteria.sort_order, evaluation_criteria.id);
}

export async function createCriterion(opportunityId: number, input: CriterionInput) {
  const [row] = await db
    .insert(evaluation_criteria)
    .values({
      opportunity_id: opportunityId,
      name: input.name,
      weight: input.weight != null ? String(input.weight) : undefined,
      max_score: input.max_score,
      sort_order: input.sort_order,
    })
    .returning();
  return row;
}

export async function updateCriterion(criterionId: number, input: Partial<CriterionInput>) {
  const patch: Record<string, unknown> = { updated_at: new Date() };
  if (input.name !== undefined) patch.name = input.name;
  if (input.weight !== undefined) patch.weight = String(input.weight);
  if (input.max_score !== undefined) patch.max_score = input.max_score;
  if (input.sort_order !== undefined) patch.sort_order = input.sort_order;
  const [row] = await db
    .update(evaluation_criteria)
    .set(patch)
    .where(eq(evaluation_criteria.id, criterionId))
    .returning();
  if (!row) throw new AppError("Criterion not found", 404);
  return row;
}

/** Delete a criterion — blocked while any scores reference it (spec §4). */
export async function deleteCriterion(criterionId: number) {
  const [scored] = await db
    .select({ id: application_scores.id })
    .from(application_scores)
    .where(eq(application_scores.criterion_id, criterionId))
    .limit(1);
  if (scored) throw new AppError("Cannot delete a criterion that already has scores", 409);
  await db.delete(evaluation_criteria).where(eq(evaluation_criteria.id, criterionId));
  return { deleted: true };
}
