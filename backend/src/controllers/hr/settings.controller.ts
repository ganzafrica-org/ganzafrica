import { Request, Response } from "express";
import * as settingsService from "@/services/hr/settings.service";
import { constants, Logger } from "@/config";
import { AppError } from "@/middlewares";

const logger = new Logger("SettingsController");

function handleError(res: Response, error: unknown, context: string) {
  logger.error(context, error as Error);
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: context, message: error.message });
  }
  return res
    .status(500)
    .json({ error: context, message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
}

export const getSetting = async (req: Request, res: Response) => {
  try {
    const value = await settingsService.getSetting(req.params.key);
    return res.json({ key: req.params.key, value });
  } catch (e) {
    return handleError(res, e, "Get Setting Error");
  }
};

export const putSetting = async (req: Request, res: Response) => {
  try {
    await settingsService.setSetting(req.params.key, req.body.value, Number(req.user!.id));
    return res.json({ key: req.params.key, value: req.body.value });
  } catch (e) {
    return handleError(res, e, "Put Setting Error");
  }
};
