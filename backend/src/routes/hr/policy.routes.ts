import { Router } from "express";
import { validate } from "@/middlewares";
import * as policyController from "../../controllers/hr/policy.controller";
import * as policyValidation from "../../validations/hr/policy.validation";

const router: Router = Router();

router.get("/", validate(policyValidation.listPoliciesSchema), policyController.listPolicies);
router.get("/:id", validate(policyValidation.policyIdParamSchema), policyController.getPolicy);
router.get("/:id/download", validate(policyValidation.policyIdParamSchema), policyController.downloadPolicy);
router.post("/", validate(policyValidation.createPolicySchema), policyController.createPolicy);
router.patch("/:id", validate(policyValidation.updatePolicySchema), policyController.updatePolicy);
router.delete("/:id", validate(policyValidation.policyIdParamSchema), policyController.deletePolicy);

export default router;
