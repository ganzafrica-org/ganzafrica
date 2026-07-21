import { Router } from "express";
import rateLimit from "express-rate-limit";
import { opportunityController } from "../controllers/opportunity";
import * as recruitmentController from "../controllers/recruitment";
import { validate } from "../middlewares";
import { opportunityValidation } from "../validations/opportunity";

const router: Router = Router();

// Pre-submission eligibility probe is public; rate-limit per IP (spec: 20/min/IP).
const eligibilityLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again shortly.",
});

/**
 * @swagger
 * tags:
 *   name: Opportunities
 *   description: Opportunity management endpoints for fellowships and employment positions
 */

// Routes with no parameters
router.get("/", opportunityController.listOpportunities);

router.post(
  "/",
  (req, res, next) => {
    // Dynamically choose validation schema based on opportunity type
    const validationSchema =
      req.body.type === "fellowship"
        ? opportunityValidation.createFellowshipSchema
        : opportunityValidation.createEmploymentSchema;

    validate(validationSchema)(req, res, next);
  },
  opportunityController.createOpportunity,
);

// Opportunity routes with ID parameter
router.get(
  "/:id",
  validate(opportunityValidation.getOpportunitySchema),
  opportunityController.getOpportunityById,
);

router.put(
  "/:id",
  (req, res, next) => {
    // Get the opportunity type from the request or fetch it
    const validationSchema =
      req.body.type === "fellowship"
        ? opportunityValidation.updateFellowshipSchema
        : opportunityValidation.updateEmploymentSchema;

    validate(validationSchema)(req, res, next);
  },
  opportunityController.updateOpportunity,
);

router.delete(
  "/:id",
  validate(opportunityValidation.getOpportunitySchema),
  opportunityController.deleteOpportunity,
);

// Opportunity status management routes
router.post(
  "/:id/publish",
  validate(opportunityValidation.getOpportunitySchema),
  opportunityController.publishOpportunity,
);

router.post(
  "/:id/close",
  validate(opportunityValidation.getOpportunitySchema),
  opportunityController.closeOpportunity,
);

// REC-01 public: form definition + active rules for the client renderer/pre-check.
router.get(
  "/:id/form",
  validate(opportunityValidation.getOpportunitySchema),
  recruitmentController.getPublicForm,
);

// REC-01 public: server-authoritative eligibility probe. Never creates an application row.
router.post(
  "/:id/eligibility-check",
  eligibilityLimiter,
  validate(opportunityValidation.getOpportunitySchema),
  recruitmentController.eligibilityCheck,
);

// Application routes related to specific opportunities
router.post(
  "/:id/apply",
  validate(opportunityValidation.applicationSubmissionSchema),
  opportunityController.submitApplication,
);

router.get(
  "/:id/applications",
  validate(opportunityValidation.getOpportunitySchema),
  opportunityController.listApplications,
);

export default router;
