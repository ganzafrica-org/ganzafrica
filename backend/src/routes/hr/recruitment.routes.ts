import { Router } from "express";
import { authenticate, requirePermission } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validation.middleware";
import * as recruitmentController from "@/controllers/recruitment";
import * as recruitmentValidation from "@/validations/recruitment";
import * as pipelineController from "@/controllers/recruitment-pipeline";
import * as pipelineValidation from "@/validations/recruitment-pipeline";
import * as offersController from "@/controllers/offers";
import * as offerValidation from "@/validations/offers";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: HR Recruitment
 *   description: Application form builder + eligibility rule management
 */

// authenticate is applied per-route (not router-wide) so this router only claims its own paths
// and never intercepts sibling /hr/* routes mounted alongside it.
const guard = [authenticate, requirePermission("recruitment:manage")];
// Read-level guard (HR + director). Lists are readable; mutations stay manage-only.
const readGuard = [authenticate, requirePermission("recruitment:read", "recruitment:manage")];

// Form builder (draft read/write + publish).
router.get(
  "/opportunities/:id/form",
  ...guard,
  validate(recruitmentValidation.idParamSchema),
  recruitmentController.getForm,
);

router.put(
  "/opportunities/:id/form",
  ...guard,
  validate(recruitmentValidation.putFormSchema),
  recruitmentController.putForm,
);

router.put(
  "/opportunities/:id/form/publish",
  ...guard,
  validate(recruitmentValidation.idParamSchema),
  recruitmentController.publishForm,
);

// Eligibility rule CRUD.
router.get(
  "/opportunities/:id/rules",
  ...guard,
  validate(recruitmentValidation.idParamSchema),
  recruitmentController.listRules,
);

router.post(
  "/opportunities/:id/rules",
  ...guard,
  validate(recruitmentValidation.createRuleSchema),
  recruitmentController.createRule,
);

router.patch(
  "/opportunities/:id/rules/:ruleId",
  ...guard,
  validate(recruitmentValidation.patchRuleSchema),
  recruitmentController.patchRule,
);

router.delete(
  "/opportunities/:id/rules/:ruleId",
  ...guard,
  validate(recruitmentValidation.deleteRuleSchema),
  recruitmentController.deleteRule,
);

// --- REC-02 pipeline ---

// Lists readable by director (recruitment:read); everything else is manage-only.
router.get("/recruitment/opportunities", ...readGuard, pipelineController.listOpportunities);
router.get("/recruitment/applications", ...readGuard, pipelineController.listApplications);
router.get(
  "/recruitment/applications/:id",
  ...readGuard,
  validate(pipelineValidation.idParamSchema),
  pipelineController.getApplication,
);

router.get(
  "/recruitment/opportunities/:id/funnel",
  ...readGuard,
  validate(pipelineValidation.idParamSchema),
  pipelineController.getFunnel,
);

router.post(
  "/recruitment/applications/:id/transition",
  ...guard,
  validate(pipelineValidation.transitionSchema),
  pipelineController.transition,
);
router.post(
  "/recruitment/applications/:id/rescreen",
  ...guard,
  validate(pipelineValidation.idParamSchema),
  pipelineController.rescreen,
);

// Screening rules CRUD.
router.get(
  "/recruitment/opportunities/:id/screening-rules",
  ...guard,
  validate(pipelineValidation.idParamSchema),
  pipelineController.listScreeningRules,
);
router.post(
  "/recruitment/opportunities/:id/screening-rules",
  ...guard,
  validate(pipelineValidation.createScreeningRuleSchema),
  pipelineController.createScreeningRule,
);
router.patch(
  "/recruitment/opportunities/:id/screening-rules/:ruleId",
  ...guard,
  validate(pipelineValidation.patchScreeningRuleSchema),
  pipelineController.patchScreeningRule,
);
router.delete(
  "/recruitment/opportunities/:id/screening-rules/:ruleId",
  ...guard,
  validate(pipelineValidation.screeningRuleIdSchema),
  pipelineController.deleteScreeningRule,
);

// Evaluation criteria CRUD.
router.get(
  "/recruitment/opportunities/:id/criteria",
  ...guard,
  validate(pipelineValidation.idParamSchema),
  pipelineController.listCriteria,
);
router.post(
  "/recruitment/opportunities/:id/criteria",
  ...guard,
  validate(pipelineValidation.createCriterionSchema),
  pipelineController.createCriterion,
);
router.patch(
  "/recruitment/opportunities/:id/criteria/:criterionId",
  ...guard,
  validate(pipelineValidation.patchCriterionSchema),
  pipelineController.patchCriterion,
);
router.delete(
  "/recruitment/opportunities/:id/criteria/:criterionId",
  ...guard,
  validate(pipelineValidation.criterionIdSchema),
  pipelineController.deleteCriterion,
);

// Reviewers (recruitment:read) upsert their OWN scores; the service keys on reviewer id.
router.put(
  "/recruitment/applications/:id/scores",
  ...readGuard,
  validate(pipelineValidation.putScoresSchema),
  pipelineController.putScores,
);

// --- REC-07 CV ranking ---
router.get(
  "/recruitment/opportunities/:id/ranking-criteria",
  ...guard,
  validate(pipelineValidation.idParamSchema),
  pipelineController.listRankingCriteria,
);
router.post(
  "/recruitment/opportunities/:id/ranking-criteria",
  ...guard,
  validate(pipelineValidation.createRankingCriterionSchema),
  pipelineController.createRankingCriterion,
);
router.patch(
  "/recruitment/opportunities/:id/ranking-criteria/:criterionId",
  ...guard,
  validate(pipelineValidation.patchRankingCriterionSchema),
  pipelineController.patchRankingCriterion,
);
router.delete(
  "/recruitment/opportunities/:id/ranking-criteria/:criterionId",
  ...guard,
  validate(pipelineValidation.rankingCriterionIdSchema),
  pipelineController.deleteRankingCriterion,
);
router.post(
  "/recruitment/opportunities/:id/rescore",
  ...guard,
  validate(pipelineValidation.idParamSchema),
  pipelineController.rescoreOpportunity,
);
router.get(
  "/recruitment/opportunities/:id/ranked",
  ...readGuard,
  validate(pipelineValidation.idParamSchema),
  pipelineController.rankedApplications,
);

// --- REC-06 reviewers + interview notes + close-out ---
router.get(
  "/recruitment/applications/:id/reviewers",
  ...readGuard,
  validate(pipelineValidation.idParamSchema),
  pipelineController.listReviewers,
);
router.post(
  "/recruitment/applications/:id/reviewers",
  ...guard,
  validate(pipelineValidation.assignReviewerSchema),
  pipelineController.assignReviewer,
);
router.delete(
  "/recruitment/applications/:id/reviewers/:reviewerId",
  ...guard,
  validate(pipelineValidation.reviewerIdSchema),
  pipelineController.removeReviewer,
);
router.get(
  "/recruitment/applications/:id/notes",
  ...readGuard,
  validate(pipelineValidation.idParamSchema),
  pipelineController.listNotes,
);
router.post(
  "/recruitment/applications/:id/notes",
  ...readGuard,
  validate(pipelineValidation.addNoteSchema),
  pipelineController.addNote,
);
router.get(
  "/recruitment/opportunities/:id/close-out",
  ...guard,
  validate(pipelineValidation.idParamSchema),
  pipelineController.closeOutPreview,
);
router.post(
  "/recruitment/opportunities/:id/close-out",
  ...guard,
  validate(pipelineValidation.closeOutSchema),
  pipelineController.closeOutRemaining,
);

// --- REC-05 offers (recruitment:manage) ---
router.get(
  "/recruitment/applications/:id/offer",
  ...readGuard,
  validate(offerValidation.applicationIdSchema),
  offersController.getOfferForApplication,
);
router.post(
  "/recruitment/applications/:id/offer",
  ...guard,
  validate(offerValidation.createOfferSchema),
  offersController.createOffer,
);
router.patch(
  "/offers/:offerId",
  ...guard,
  validate(offerValidation.updateOfferSchema),
  offersController.updateOffer,
);
router.post(
  "/offers/:offerId/letter",
  ...guard,
  validate(offerValidation.setLetterSchema),
  offersController.setLetter,
);
router.post(
  "/offers/:offerId/send",
  ...guard,
  validate(offerValidation.offerIdSchema),
  offersController.sendOffer,
);
router.post(
  "/offers/:offerId/withdraw",
  ...guard,
  validate(offerValidation.offerIdSchema),
  offersController.withdrawOffer,
);

export default router;
