/**
 * Recruitment review depth (REC-06): reviewer assignment (cross-department experts), interview
 * notes (documentation trail), and bulk "position filled" close-out (HR-gated on target hires).
 */
import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { AppError } from "../../middlewares";
import { Logger } from "../../config";
import { applications, opportunities } from "../../db/schema/opportunities";
import { offers } from "../../db/schema/recruitment/offers";
import { application_reviewers, interview_notes } from "../../db/schema/recruitment/review";
import { users } from "../../db/schema";
import { transition } from "./pipeline.service";
import { sendApplicantEmail } from "./pipeline.service";

const logger = new Logger("ReviewService");

// --- Reviewer assignment ---

export async function assignReviewer(
  applicationId: number,
  reviewerUserId: number,
  assignedBy: number,
  role?: string,
) {
  const [app] = await db
    .select({ id: applications.id })
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);
  if (!app) throw new AppError("Application not found", 404);
  const [reviewer] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, reviewerUserId))
    .limit(1);
  if (!reviewer) throw new AppError("Reviewer not found", 404);

  const [row] = await db
    .insert(application_reviewers)
    .values({
      application_id: applicationId,
      reviewer_user_id: reviewerUserId,
      role: role ?? null,
      assigned_by: assignedBy,
    })
    .onConflictDoNothing()
    .returning();
  if (!row) {
    const [existing] = await db
      .select()
      .from(application_reviewers)
      .where(
        and(
          eq(application_reviewers.application_id, applicationId),
          eq(application_reviewers.reviewer_user_id, reviewerUserId),
        ),
      )
      .limit(1);
    return existing;
  }
  return row;
}

export async function removeReviewer(applicationId: number, reviewerUserId: number) {
  await db
    .delete(application_reviewers)
    .where(
      and(
        eq(application_reviewers.application_id, applicationId),
        eq(application_reviewers.reviewer_user_id, reviewerUserId),
      ),
    );
  return { removed: true };
}

export async function listReviewers(applicationId: number) {
  return db
    .select({
      id: application_reviewers.id,
      reviewer_user_id: application_reviewers.reviewer_user_id,
      role: application_reviewers.role,
      name: users.name,
      email: users.email,
    })
    .from(application_reviewers)
    .innerJoin(users, eq(application_reviewers.reviewer_user_id, users.id))
    .where(eq(application_reviewers.application_id, applicationId));
}

/** Is this user an assigned reviewer for this application? (used for row-scoped score/note access) */
export async function isAssignedReviewer(applicationId: number, userId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: application_reviewers.id })
    .from(application_reviewers)
    .where(
      and(
        eq(application_reviewers.application_id, applicationId),
        eq(application_reviewers.reviewer_user_id, userId),
      ),
    )
    .limit(1);
  return Boolean(row);
}

// --- Interview notes ---

export async function addNote(
  applicationId: number,
  authorUserId: number,
  input: { stage: string; note: string; rating?: number },
) {
  if (input.rating != null && (input.rating < 1 || input.rating > 5)) {
    throw new AppError("Rating must be between 1 and 5", 422);
  }
  const [app] = await db
    .select({ stage: applications.pipeline_stage })
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);
  if (!app) throw new AppError("Application not found", 404);

  const [row] = await db
    .insert(interview_notes)
    .values({
      application_id: applicationId,
      author_user_id: authorUserId,
      stage: input.stage || app.stage,
      rating: input.rating ?? null,
      note: input.note,
    })
    .returning();
  return row;
}

export async function listNotes(applicationId: number) {
  return db
    .select({
      id: interview_notes.id,
      author_user_id: interview_notes.author_user_id,
      author_name: users.name,
      stage: interview_notes.stage,
      rating: interview_notes.rating,
      note: interview_notes.note,
      created_at: interview_notes.created_at,
    })
    .from(interview_notes)
    .innerJoin(users, eq(interview_notes.author_user_id, users.id))
    .where(eq(interview_notes.application_id, applicationId))
    .orderBy(interview_notes.created_at);
}

// --- Bulk "position filled" close-out ---

export interface CloseOutPreview {
  target_hires: number;
  accepted_offers: number;
  target_met: boolean;
  remaining: number; // candidates in a non-terminal stage that would be rejected
}

/** How many accepted offers exist for an opportunity, and whether the target is met. */
export async function closeOutPreview(opportunityId: number): Promise<CloseOutPreview> {
  const [opp] = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.id, opportunityId))
    .limit(1);
  if (!opp) throw new AppError("Opportunity not found", 404);

  const [{ accepted }] = await db
    .select({ accepted: sql<number>`count(*)` })
    .from(offers)
    .innerJoin(applications, eq(offers.application_id, applications.id))
    .where(and(eq(applications.opportunity_id, opportunityId), eq(offers.status, "accepted")));

  const [{ remaining }] = await db
    .select({ remaining: sql<number>`count(*)` })
    .from(applications)
    .where(
      and(
        eq(applications.opportunity_id, opportunityId),
        sql`${applications.pipeline_stage} not in ('hired','rejected','withdrawn')`,
      ),
    );

  const acceptedN = Number(accepted);
  return {
    target_hires: opp.target_hires,
    accepted_offers: acceptedN,
    target_met: acceptedN >= opp.target_hires,
    remaining: Number(remaining),
  };
}

/**
 * Reject every remaining non-terminal candidate with a courteous "position filled" email. Gated:
 * only allowed once accepted offers >= target_hires (HR-initiated). Returns how many were closed.
 */
export async function closeOutRemaining(
  opportunityId: number,
  actorUserId: number,
  rejectionReason = "This position has now been filled. Thank you for your interest.",
): Promise<{ closed: number }> {
  const preview = await closeOutPreview(opportunityId);
  if (!preview.target_met) {
    throw new AppError(
      `Target not met: ${preview.accepted_offers}/${preview.target_hires} hires accepted`,
      409,
    );
  }

  const remaining = await db
    .select({ id: applications.id })
    .from(applications)
    .where(
      and(
        eq(applications.opportunity_id, opportunityId),
        sql`${applications.pipeline_stage} not in ('hired','rejected','withdrawn')`,
      ),
    );

  let closed = 0;
  for (const { id } of remaining) {
    try {
      await transition(id, "rejected", actorUserId, {
        note: "Position filled — bulk close-out",
        rejectionReason,
        sendEmailToApplicant: false, // send below with the filled-position copy
      });
      await sendApplicantEmail(id, "rejected").catch(() => {});
      closed += 1;
    } catch (err) {
      logger.error(`Close-out failed for application ${id}`, err);
    }
  }
  return { closed };
}
