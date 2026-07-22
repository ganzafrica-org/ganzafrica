import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as offersController from "../controllers/offers";
import { validate } from "../middlewares";
import * as offerValidation from "../validations/offers";

const router: Router = Router();

// Candidate-facing offer pages are public (token-authed). Rate-limit per IP.
const offerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again shortly.",
});

router.get(
  "/view/:token",
  offerLimiter,
  validate(offerValidation.tokenSchema),
  offersController.viewOffer,
);
router.post(
  "/respond/:token",
  offerLimiter,
  validate(offerValidation.respondSchema),
  offersController.respondToOffer,
);

export default router;
