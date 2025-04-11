import { Router } from 'express';
import { opportunityController } from '../controllers/opportunity';
import { validate, authenticate, authorize } from '../middlewares';
import { opportunityValidation } from '../validations/opportunity';

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
 *   description: Application management for opportunities
 */

// All routes except application submission require authentication
router.use(['/applications/:id', '/opportunities/:id/applications'], authenticate);

// Opportunity routes
router.post(
    '/',
    authenticate,
    (req, res, next) => {
        // Dynamically choose validation schema based on opportunity type
        const validationSchema = req.body.type === 'fellowship' 
            ? opportunityValidation.createFellowshipSchema 
            : opportunityValidation.createEmploymentSchema;
        
        validate(validationSchema)(req, res, next);
    },
    opportunityController.createOpportunity
);

router.get(
    '/',
    opportunityController.listOpportunities
);

router.get(
    '/:id',
    validate(opportunityValidation.getOpportunitySchema),
    opportunityController.getOpportunityById
);

router.put(
    '/:id',
    authenticate,
    (req, res, next) => {
        // Get the opportunity type from the request or fetch it
        const validationSchema = req.body.type === 'fellowship' 
            ? opportunityValidation.updateFellowshipSchema 
            : opportunityValidation.updateEmploymentSchema;
        
        validate(validationSchema)(req, res, next);
    },
    opportunityController.updateOpportunity
);

router.post(
    '/:id/publish',
    authenticate,
    validate(opportunityValidation.getOpportunitySchema),
    opportunityController.publishOpportunity
);

router.post(
    '/:id/close',
    authenticate,
    validate(opportunityValidation.getOpportunitySchema),
    opportunityController.closeOpportunity
);

router.delete(
    '/:id',
    authenticate,
    validate(opportunityValidation.getOpportunitySchema),
    opportunityController.deleteOpportunity
);

// Application routes
router.post(
    '/:id/apply',
    validate(opportunityValidation.applicationSubmissionSchema),
    opportunityController.submitApplication
);

router.get(
    '/:id/applications',
    authenticate,
    validate(opportunityValidation.getOpportunitySchema),
    opportunityController.listApplications
);

router.get(
    '/applications/:id',
    authenticate,
    opportunityController.getApplicationById
);

router.put(
    '/applications/:id/status',
    authenticate,
    validate(opportunityValidation.updateApplicationStatusSchema),
    opportunityController.updateApplicationStatus
);

router.post(
    '/applications/:id/review',
    authenticate,
    validate(opportunityValidation.applicationReviewSchema),
    opportunityController.submitApplicationReview
);

export default router;