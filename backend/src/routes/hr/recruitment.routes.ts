import { Router } from "express";
import { authenticate, requirePermission } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validation.middleware";
import * as recruitmentController from "@/controllers/recruitment";
import * as recruitmentValidation from "@/validations/recruitment";

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

export default router;
