import { Router } from "express";
import { validate, authenticate, requirePermission } from "@/middlewares";
import * as policyController from "../../controllers/hr/policy.controller";
import * as policyValidation from "../../validations/hr/policy.validation";

const router: Router = Router();

const read = requirePermission("policies:read", "policies:manage");
const manage = requirePermission("policies:manage");

router.use(authenticate);

router.get("/", read, validate(policyValidation.listPoliciesSchema), policyController.listPolicies);
router.get(
  "/:id",
  read,
  validate(policyValidation.policyIdParamSchema),
  policyController.getPolicy,
);
router.get(
  "/:id/download",
  read,
  validate(policyValidation.policyIdParamSchema),
  policyController.downloadPolicy,
);
router.get(
  "/:id/acknowledgements",
  read,
  validate(policyValidation.policyIdParamSchema),
  policyController.getAcknowledgementReport,
);
router.post(
  "/",
  manage,
  validate(policyValidation.createPolicySchema),
  policyController.createPolicy,
);
router.post(
  "/:id/publish",
  manage,
  validate(policyValidation.policyIdParamSchema),
  policyController.publishPolicy,
);
router.post(
  "/:id/acknowledge",
  read,
  validate(policyValidation.policyIdParamSchema),
  policyController.acknowledgePolicy,
);
router.patch(
  "/:id",
  manage,
  validate(policyValidation.updatePolicySchema),
  policyController.updatePolicy,
);
router.delete(
  "/:id",
  manage,
  validate(policyValidation.policyIdParamSchema),
  policyController.deletePolicy,
);

export default router;
