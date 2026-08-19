/**
 * MOD-01 employees endpoints on the employees model. Field-set enforcement lives in the service,
 * so these controllers stay thin.
 */
import { Request, Response } from "express";
import * as employees from "@/services/hr/employees-core.service";
import { AppError } from "@/middlewares";
import { constants, Logger } from "@/config";
import { getFileUrl } from "@/middlewares/upload";
import { sendEmail } from "@/services/email.service";
import { welcomeEmail } from "@/services/recruitment/offer-emails";
import { sendPasswordReset } from "@/services/auth.service";
import { sendNotification } from "@/modules/hr/notifications/notification.service";

const logger = new Logger("EmployeesCoreController");

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

export const listEmployees = async (req: Request, res: Response) => {
  try {
    const result = await employees.listEmployees({
      search: req.query.search as string | undefined,
      department: req.query.department as string | undefined,
      status: req.query.status as string | undefined,
      employment_type: req.query.employment_type as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sortBy: req.query.sortBy as "name" | "department" | "hired_at" | undefined,
      sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
    });
    return res.json(result);
  } catch (e) {
    return handleError(res, e, "List Employees Error");
  }
};

export const listDepartments = async (_req: Request, res: Response) => {
  try {
    return res.json({ departments: await employees.listDepartments() });
  } catch (e) {
    return handleError(res, e, "List Departments Error");
  }
};

export const getEmployee = async (req: Request, res: Response) => {
  try {
    return res.json({
      employee: await employees.getEmployeeDetail(actorId(req), req.params.id),
    });
  } catch (e) {
    return handleError(res, e, "Get Employee Error");
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await employees.createEmployee(req.body, actorId(req));
    // Post-commit, non-fatal: mirrors REC-05's offer-accept invite (offers.ts::sendWelcome).
    await sendInviteIfNewAccount(employee, req.ip).catch((e) =>
      logger.error("employee invite email failed (non-fatal)", e),
    );
    // EMPLOYEE_CREATED already existed as a routed notification type (IT+HR, not the new hire —
    // they get the email invite above instead) but nothing ever sent one. Surfaces in the same
    // notification bell/feed every other event type already uses — no new frontend surface needed.
    await sendNotification({
      type: "EMPLOYEE_CREATED",
      triggeredBy: actorId(req),
      relatedEntity: { employeeId: employee.id },
      title: "New employee added",
      message: `${employee.first_name} ${employee.last_name} was added to the system.`,
      priority: "NORMAL",
    }).catch((e) => logger.error("employee created notification failed (non-fatal)", e));
    return res.status(201).json({ employee });
  } catch (e) {
    return handleError(res, e, "Create Employee Error");
  }
};

/**
 * `invited` is only true for a brand-new `users` row (not one linked to an existing account) —
 * that account got a random, never-revealed password, so it needs the set-password link to be
 * usable. Reuses the password-reset token machinery rather than inventing a separate one.
 */
async function sendInviteIfNewAccount(
  employee: Awaited<ReturnType<typeof employees.createEmployee>>,
  ip?: string,
) {
  if (!employee.invited || !employee.personal_email) return;
  const { subject, html } = welcomeEmail({
    firstName: employee.first_name,
    positionTitle: employee.job_title ?? "your new role",
  });
  await sendEmail(employee.personal_email, subject, html);
  await sendPasswordReset(employee.user_id, employee.personal_email, ip ?? "0.0.0.0");
}

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    return res.json({
      employee: await employees.updateEmployeeAsHr(req.params.id, req.body),
    });
  } catch (e) {
    return handleError(res, e, "Update Employee Error");
  }
};

export const deactivateEmployee = async (req: Request, res: Response) => {
  try {
    await employees.deactivateEmployee(req.params.id, actorId(req));
    return res.status(204).send();
  } catch (e) {
    return handleError(res, e, "Deactivate Employee Error");
  }
};

export const reactivateEmployee = async (req: Request, res: Response) => {
  try {
    await employees.reactivateEmployee(req.params.id);
    return res.status(204).send();
  } catch (e) {
    return handleError(res, e, "Reactivate Employee Error");
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    return res.json({ me: await employees.getMyEmployeeRecord(actorId(req)) });
  } catch (e) {
    return handleError(res, e, "Get Me Error");
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    // multer-s3 augments the file with `location` (not part of Express.Multer.File) — same
    // shape assets.controller.ts's buildImageInputs reads from req.files.
    const file = req.file as (Express.Multer.File & { location?: string }) | undefined;
    const patch = file ? { ...req.body, picture: getFileUrl(file.location!) } : req.body;
    return res.json({ me: await employees.updateMyProfile(actorId(req), patch) });
  } catch (e) {
    return handleError(res, e, "Update Profile Error");
  }
};
