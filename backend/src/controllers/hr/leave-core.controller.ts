/**
 * MOD-06 endpoints on the employees model: self-service requests, manager approvals, calendar,
 * and the HR settings for policies/holidays/balances.
 */
import { Request, Response } from "express";
import * as leave from "@/services/hr/leave-core.service";
import { getEmployeeForUser } from "@/services/hr/employee-context";
import { AppError } from "@/middlewares";
import { constants, Logger } from "@/config";

const logger = new Logger("LeaveCoreController");

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

/**
 * The shared validate() middleware checks the schema but does not write coerced values back to
 * req.body, so dates still arrive as strings here.
 */
function parseLeaveInput(body: Record<string, unknown>): leave.LeaveRequestInput {
  return {
    type: body.type as leave.LeaveTypeName,
    startDate: new Date(body.startDate as string),
    endDate: new Date(body.endDate as string),
    reason: (body.reason as string | undefined) ?? undefined,
  };
}

// --- Self-service ---

export const getMyLeave = async (req: Request, res: Response) => {
  try {
    const { employeeId } = await getEmployeeForUser(actorId(req));
    const year = Number(req.query.year ?? new Date().getUTCFullYear());
    return res.json(await leave.getMyLeave(employeeId, year));
  } catch (e) {
    return handleError(res, e, "Get My Leave Error");
  }
};

export const requestMyLeave = async (req: Request, res: Response) => {
  try {
    const { employeeId } = await getEmployeeForUser(actorId(req));
    const created = await leave.requestLeave(actorId(req), employeeId, parseLeaveInput(req.body));
    return res.status(201).json({ leave: created });
  } catch (e) {
    return handleError(res, e, "Request Leave Error");
  }
};

/** Dry run for the request dialog: day count + remaining balance, no row written. */
export const validateMyLeave = async (req: Request, res: Response) => {
  try {
    const { employeeId } = await getEmployeeForUser(actorId(req));
    const { type, startDate, endDate } = parseLeaveInput(req.body);
    const year = startDate.getUTCFullYear();

    // Materialize the year's balances first, or an employee who hasn't requested leave yet would
    // be told they have none remaining.
    await leave.ensureBalances(employeeId, year).catch(() => {});

    const days = await leave.computeWorkingDays(startDate, endDate);
    const remaining = await leave.remainingDays(employeeId, year, type);
    return res.json({ days, remaining, sufficient: days <= remaining });
  } catch (e) {
    return handleError(res, e, "Validate Leave Error");
  }
};

export const requestLeaveForEmployee = async (req: Request, res: Response) => {
  try {
    const created = await leave.requestLeave(
      actorId(req),
      req.params.employeeId,
      parseLeaveInput(req.body),
    );
    return res.status(201).json({ leave: created });
  } catch (e) {
    return handleError(res, e, "Request Leave Error");
  }
};

export const cancelLeave = async (req: Request, res: Response) => {
  try {
    return res.json({ leave: await leave.cancelLeaveRequest(actorId(req), req.params.id) });
  } catch (e) {
    return handleError(res, e, "Cancel Leave Error");
  }
};

/** multer-s3 augments the uploaded file with `location`/`key` (not part of Express.Multer.File). */
function uploadedFile(req: Request) {
  const file = req.file as unknown as { key?: string; size?: number; originalname?: string };
  if (!file?.key) return undefined;
  return { key: file.key, size: file.size ?? 0, originalName: file.originalname ?? file.key };
}

export const addLeaveAttachment = async (req: Request, res: Response) => {
  try {
    const file = uploadedFile(req);
    if (!file) throw new AppError("A file is required", 400);
    const document = await leave.addLeaveAttachment(actorId(req), req.params.id, file);
    return res.status(201).json({ document });
  } catch (e) {
    return handleError(res, e, "Add Leave Attachment Error");
  }
};

export const listLeaveAttachments = async (req: Request, res: Response) => {
  try {
    const attachments = await leave.listLeaveAttachments(actorId(req), req.params.id);
    return res.json({ attachments });
  } catch (e) {
    return handleError(res, e, "List Leave Attachments Error");
  }
};

// --- Approvals ---

export const pendingApprovals = async (req: Request, res: Response) => {
  try {
    return res.json({ leaves: await leave.listPendingApprovals(actorId(req)) });
  } catch (e) {
    return handleError(res, e, "Pending Approvals Error");
  }
};

/**
 * Role-scoped leave request list (any status): the employee's own plus their reports' for a
 * regular user, or every request in the org for HR/admin. Backs the "Leave Requests" table.
 */
export const visibleLeaves = async (req: Request, res: Response) => {
  try {
    return res.json({ leaves: await leave.listVisibleLeaves(actorId(req)) });
  } catch (e) {
    return handleError(res, e, "List Visible Leaves Error");
  }
};

export const approveLeave = async (req: Request, res: Response) => {
  try {
    const decided = await leave.decideLeave(actorId(req), req.params.id, "APPROVED", req.body.note);
    return res.json({ leave: decided });
  } catch (e) {
    return handleError(res, e, "Approve Leave Error");
  }
};

export const rejectLeave = async (req: Request, res: Response) => {
  try {
    const decided = await leave.decideLeave(actorId(req), req.params.id, "REJECTED", req.body.note);
    return res.json({ leave: decided });
  } catch (e) {
    return handleError(res, e, "Reject Leave Error");
  }
};

export const calendar = async (req: Request, res: Response) => {
  try {
    const events = await leave.getLeaveCalendar(actorId(req), {
      from: new Date(req.query.from as string),
      to: new Date(req.query.to as string),
    });
    return res.json({ events });
  } catch (e) {
    return handleError(res, e, "Leave Calendar Error");
  }
};

// --- Settings (leave:manage) ---

export const listPolicies = async (_req: Request, res: Response) => {
  try {
    return res.json({ policies: await leave.listPolicies() });
  } catch (e) {
    return handleError(res, e, "List Policies Error");
  }
};

export const createPolicy = async (req: Request, res: Response) => {
  try {
    return res.status(201).json({ policy: await leave.upsertPolicy(req.body) });
  } catch (e) {
    return handleError(res, e, "Create Policy Error");
  }
};

export const updatePolicy = async (req: Request, res: Response) => {
  try {
    return res.json({ policy: await leave.updatePolicy(Number(req.params.id), req.body) });
  } catch (e) {
    return handleError(res, e, "Update Policy Error");
  }
};

export const deletePolicy = async (req: Request, res: Response) => {
  try {
    return res.json({ policy: await leave.deletePolicy(Number(req.params.id)) });
  } catch (e) {
    return handleError(res, e, "Delete Policy Error");
  }
};

/**
 * Default: every configured holiday (Settings admin CRUD needs to see/manage all of them,
 * including ones for countries the org has no employees in right now). ?scope=relevant (punch-list
 * #7, the Leave Calendar's Public Holidays section) narrows to the union of universal holidays
 * plus whichever countries are actually represented among active employees.
 */
export const listHolidays = async (req: Request, res: Response) => {
  try {
    const year = req.query.year ? Number(req.query.year) : undefined;
    const holidays =
      req.query.scope === "relevant"
        ? await leave.listRelevantHolidays(year)
        : await leave.listHolidays(year);
    return res.json({ holidays });
  } catch (e) {
    return handleError(res, e, "List Holidays Error");
  }
};

export const createHoliday = async (req: Request, res: Response) => {
  try {
    return res.status(201).json({ holiday: await leave.createHoliday(req.body) });
  } catch (e) {
    return handleError(res, e, "Create Holiday Error");
  }
};

export const deleteHoliday = async (req: Request, res: Response) => {
  try {
    return res.json({ holiday: await leave.deleteHoliday(Number(req.params.id)) });
  } catch (e) {
    return handleError(res, e, "Delete Holiday Error");
  }
};

export const adjustBalance = async (req: Request, res: Response) => {
  try {
    const { note, ...patch } = req.body;
    const balance = await leave.adjustBalance(Number(req.params.id), patch, note);
    return res.json({ balance });
  } catch (e) {
    return handleError(res, e, "Adjust Balance Error");
  }
};
