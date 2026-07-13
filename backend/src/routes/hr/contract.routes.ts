import { Router } from "express";
import { authenticateHr, enforceHrPasswordPolicy } from "@/middlewares/hr/hr.auth.middleware";
import { requireRole } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validation.middleware";
import * as contractController from "@/controllers/hr/contract.controller";
import * as contractValidation from "@/validations/hr/contract.validation";

const router: Router = Router({ mergeParams: true });

router.use(authenticateHr, enforceHrPasswordPolicy);

router.post(
  "/",
  requireRole("HR"),
  validate(contractValidation.createContractSchema),
  contractController.createContract
);

router.get(
  "/",
  requireRole("HR", "IT"),
  validate(contractValidation.listContractsSchema),
  contractController.listContracts
);

router.get(
  "/:contractId",
  requireRole("HR", "IT"),
  validate(contractValidation.contractIdParamSchema),
  contractController.getContract

);

router.patch(
  "/:contractId",
  requireRole("HR"),
  validate(contractValidation.updateContractSchema),
  contractController.updateContract
);

router.delete(
  "/:contractId",
  requireRole("HR"),
  validate(contractValidation.contractIdParamSchema),
  contractController.deleteContract
);

export default router;
