"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const opportunity_1 = require("../controllers/opportunity");
const middlewares_1 = require("../middlewares");
const opportunity_2 = require("../validations/opportunity");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Application management for opportunities and general GanzAfrica applications
 */
// Schema for listing all applications
const listAllApplicationsSchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.string().optional(),
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional()
    })
});
// General application routes
router.post("/", (0, middlewares_1.validate)(opportunity_2.opportunityValidation.generalApplicationSchema), opportunity_1.opportunityController.submitGeneralApplication);
router.get("/", (0, middlewares_1.validate)(listAllApplicationsSchema), opportunity_1.opportunityController.listAllApplications);
router.get("/:id", (0, middlewares_1.validate)(opportunity_2.opportunityValidation.getOpportunitySchema), opportunity_1.opportunityController.getApplicationById);
router.put("/:id/status", (0, middlewares_1.validate)(opportunity_2.opportunityValidation.updateApplicationStatusSchema), opportunity_1.opportunityController.updateApplicationStatus);
router.post("/:id/review", (0, middlewares_1.validate)(opportunity_2.opportunityValidation.applicationReviewSchema), opportunity_1.opportunityController.submitApplicationReview);
exports.default = router;
