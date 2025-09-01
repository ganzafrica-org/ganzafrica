import { Router } from "express";
import { opportunityController } from "../controllers/opportunity";
import { validate } from "../middlewares";
import { opportunityValidation } from "../validations/opportunity";
import { z } from "zod";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Application management for opportunities and general GanzAfrica applications
 */

// Schema for listing all applications
const listAllApplicationsSchema = z.object({
  query: z.object({
    status: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional()
  })
});

// General application routes
router.post(
  "/",
  validate(opportunityValidation.generalApplicationSchema),
  opportunityController.submitGeneralApplication
);

router.get(
  "/",
  validate(listAllApplicationsSchema),
  opportunityController.listAllApplications
);

router.get(
  "/:id",
  validate(opportunityValidation.getOpportunitySchema),
  opportunityController.getApplicationById
);

router.put(
  "/:id/status",
  validate(opportunityValidation.updateApplicationStatusSchema),
  opportunityController.updateApplicationStatus
);

router.post(
  "/:id/review",
  validate(opportunityValidation.applicationReviewSchema),
  opportunityController.submitApplicationReview
);

router.delete(
  "/:id",
  validate(opportunityValidation.getOpportunitySchema),
  opportunityController.deleteApplication
);

export default router;