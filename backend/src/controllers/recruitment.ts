import { Request, Response } from "express";
import * as formsService from "../services/recruitment/forms.service";
import * as eligibilityService from "../services/recruitment/eligibility.service";
import * as funnelService from "../services/recruitment/funnel.service";
import { AppError } from "../middlewares";
import { constants, Logger } from "../config";

const logger = new Logger("RecruitmentController");

function handleError(res: Response, error: unknown, context: string) {
  logger.error(context, error as Error);
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: context, message: error.message });
  }
  return res.status(500).json({
    error: context,
    message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  });
}

/**
 * Public: latest published form + the active rules' engine fields (client pre-check needs the
 * predicates and the reject_messages). 404 when nothing is published.
 */
export const getPublicForm = async (req: Request, res: Response) => {
  try {
    const opportunityId = Number(req.params.id);
    const form = await formsService.getPublishedForm(opportunityId);
    if (!form) {
      return res.status(404).json({ error: "Not Found", message: "No published form" });
    }
    const rules = await formsService.getActiveRules(opportunityId);
    return res.json({
      form: {
        version: form.version,
        definition: form.definition,
      },
      rules: rules.map((r) => ({
        field_key: r.field_key,
        operator: r.operator,
        value: r.value,
        reject_message: r.reject_message,
      })),
    });
  } catch (error) {
    return handleError(res, error, "Get Form Error");
  }
};

/**
 * Public, rate-limited: run the engine server-side. On failure, record anonymized hits. Never
 * creates an application row either way.
 */
export const eligibilityCheck = async (req: Request, res: Response) => {
  try {
    const opportunityId = Number(req.params.id);
    const answers = (req.body?.answers ?? {}) as Record<string, unknown>;

    const rules = await formsService.getActiveRules(opportunityId);
    const result = eligibilityService.evaluate(rules, answers);

    if (!result.eligible) {
      await eligibilityService.recordHits(result.failedRuleIds);
      return res.json({ eligible: false, failed: result.failed });
    }
    return res.json({ eligible: true });
  } catch (error) {
    return handleError(res, error, "Eligibility Check Error");
  }
};

/**
 * Public, rate-limited funnel event ingest. Fire-and-forget — always 204, never blocks the page.
 * Validation failures are logged inside the service and still return 204 to keep the client dumb.
 */
export const recordFunnelEvent = async (req: Request, res: Response) => {
  try {
    await funnelService.recordEvent(Number(req.params.id), req.body?.event, req.body?.session_key);
  } catch (error) {
    logger.error("Funnel event error (swallowed)", error as Error);
  }
  return res.status(204).end();
};

// --- HR (recruitment:manage) ---

export const getForm = async (req: Request, res: Response) => {
  try {
    const opportunityId = Number(req.params.id);
    const draft = await formsService.getDraftForm(opportunityId);
    const published = await formsService.getPublishedForm(opportunityId);
    return res.json({ draft: draft ?? null, published: published ?? null });
  } catch (error) {
    return handleError(res, error, "Get Form Error");
  }
};

export const putForm = async (req: Request, res: Response) => {
  try {
    const opportunityId = Number(req.params.id);
    const userId = Number(req.user!.id);
    const form = await formsService.saveDraft(opportunityId, req.body.definition, userId);
    return res.json({ form });
  } catch (error) {
    return handleError(res, error, "Save Form Error");
  }
};

export const publishForm = async (req: Request, res: Response) => {
  try {
    const opportunityId = Number(req.params.id);
    const form = await formsService.publishDraft(opportunityId);
    return res.json({ form });
  } catch (error) {
    return handleError(res, error, "Publish Form Error");
  }
};

export const listRules = async (req: Request, res: Response) => {
  try {
    const opportunityId = Number(req.params.id);
    const rules = await formsService.listRules(opportunityId);
    return res.json({ rules });
  } catch (error) {
    return handleError(res, error, "List Rules Error");
  }
};

export const createRule = async (req: Request, res: Response) => {
  try {
    const opportunityId = Number(req.params.id);
    const rule = await formsService.createRule(opportunityId, req.body);
    return res.status(201).json({ rule });
  } catch (error) {
    return handleError(res, error, "Create Rule Error");
  }
};

export const patchRule = async (req: Request, res: Response) => {
  try {
    const ruleId = Number(req.params.ruleId);
    const rule = await formsService.updateRule(ruleId, req.body);
    return res.json({ rule });
  } catch (error) {
    return handleError(res, error, "Update Rule Error");
  }
};

export const deleteRule = async (req: Request, res: Response) => {
  try {
    const ruleId = Number(req.params.ruleId);
    const result = await formsService.deleteOrDeactivateRule(ruleId);
    return res.json(result);
  } catch (error) {
    return handleError(res, error, "Delete Rule Error");
  }
};
