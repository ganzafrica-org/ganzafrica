import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import * as payslipTokenService from "../services/hr/payslip-token.service";
import * as pdfService from "../services/hr/pdf.service";
import { Logger } from "../config";

const logger = new Logger("PayslipView");
const router: Router = Router();

// Public endpoint — the token is the credential. Rate-limit per IP to blunt guessing.
const viewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again shortly.",
});

/** Branded "link no longer valid" page. Identical for expired/revoked/not-found (no oracle). */
function gonePage(res: Response) {
  res.status(410).type("html").send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Payslip link unavailable</title></head>
<body style="margin:0;font-family:Arial,sans-serif;background:#f9f9f9;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:#045F3C;padding:20px;text-align:center;">
      <h1 style="color:#fff;margin:0;">GanzAfrica</h1>
    </div>
    <div style="padding:40px 30px;color:#333;">
      <h2 style="color:#045F3C;">This payslip link is no longer valid</h2>
      <p style="font-size:16px;line-height:1.6;">
        The link has expired or been revoked. Please contact the HR department at
        <a href="mailto:info@ganzafrica.org" style="color:#045F3C;">info@ganzafrica.org</a>
        to request a new payslip link.
      </p>
    </div>
  </div>
</body></html>`);
}

router.get("/view/:token", viewLimiter, async (req: Request, res: Response) => {
  const result = await payslipTokenService.redeemPayslipToken(req.params.token);
  if (!result.ok) {
    return gonePage(res);
  }
  try {
    const signedUrl = await pdfService.generateSignedPayslipUrl(result.payslipKey, 300); // 5 min
    return res.redirect(302, signedUrl);
  } catch (err) {
    logger.error("Failed to presign payslip on redeem:", err);
    return gonePage(res);
  }
});

export default router;
