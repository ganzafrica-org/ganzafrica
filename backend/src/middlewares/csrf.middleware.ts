import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { constants } from "../config";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Entry points that legitimately arrive without a prior CSRF cookie. Paths are relative to the
// /api mount point (this middleware runs under app.use("/api", ...)).
const EXEMPT = [
  /^\/auth\/login$/,
  /^\/auth\/register$/,
  /^\/auth\/refresh-token$/,
  /^\/auth\/handoff\/exchange$/,
  /^\/auth\/forgot-password$/,
  /^\/auth\/reset-password$/,
  /^\/payslips\/view\//,
  /^\/applications$/,
  /^\/contacts$/,
  /^\/newsletter$/,
];

function issueTokenIfMissing(req: Request, res: Response) {
  if (!req.cookies?.[constants.CSRF_COOKIE_NAME]) {
    const token = crypto.randomBytes(24).toString("base64url");
    res.cookie(constants.CSRF_COOKIE_NAME, token, {
      ...constants.COOKIE_OPTIONS,
      httpOnly: false, // must be readable by the browser to echo in the header
    });
    req.cookies[constants.CSRF_COOKIE_NAME] = token;
  }
}

/** Double-submit CSRF: readable cookie must equal the X-CSRF-Token header on mutating requests. */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  issueTokenIfMissing(req, res);

  if (!MUTATING.has(req.method)) return next();
  if (EXEMPT.some((re) => re.test(req.path))) return next();

  // CSRF only matters when the browser would auto-attach an auth cookie. No auth cookie → nothing
  // to protect; let authentication return 401 instead of masking it with a 403.
  const authCookie =
    req.cookies?.[constants.AUTH_COOKIE_NAME] || req.cookies?.[constants.REFRESH_COOKIE_NAME];
  if (!authCookie) return next();

  const cookieToken = req.cookies?.[constants.CSRF_COOKIE_NAME];
  const headerToken = req.get("X-CSRF-Token");
  if (cookieToken && headerToken && cookieToken === headerToken) return next();

  return res.status(403).json({ error: "Forbidden", message: "CSRF token missing or invalid" });
};
