import { Request, Response } from "express";
import * as offersService from "../services/recruitment/offers.service";
import { sendApplicantEmail } from "../services/recruitment/pipeline.service";
import { sendEmail } from "../services/email.service";
import { getPresignedDownload } from "../services/storage.service";
import { offerEmail, welcomeEmail } from "../services/recruitment/offer-emails";
import { sendPasswordReset } from "../services/auth.service";
import { db } from "../db/client";
import { applications } from "../db/schema/opportunities";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "../middlewares";
import { constants, Logger } from "../config";

const logger = new Logger("OffersController");

function handleError(res: Response, error: unknown, context: string) {
  logger.error(context, error as Error);
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: context, message: error.message });
  }
  return res
    .status(500)
    .json({ error: context, message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
}

// --- HR (recruitment:manage) ---

export const createOffer = async (req: Request, res: Response) => {
  try {
    const offer = await offersService.createOffer(
      Number(req.params.id),
      req.body,
      Number(req.user!.id),
    );
    return res.status(201).json({ offer });
  } catch (error) {
    return handleError(res, error, "Create Offer Error");
  }
};

export const getOfferForApplication = async (req: Request, res: Response) => {
  try {
    const offer = await offersService.getOfferByApplication(Number(req.params.id));
    return res.json({ offer });
  } catch (error) {
    return handleError(res, error, "Get Offer Error");
  }
};

export const updateOffer = async (req: Request, res: Response) => {
  try {
    const offer = await offersService.updateOffer(Number(req.params.offerId), req.body);
    return res.json({ offer });
  } catch (error) {
    return handleError(res, error, "Update Offer Error");
  }
};

export const setLetter = async (req: Request, res: Response) => {
  try {
    const offer = await offersService.setLetterKey(
      Number(req.params.offerId),
      req.body.letter_file_key,
    );
    return res.json({ offer });
  } catch (error) {
    return handleError(res, error, "Set Letter Error");
  }
};

export const sendOffer = async (req: Request, res: Response) => {
  try {
    const { offer, link } = await offersService.sendOffer(Number(req.params.offerId));
    // Email the candidate the acceptance link (post-commit).
    const [app] = await db
      .select({ email: applications.email, first_name: applications.first_name })
      .from(applications)
      .where(eq(applications.id, offer.application_id))
      .limit(1);
    if (app) {
      const { subject, html } = offerEmail({
        firstName: app.first_name,
        positionTitle: offer.position_title,
        link,
        expiresAt: offer.expires_at,
      });
      await sendEmail(app.email, subject, html).catch((e) => logger.error("offer email failed", e));
      await sendApplicantEmail(offer.application_id, "offer").catch(() => {});
    }
    return res.json({ offer });
  } catch (error) {
    return handleError(res, error, "Send Offer Error");
  }
};

export const withdrawOffer = async (req: Request, res: Response) => {
  try {
    const offer = await offersService.withdrawOffer(Number(req.params.offerId));
    return res.json({ offer });
  } catch (error) {
    return handleError(res, error, "Withdraw Offer Error");
  }
};

// --- Public (token) ---

export const viewOffer = async (req: Request, res: Response) => {
  try {
    const view = await offersService.viewOfferByToken(req.params.token);
    if (view.state !== "valid") {
      return res.status(410).json({ state: view.state });
    }
    let letterUrl: string | null = null;
    if (view.offer?.letter_file_key) {
      letterUrl = await getPresignedDownload(view.offer.letter_file_key, 300).catch(() => null);
    }
    // Omit the raw storage key from the candidate payload — they get a presigned URL instead.
    const { letter_file_key: _key, ...safe } = view.offer!;
    void _key;
    return res.json({ state: "valid", offer: safe, letter_url: letterUrl });
  } catch (error) {
    return handleError(res, error, "View Offer Error");
  }
};

export const respondToOffer = async (req: Request, res: Response) => {
  try {
    const decision = req.body.decision as "accept" | "decline";
    const result = await offersService.respondToOffer(
      req.params.token,
      decision,
      req.body.decline_reason,
    );

    if (!result.ok) {
      return res.status(410).json({ state: result.state });
    }
    if (result.decision === "decline") {
      return res.json({ decision: "decline" });
    }

    // Post-commit: welcome email + (for brand-new accounts) the set-password invite.
    await sendWelcome(result.userId, result.invited, req.ip).catch((e) =>
      logger.error("welcome/invite email failed (non-fatal)", e),
    );
    return res.json({ decision: "accept" });
  } catch (error) {
    return handleError(res, error, "Respond Offer Error");
  }
};

async function sendWelcome(userId: number, invited: boolean, ip?: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return;
  const { subject, html } = welcomeEmail({
    firstName: user.name.split(" ")[0] || user.name,
    positionTitle: "your new role",
  });
  await sendEmail(user.email, subject, html);
  if (invited) {
    // Reuse the password-reset machinery — it mints a token and emails the set-password link.
    await sendPasswordReset(userId, user.email, ip ?? "0.0.0.0").catch(() => {});
  }
}
