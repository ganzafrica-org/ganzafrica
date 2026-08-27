import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as c from "../controllers/signing";
import { validate } from "../middlewares";
import * as v from "../validations/signing";

const router: Router = Router();

// External signer pages are public (token-authed). Rate-limit per IP.
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/view/:token", limiter, validate(v.tokenSchema), c.viewByToken);
router.get("/view/:token/document", limiter, validate(v.tokenSchema), c.tokenDocument);
router.post("/submit/:token", limiter, validate(v.signTokenSchema), c.signExternal);

export default router;
