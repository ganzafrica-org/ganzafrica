/**
 * CV ranking (REC-07) — ATS-style keyword scoring to help reviewers filter/sort candidates fast.
 * HR defines weighted keyword criteria per opportunity; on submission we extract the CV text
 * out-of-band and score it. Deliberately simple (keyword presence × weight, normalized 0..100).
 */
import { and, eq, desc, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { AppError } from "../../middlewares";
import { Logger } from "../../config";
import { applications } from "../../db/schema/opportunities";
import { ranking_criteria, application_cv_scores } from "../../db/schema/recruitment/ranking";
import { extractText, normalizeText } from "../text-extraction.service";
import { getPresignedDownload } from "../storage.service";

const logger = new Logger("CvRankingService");

// --- Criteria CRUD ---

export type CriterionInput = {
  keyword: string;
  weight?: string | number;
  category?: string | null;
  is_active?: boolean;
};

export async function listCriteria(opportunityId: number) {
  return db
    .select()
    .from(ranking_criteria)
    .where(eq(ranking_criteria.opportunity_id, opportunityId))
    .orderBy(ranking_criteria.id);
}

export async function createCriterion(opportunityId: number, input: CriterionInput) {
  const [row] = await db
    .insert(ranking_criteria)
    .values({
      opportunity_id: opportunityId,
      keyword: input.keyword.trim(),
      weight: input.weight != null ? String(input.weight) : "1",
      category: input.category ?? null,
      is_active: input.is_active ?? true,
    })
    .returning();
  return row;
}

export async function updateCriterion(id: number, input: Partial<CriterionInput>) {
  const patch: Record<string, unknown> = { updated_at: new Date() };
  if (input.keyword !== undefined) patch.keyword = input.keyword.trim();
  if (input.weight !== undefined) patch.weight = String(input.weight);
  if (input.category !== undefined) patch.category = input.category;
  if (input.is_active !== undefined) patch.is_active = input.is_active;
  const [row] = await db
    .update(ranking_criteria)
    .set(patch)
    .where(eq(ranking_criteria.id, id))
    .returning();
  if (!row) throw new AppError("Criterion not found", 404);
  return row;
}

export async function deleteCriterion(id: number) {
  await db.delete(ranking_criteria).where(eq(ranking_criteria.id, id));
  return { deleted: true };
}

// --- Scoring (pure) ---

export interface ScoreResult {
  score: number; // 0..100
  matched: { keyword: string; weight: number }[];
}

/** Pure scorer: keyword presence × weight, normalized against the total available weight. */
export function scoreText(
  text: string,
  criteria: { keyword: string; weight: string | number }[],
): ScoreResult {
  const normalized = normalizeText(text);
  const matched: { keyword: string; weight: number }[] = [];
  let matchedWeight = 0;
  let totalWeight = 0;

  for (const c of criteria) {
    const weight = Number(c.weight) || 0;
    totalWeight += weight;
    const kw = c.keyword.trim().toLowerCase();
    if (kw && normalized.includes(kw)) {
      matched.push({ keyword: c.keyword, weight });
      matchedWeight += weight;
    }
  }

  const score = totalWeight === 0 ? 0 : Math.round((matchedWeight / totalWeight) * 10000) / 100;
  return { score, matched };
}

// --- Async scoring trigger ---

/**
 * Score an application's CV against its opportunity's active criteria. Best-effort and non-fatal —
 * downloads the CV, extracts text, computes + upserts the score. Never throws to the caller.
 */
export async function scoreApplicationCv(applicationId: number): Promise<void> {
  try {
    const [app] = await db
      .select({ cv_url: applications.cv_url, opportunity_id: applications.opportunity_id })
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1);
    if (!app || !app.opportunity_id || !app.cv_url) return;

    const criteria = await db
      .select({ keyword: ranking_criteria.keyword, weight: ranking_criteria.weight })
      .from(ranking_criteria)
      .where(
        and(
          eq(ranking_criteria.opportunity_id, app.opportunity_id),
          eq(ranking_criteria.is_active, true),
        ),
      );
    if (criteria.length === 0) return;

    const { text, chars } = await fetchAndExtract(app.cv_url);
    const { score, matched } = scoreText(text, criteria);

    await db
      .insert(application_cv_scores)
      .values({
        application_id: applicationId,
        score: String(score),
        matched,
        extracted_chars: chars,
      })
      .onConflictDoUpdate({
        target: application_cv_scores.application_id,
        set: { score: String(score), matched, extracted_chars: chars, computed_at: new Date() },
      });
    logger.info(`CV scored for application ${applicationId}: ${score}`);
  } catch (err) {
    logger.warn(`CV scoring failed for application ${applicationId} (non-fatal)`, err as Error);
  }
}

/** Re-score every application for an opportunity (after criteria change). Returns count scored. */
export async function rescoreOpportunity(opportunityId: number): Promise<{ scored: number }> {
  const apps = await db
    .select({ id: applications.id })
    .from(applications)
    .where(eq(applications.opportunity_id, opportunityId));
  for (const a of apps) await scoreApplicationCv(a.id);
  return { scored: apps.length };
}

export async function getScore(applicationId: number) {
  const [row] = await db
    .select()
    .from(application_cv_scores)
    .where(eq(application_cv_scores.application_id, applicationId))
    .limit(1);
  return row ?? null;
}

/** Applications for an opportunity ranked by CV score desc (nulls last). */
export async function rankedApplications(opportunityId: number) {
  return db
    .select({
      application_id: applications.id,
      first_name: applications.first_name,
      last_name: applications.last_name,
      pipeline_stage: applications.pipeline_stage,
      cv_score: application_cv_scores.score,
    })
    .from(applications)
    .leftJoin(application_cv_scores, eq(application_cv_scores.application_id, applications.id))
    .where(eq(applications.opportunity_id, opportunityId))
    .orderBy(desc(sql`coalesce(${application_cv_scores.score}, -1)`));
}

/**
 * Download a CV (either a presign-able storage key or a direct URL) and extract its text. The
 * seam is intentionally tolerant of both since legacy CVs stored full URLs.
 */
async function fetchAndExtract(cvUrl: string): Promise<{ text: string; chars: number }> {
  try {
    let url = cvUrl;
    // If it's a bare storage key (no scheme), presign it.
    if (!/^https?:\/\//i.test(cvUrl)) {
      url = await getPresignedDownload(cvUrl, 300);
    }
    const res = await fetch(url);
    if (!res.ok) return { text: "", chars: 0 };
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? undefined;
    const extracted = await extractText(buffer, contentType);
    return { text: extracted.text, chars: extracted.chars };
  } catch {
    return { text: "", chars: 0 };
  }
}
