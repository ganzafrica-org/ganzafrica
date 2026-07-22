import { Request, Response } from "express";
import * as pipeline from "../services/recruitment/pipeline.service";
import * as funnel from "../services/recruitment/funnel.service";
import * as review from "../services/recruitment/review.service";
import { AppError } from "../middlewares";
import { constants, Logger } from "../config";

const logger = new Logger("RecruitmentPipelineController");

function handleError(res: Response, error: unknown, context: string) {
  if (error instanceof pipeline.IllegalTransitionError) {
    return res.status(409).json({ error: "Illegal transition", allowed: error.allowed });
  }
  logger.error(context, error as Error);
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: context, message: error.message });
  }
  return res
    .status(500)
    .json({ error: context, message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
}

export const listOpportunities = async (_req: Request, res: Response) => {
  try {
    const opportunities = await pipeline.listOpportunitiesWithStageCounts();
    return res.json({ opportunities });
  } catch (error) {
    return handleError(res, error, "List Opportunities Error");
  }
};

export const listApplications = async (req: Request, res: Response) => {
  try {
    const result = await pipeline.listApplications({
      opportunity_id: req.query.opportunity_id ? Number(req.query.opportunity_id) : undefined,
      stage: req.query.stage as string | undefined,
      flagged: req.query.flagged === undefined ? undefined : req.query.flagged === "true",
      search: req.query.search as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
    });
    return res.json(result);
  } catch (error) {
    return handleError(res, error, "List Applications Error");
  }
};

export const getApplication = async (req: Request, res: Response) => {
  try {
    const detail = await pipeline.getApplicationDetail(Number(req.params.id));
    return res.json(detail);
  } catch (error) {
    return handleError(res, error, "Get Application Error");
  }
};

export const transition = async (req: Request, res: Response) => {
  try {
    const actorId = Number(req.user!.id);
    const app = await pipeline.transition(Number(req.params.id), req.body.to_stage, actorId, {
      note: req.body.note,
      sendEmailToApplicant: Boolean(req.body.send_email),
    });
    return res.json({ application: app });
  } catch (error) {
    return handleError(res, error, "Transition Error");
  }
};

export const rescreen = async (req: Request, res: Response) => {
  try {
    await pipeline.runScreening(Number(req.params.id));
    const detail = await pipeline.getApplicationDetail(Number(req.params.id));
    return res.json(detail);
  } catch (error) {
    return handleError(res, error, "Rescreen Error");
  }
};

// Screening rules
export const listScreeningRules = async (req: Request, res: Response) => {
  try {
    return res.json({ rules: await pipeline.listScreeningRules(Number(req.params.id)) });
  } catch (error) {
    return handleError(res, error, "List Screening Rules Error");
  }
};
export const createScreeningRule = async (req: Request, res: Response) => {
  try {
    return res
      .status(201)
      .json({ rule: await pipeline.createScreeningRule(Number(req.params.id), req.body) });
  } catch (error) {
    return handleError(res, error, "Create Screening Rule Error");
  }
};
export const patchScreeningRule = async (req: Request, res: Response) => {
  try {
    return res.json({
      rule: await pipeline.updateScreeningRule(Number(req.params.ruleId), req.body),
    });
  } catch (error) {
    return handleError(res, error, "Update Screening Rule Error");
  }
};
export const deleteScreeningRule = async (req: Request, res: Response) => {
  try {
    return res.json(await pipeline.deleteScreeningRule(Number(req.params.ruleId)));
  } catch (error) {
    return handleError(res, error, "Delete Screening Rule Error");
  }
};

// Evaluation criteria
export const listCriteria = async (req: Request, res: Response) => {
  try {
    return res.json({ criteria: await pipeline.listCriteria(Number(req.params.id)) });
  } catch (error) {
    return handleError(res, error, "List Criteria Error");
  }
};
export const createCriterion = async (req: Request, res: Response) => {
  try {
    return res
      .status(201)
      .json({ criterion: await pipeline.createCriterion(Number(req.params.id), req.body) });
  } catch (error) {
    return handleError(res, error, "Create Criterion Error");
  }
};
export const patchCriterion = async (req: Request, res: Response) => {
  try {
    return res.json({
      criterion: await pipeline.updateCriterion(Number(req.params.criterionId), req.body),
    });
  } catch (error) {
    return handleError(res, error, "Update Criterion Error");
  }
};
export const deleteCriterion = async (req: Request, res: Response) => {
  try {
    return res.json(await pipeline.deleteCriterion(Number(req.params.criterionId)));
  } catch (error) {
    return handleError(res, error, "Delete Criterion Error");
  }
};

export const getFunnel = async (req: Request, res: Response) => {
  try {
    const result = await funnel.getFunnel(Number(req.params.id));
    return res.json(result);
  } catch (error) {
    return handleError(res, error, "Funnel Error");
  }
};

// --- REC-06 reviewers ---
export const listReviewers = async (req: Request, res: Response) => {
  try {
    return res.json({ reviewers: await review.listReviewers(Number(req.params.id)) });
  } catch (error) {
    return handleError(res, error, "List Reviewers Error");
  }
};
export const assignReviewer = async (req: Request, res: Response) => {
  try {
    const row = await review.assignReviewer(
      Number(req.params.id),
      req.body.reviewer_user_id,
      Number(req.user!.id),
      req.body.role,
    );
    return res.status(201).json({ reviewer: row });
  } catch (error) {
    return handleError(res, error, "Assign Reviewer Error");
  }
};
export const removeReviewer = async (req: Request, res: Response) => {
  try {
    return res.json(
      await review.removeReviewer(Number(req.params.id), Number(req.params.reviewerId)),
    );
  } catch (error) {
    return handleError(res, error, "Remove Reviewer Error");
  }
};

// --- REC-06 interview notes ---
export const listNotes = async (req: Request, res: Response) => {
  try {
    return res.json({ notes: await review.listNotes(Number(req.params.id)) });
  } catch (error) {
    return handleError(res, error, "List Notes Error");
  }
};
export const addNote = async (req: Request, res: Response) => {
  try {
    // Route guard already admits recruitment:read (HR, director, and cross-dept reviewers granted
    // read). The note records its author, so any admitted reviewer can document their assessment.
    const note = await review.addNote(Number(req.params.id), Number(req.user!.id), req.body);
    return res.status(201).json({ note });
  } catch (error) {
    return handleError(res, error, "Add Note Error");
  }
};

// --- REC-06 bulk close-out ---
export const closeOutPreview = async (req: Request, res: Response) => {
  try {
    return res.json(await review.closeOutPreview(Number(req.params.id)));
  } catch (error) {
    return handleError(res, error, "Close-out Preview Error");
  }
};
export const closeOutRemaining = async (req: Request, res: Response) => {
  try {
    const result = await review.closeOutRemaining(
      Number(req.params.id),
      Number(req.user!.id),
      req.body?.rejection_reason,
    );
    return res.json(result);
  } catch (error) {
    return handleError(res, error, "Close-out Error");
  }
};

// Scores
export const putScores = async (req: Request, res: Response) => {
  try {
    const reviewerId = Number(req.user!.id);
    const weightedTotal = await pipeline.upsertScores(
      Number(req.params.id),
      reviewerId,
      req.body.scores,
    );
    return res.json({ weighted_total: weightedTotal });
  } catch (error) {
    return handleError(res, error, "Save Scores Error");
  }
};
