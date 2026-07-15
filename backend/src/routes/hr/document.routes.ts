import { Router } from "express";
import { authenticateHr, enforceHrPasswordPolicy } from "@/middlewares/hr/hr.auth.middleware";
import { validate } from "@/middlewares";
import { requireRole } from "@/middlewares/auth.middleware";
import * as documentController from "../../controllers/hr/document.controller";
import * as documentValidation from "../../validations/hr/document.validation";

const router: Router = Router();

router.use(authenticateHr, enforceHrPasswordPolicy);

router.get("/", validate(documentValidation.listDocumentsSchema), documentController.listDocuments);

router.get(
  "/:id",
  validate(documentValidation.documentIdParamSchema),
  documentController.getDocument,
);

router.get(
  "/:id/download",
  validate(documentValidation.documentIdParamSchema),
  documentController.downloadDocument,
);

router.post(
  "/",
  requireRole("IT", "HR"),
  validate(documentValidation.createDocumentSchema),
  documentController.createDocument,
);

router.patch(
  "/:id",
  validate(documentValidation.updateDocumentSchema),
  documentController.updateDocument,
);

router.delete(
  "/:id",
  validate(documentValidation.documentIdParamSchema),
  documentController.deleteDocument,
);

export default router;
