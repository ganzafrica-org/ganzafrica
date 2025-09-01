import { Router } from "express";
import { opportunityController } from "../controllers/opportunity";
import { validate } from "../middlewares";
import { opportunityValidation } from "../validations/opportunity";

const router: Router = Router();

/**
* @swagger
* tags:
*   name: Opportunities
*   description: Opportunity management endpoints for fellowships and employment positions
*/

// Routes with no parameters
router.get(
  "/",
  opportunityController.listOpportunities
);

router.post(
  "/",
  (req, res, next) => {
    // Dynamically choose validation schema based on opportunity type
    const validationSchema = req.body.type === 'fellowship' 
      ? opportunityValidation.createFellowshipSchema 
      : opportunityValidation.createEmploymentSchema;
    
    validate(validationSchema)(req, res, next);
  },
  opportunityController.createOpportunity
);

// Opportunity routes with ID parameter
router.get(
  "/:id",
  validate(opportunityValidation.getOpportunitySchema),
  opportunityController.getOpportunityById
);

router.put(
  "/:id",
  (req, res, next) => {
    // Get the opportunity type from the request or fetch it
    const validationSchema = req.body.type === 'fellowship' 
      ? opportunityValidation.updateFellowshipSchema 
      : opportunityValidation.updateEmploymentSchema;
    
    validate(validationSchema)(req, res, next);
  },
  opportunityController.updateOpportunity
);

router.delete(
  "/:id",
  validate(opportunityValidation.getOpportunitySchema),
  opportunityController.deleteOpportunity
);

// Opportunity status management routes
router.post(
  "/:id/publish",
  validate(opportunityValidation.getOpportunitySchema),
  opportunityController.publishOpportunity
);

router.post(
  "/:id/close",
  validate(opportunityValidation.getOpportunitySchema),
  opportunityController.closeOpportunity
);

// Application routes related to specific opportunities
router.post(
  "/:id/apply",
  validate(opportunityValidation.applicationSubmissionSchema),
  opportunityController.submitApplication
);

router.get(
  "/:id/applications",
  validate(opportunityValidation.getOpportunitySchema),
  opportunityController.listApplications
);

export default router;