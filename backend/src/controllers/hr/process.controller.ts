/**
 * LCM-01 endpoints. Reads go through getProcessForViewer, which filters by viewer — controllers
 * never decide visibility themselves.
 */
import { Request, Response } from "express";
import * as process from "@/services/hr/process.service";
import { getEmployeeForUser } from "@/services/hr/employee-context";
import { AppError } from "@/middlewares";
import { constants, Logger } from "@/config";

const logger = new Logger("ProcessController");

function handleError(res: Response, error: unknown, context: string) {
  logger.error(context, error as Error);
  if (error instanceof AppError) {
    return res
      .status(error.statusCode)
      .json({ error: context, message: error.message, code: error.code });
  }
  return res
    .status(500)
    .json({ error: context, message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
}

const actorId = (req: Request) => Number(req.user!.id);

// --- Instances ---

export const listProcesses = async (req: Request, res: Response) => {
  try {
    const processes = await process.listProcesses({
      type: req.query.type as process.ProcessType | undefined,
      status: req.query.status as string | undefined,
      employeeId: req.query.employee_id as string | undefined,
    });
    return res.json({ processes });
  } catch (e) {
    return handleError(res, e, "List Processes Error");
  }
};

export const getProcess = async (req: Request, res: Response) => {
  try {
    return res.json(await process.getProcessForViewer(actorId(req), Number(req.params.id)));
  } catch (e) {
    return handleError(res, e, "Get Process Error");
  }
};

export const startProcess = async (req: Request, res: Response) => {
  try {
    const instance = await process.instantiateProcess(req.body.type, req.params.id, {
      actorUserId: actorId(req),
      templateId: req.body.template_id,
      startedAt: req.body.started_at ? new Date(req.body.started_at) : undefined,
    });
    return res.status(201).json({ process: instance });
  } catch (e) {
    return handleError(res, e, "Start Process Error");
  }
};

export const cancelProcess = async (req: Request, res: Response) => {
  try {
    return res.json({ process: await process.cancelProcess(Number(req.params.id)) });
  } catch (e) {
    return handleError(res, e, "Cancel Process Error");
  }
};

/** The onboardee's own view — resolves their instance so the client needs no id. */
export const getMyProcess = async (req: Request, res: Response) => {
  try {
    const { employeeId } = await getEmployeeForUser(actorId(req));
    const type = (req.query.type as process.ProcessType) ?? "onboarding";
    const mine = await process.listProcesses({ type, employeeId });
    const active = mine.find((p) => p.status === "in_progress") ?? mine[mine.length - 1];

    if (!active) return res.json({ process: null, tasks: [], progress: null });
    return res.json(await process.getProcessForViewer(actorId(req), active.id));
  } catch (e) {
    return handleError(res, e, "Get My Process Error");
  }
};

// --- Tasks ---

export const listMyTasks = async (req: Request, res: Response) => {
  try {
    return res.json({ tasks: await process.listMyTasks(actorId(req)) });
  } catch (e) {
    return handleError(res, e, "List My Tasks Error");
  }
};

export const completeTask = async (req: Request, res: Response) => {
  try {
    const task = await process.completeTask(actorId(req), Number(req.params.id), req.body.notes);
    return res.json({ task });
  } catch (e) {
    return handleError(res, e, "Complete Task Error");
  }
};

export const skipTask = async (req: Request, res: Response) => {
  try {
    const task = await process.skipTask(actorId(req), Number(req.params.id), req.body.notes);
    return res.json({ task });
  } catch (e) {
    return handleError(res, e, "Skip Task Error");
  }
};

export const patchTask = async (req: Request, res: Response) => {
  try {
    return res.json({
      task: await process.reassignTask(Number(req.params.id), req.body, actorId(req)),
    });
  } catch (e) {
    return handleError(res, e, "Update Task Error");
  }
};

// --- Templates (processes:manage) ---

export const listTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await process.listTemplates(
      req.query.type as process.ProcessType | undefined,
    );
    return res.json({ templates });
  } catch (e) {
    return handleError(res, e, "List Templates Error");
  }
};

export const getTemplate = async (req: Request, res: Response) => {
  try {
    return res.json(await process.getTemplate(Number(req.params.id)));
  } catch (e) {
    return handleError(res, e, "Get Template Error");
  }
};

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const template = await process.createTemplate(req.body, actorId(req));
    return res.status(201).json({ template });
  } catch (e) {
    return handleError(res, e, "Create Template Error");
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    return res.json({ template: await process.updateTemplate(Number(req.params.id), req.body) });
  } catch (e) {
    return handleError(res, e, "Update Template Error");
  }
};

export const deactivateTemplate = async (req: Request, res: Response) => {
  try {
    return res.json({ template: await process.deactivateTemplate(Number(req.params.id)) });
  } catch (e) {
    return handleError(res, e, "Deactivate Template Error");
  }
};

export const addTemplateTask = async (req: Request, res: Response) => {
  try {
    const task = await process.addTemplateTask(Number(req.params.id), req.body);
    return res.status(201).json({ task });
  } catch (e) {
    return handleError(res, e, "Add Template Task Error");
  }
};

export const removeTemplateTask = async (req: Request, res: Response) => {
  try {
    return res.json({ task: await process.removeTemplateTask(Number(req.params.taskId)) });
  } catch (e) {
    return handleError(res, e, "Remove Template Task Error");
  }
};
