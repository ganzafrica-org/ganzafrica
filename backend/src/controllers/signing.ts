import { Request, Response } from "express";
import * as signing from "../services/signing.service";
import { sendEmail } from "../services/email.service";
import { AppError } from "../middlewares";
import { constants, Logger } from "../config";

const logger = new Logger("SigningController");

function handleError(res: Response, error: unknown, context: string) {
  logger.error(context, error as Error);
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: context, message: error.message });
  }
  return res
    .status(500)
    .json({ error: context, message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
}

// --- Templates (signing:manage) ---
export const listTemplates = async (_req: Request, res: Response) => {
  try {
    return res.json({ templates: await signing.listTemplates() });
  } catch (e) {
    return handleError(res, e, "List Templates Error");
  }
};
export const createTemplate = async (req: Request, res: Response) => {
  try {
    return res
      .status(201)
      .json({ template: await signing.createTemplate(req.body, Number(req.user!.id)) });
  } catch (e) {
    return handleError(res, e, "Create Template Error");
  }
};
export const getTemplate = async (req: Request, res: Response) => {
  try {
    return res.json(await signing.getTemplate(Number(req.params.id)));
  } catch (e) {
    return handleError(res, e, "Get Template Error");
  }
};
export const addField = async (req: Request, res: Response) => {
  try {
    return res.status(201).json({ field: await signing.addField(Number(req.params.id), req.body) });
  } catch (e) {
    return handleError(res, e, "Add Field Error");
  }
};
export const removeField = async (req: Request, res: Response) => {
  try {
    return res.json(await signing.removeField(Number(req.params.fieldId)));
  } catch (e) {
    return handleError(res, e, "Remove Field Error");
  }
};

// --- Requests (signing:manage) ---
export const createRequest = async (req: Request, res: Response) => {
  try {
    return res
      .status(201)
      .json({ request: await signing.createRequest(req.body, Number(req.user!.id)) });
  } catch (e) {
    return handleError(res, e, "Create Request Error");
  }
};
export const sendRequest = async (req: Request, res: Response) => {
  try {
    const { request, link } = await signing.sendRequest(Number(req.params.id));
    // Notify the signer. Internal signers sign in-app; external signers get the token link.
    if (request.signer_email) {
      const body = link
        ? `<p>You have a document to sign: <strong>${request.subject}</strong>.</p><p><a href="${link}">Open &amp; sign</a></p>`
        : `<p>You have a document to sign: <strong>${request.subject}</strong>. Sign in to GanzAfrica to complete it.</p>`;
      await sendEmail(request.signer_email, `Please sign: ${request.subject}`, body).catch((err) =>
        logger.error("sign email failed (non-fatal)", err),
      );
    }
    return res.json({ request });
  } catch (e) {
    return handleError(res, e, "Send Request Error");
  }
};
export const voidRequest = async (req: Request, res: Response) => {
  try {
    return res.json({ request: await signing.voidRequest(Number(req.params.id)) });
  } catch (e) {
    return handleError(res, e, "Void Request Error");
  }
};
export const auditTrail = async (req: Request, res: Response) => {
  try {
    return res.json({ events: await signing.getAuditTrail(Number(req.params.id)) });
  } catch (e) {
    return handleError(res, e, "Audit Trail Error");
  }
};
export const listByRef = async (req: Request, res: Response) => {
  try {
    const requests = await signing.listByRefForViewer(
      Number(req.user!.id),
      req.query.ref_kind as string,
      req.query.ref_id as string,
    );
    return res.json({ requests });
  } catch (e) {
    return handleError(res, e, "List By Ref Error");
  }
};

// --- Internal signer (authenticated) ---
export const mySignatures = async (req: Request, res: Response) => {
  try {
    return res.json({ requests: await signing.listForSigner(Number(req.user!.id)) });
  } catch (e) {
    return handleError(res, e, "My Signatures Error");
  }
};
export const myRequestDocument = async (req: Request, res: Response) => {
  try {
    return res.json(
      await signing.getRequestDocumentUrl(Number(req.params.id), Number(req.user!.id)),
    );
  } catch (e) {
    return handleError(res, e, "Get Request Document Error");
  }
};
export const signInternal = async (req: Request, res: Response) => {
  try {
    const result = await signing.signInternal(
      Number(req.params.id),
      Number(req.user!.id),
      req.body.field_values ?? {},
      {
        ip: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
      },
    );
    return res.json(result);
  } catch (e) {
    return handleError(res, e, "Sign Error");
  }
};

// --- External signer (public, token) ---
export const viewByToken = async (req: Request, res: Response) => {
  try {
    const view = await signing.viewByToken(req.params.token);
    if (view.state !== "valid") return res.status(410).json({ state: view.state });
    return res.json(view);
  } catch (e) {
    return handleError(res, e, "View Sign Error");
  }
};
export const tokenDocument = async (req: Request, res: Response) => {
  try {
    const view = await signing.getTokenDocumentUrl(req.params.token);
    if (view.state !== "valid") return res.status(410).json({ state: view.state });
    return res.json({ url: view.url });
  } catch (e) {
    return handleError(res, e, "Get Token Document Error");
  }
};
export const signExternal = async (req: Request, res: Response) => {
  try {
    const result = await signing.signExternal(req.params.token, req.body.field_values ?? {}, {
      ip: req.ip,
      userAgent: req.get("user-agent") ?? undefined,
    });
    if (!result.signed) return res.status(410).json({ state: result.state });
    return res.json({ signed: true });
  } catch (e) {
    return handleError(res, e, "Sign Error");
  }
};
