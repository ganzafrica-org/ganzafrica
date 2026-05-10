import { Router } from "express";
import { authenticateHr, requireRole, validate } from "@/middlewares";
import * as policyController from "@/controllers/policy.controller";
import * as policyValidation from "@/validations/policy.validation";

const router: Router = Router();

router.use(authenticateHr);

router.get("/", validate(policyValidation.listPoliciesSchema), policyController.listPolicies);
router.get("/:id", validate(policyValidation.policyIdParamSchema), policyController.getPolicy);
router.get("/:id/download", validate(policyValidation.policyIdParamSchema), policyController.downloadPolicy);

router.post(
  "/",
  requireRole("HR"),
  validate(policyValidation.createPolicySchema),
  policyController.createPolicy,
);
router.patch(
  "/:id",
  requireRole("HR"),
  validate(policyValidation.updatePolicySchema),
  policyController.updatePolicy,
);
router.delete(
  "/:id",
  requireRole("HR"),
  validate(policyValidation.policyIdParamSchema),
  policyController.deletePolicy,
);

export default router;

