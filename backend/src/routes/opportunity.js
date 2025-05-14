"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const opportunity_1 = require("../controllers/opportunity");
const middlewares_1 = require("../middlewares");
const opportunity_2 = require("../validations/opportunity");
const router = (0, express_1.Router)();
/**
* @swagger
* tags:
*   name: Opportunities
*   description: Opportunity management endpoints for fellowships and employment positions
*/
// Routes with no parameters
router.get("/", opportunity_1.opportunityController.listOpportunities);
router.post("/", (req, res, next) => {
    // Dynamically choose validation schema based on opportunity type
    const validationSchema = req.body.type === 'fellowship'
        ? opportunity_2.opportunityValidation.createFellowshipSchema
        : opportunity_2.opportunityValidation.createEmploymentSchema;
    (0, middlewares_1.validate)(validationSchema)(req, res, next);
}, opportunity_1.opportunityController.createOpportunity);
// Opportunity routes with ID parameter
router.get("/:id", (0, middlewares_1.validate)(opportunity_2.opportunityValidation.getOpportunitySchema), opportunity_1.opportunityController.getOpportunityById);
router.put("/:id", (req, res, next) => {
    // Get the opportunity type from the request or fetch it
    const validationSchema = req.body.type === 'fellowship'
        ? opportunity_2.opportunityValidation.updateFellowshipSchema
        : opportunity_2.opportunityValidation.updateEmploymentSchema;
    (0, middlewares_1.validate)(validationSchema)(req, res, next);
}, opportunity_1.opportunityController.updateOpportunity);
router.delete("/:id", (0, middlewares_1.validate)(opportunity_2.opportunityValidation.getOpportunitySchema), opportunity_1.opportunityController.deleteOpportunity);
// Opportunity status management routes
router.post("/:id/publish", (0, middlewares_1.validate)(opportunity_2.opportunityValidation.getOpportunitySchema), opportunity_1.opportunityController.publishOpportunity);
router.post("/:id/close", (0, middlewares_1.validate)(opportunity_2.opportunityValidation.getOpportunitySchema), opportunity_1.opportunityController.closeOpportunity);
// Application routes related to specific opportunities
router.post("/:id/apply", (0, middlewares_1.validate)(opportunity_2.opportunityValidation.applicationSubmissionSchema), opportunity_1.opportunityController.submitApplication);
router.get("/:id/applications", (0, middlewares_1.validate)(opportunity_2.opportunityValidation.getOpportunitySchema), opportunity_1.opportunityController.listApplications);
exports.default = router;
