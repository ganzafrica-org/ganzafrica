/**
 * MOD-02 org hierarchy endpoints. Field-set/cycle validation lives in org.service.ts, so these
 * controllers stay thin (same convention as employees-core.controller.ts).
 */
import { Request, Response } from "express";
import * as orgService from "@/services/hr/org.service";
import { canManageEmployees } from "@/services/hr/employees-core.service";
import { getEmployeeForUser } from "@/services/hr/employee-context";
import { AppError } from "@/middlewares";
import { constants, Logger } from "@/config";

const logger = new Logger("OrgController");
const actorId = (req: Request) => Number(req.user!.id);

function handleError(res: Response, error: unknown, context: string) {
  logger.error(context, error as Error);
  if (error instanceof orgService.CycleError) {
    return res.status(422).json({ error: "cycle", path: error.path });
  }
  if (error instanceof AppError) {
    return res
      .status(error.statusCode)
      .json({ error: context, message: error.message, code: error.code });
  }
  return res
    .status(500)
    .json({ error: context, message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
}

export const getChart = async (_req: Request, res: Response) => {
  try {
    return res.json({ tree: await orgService.getOrgTree() });
  } catch (e) {
    return handleError(res, e, "Get Org Chart Error");
  }
};

export const setManager = async (req: Request, res: Response) => {
  try {
    const employee = await orgService.setManager(req.params.id, req.body.manager_id ?? null, {
      userId: actorId(req),
    });
    return res.json({ employee });
  } catch (e) {
    return handleError(res, e, "Set Manager Error");
  }
};

/** employees:read/manage see anyone's reports; otherwise only the manager themself. */
export const getReports = async (req: Request, res: Response) => {
  try {
    const canManage = await canManageEmployees(actorId(req));
    if (!canManage) {
      let ownEmployeeId: string | null = null;
      try {
        ownEmployeeId = (await getEmployeeForUser(actorId(req))).employeeId;
      } catch {
        // no employee profile for this account — falls through to the 403 below
      }
      if (ownEmployeeId !== req.params.id) {
        return res
          .status(403)
          .json({ error: "Forbidden", message: "You cannot view this employee's reports" });
      }
    }
    const direct = req.query.direct !== "false";
    return res.json({ reports: await orgService.getReports(req.params.id, { direct }) });
  } catch (e) {
    return handleError(res, e, "Get Reports Error");
  }
};

export const getUnresolved = async (_req: Request, res: Response) => {
  try {
    return res.json({ unresolved: await orgService.listUnresolved() });
  } catch (e) {
    return handleError(res, e, "Get Unresolved Managers Error");
  }
};
