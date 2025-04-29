import { Router } from "express";
import { opportunityController } from "../controllers/opportunity";
import { validate } from "../middlewares";
import { opportunityValidation } from "../validations/opportunity";
import { z } from "zod";

const router: Router = Router();

/**
* @swagger
* tags:
*   name: Opportunities
*   description: Opportunity management endpoints for fellowships and employment positions
*/

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

// =====================================================
// IMPORTANT: Order matters in Express routing!
// More specific routes must come before generic ones
// =====================================================

// All routes were previously authenticated
// router.use(authenticate);

// 1. First, define general application routes
router.post(
    "/applications",
    validate(opportunityValidation.generalApplicationSchema),
    opportunityController.submitGeneralApplication
  );

router.get(
 "/applications",
 validate(listAllApplicationsSchema),
 opportunityController.listAllApplications
);

router.get(
 "/applications/:id",
 validate(opportunityValidation.getOpportunitySchema),
 opportunityController.getApplicationById
);

router.put(
 "/applications/:id/status",
 validate(opportunityValidation.updateApplicationStatusSchema),
 opportunityController.updateApplicationStatus
);

router.post(
 "/applications/:id/review",
 validate(opportunityValidation.applicationReviewSchema),
 opportunityController.submitApplicationReview
);

// 2. Define opportunity routes

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

// 3. Opportunity routes with ID parameter
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

// 4. Opportunity status management routes
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

// 5. Application routes related to specific opportunities
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