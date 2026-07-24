import { Router } from "express";
import { authenticate, requirePermission } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validation.middleware";
import * as contractController from "@/controllers/hr/contract.controller";
import * as contractValidation from "@/validations/hr/contract.validation";

const router: Router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  "/",
  requirePermission("contracts:manage"),
  validate(contractValidation.createContractSchema),
  contractController.createContract,
);

router.get(
  "/",
  requirePermission("contracts:read"),
  validate(contractValidation.listContractsSchema),
  contractController.listContracts,
);

router.get(
  "/:contractId",
  requirePermission("contracts:read"),
  validate(contractValidation.contractIdParamSchema),
  contractController.getContract,
);

router.patch(
  "/:contractId",
  requirePermission("contracts:manage"),
  validate(contractValidation.updateContractSchema),
  contractController.updateContract,
);

router.delete(
  "/:contractId",
  requirePermission("contracts:manage"),
  validate(contractValidation.contractIdParamSchema),
  contractController.deleteContract,
);

export default router;
