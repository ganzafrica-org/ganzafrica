import { Router } from "express";
import { validate } from "@/middlewares";
import { authenticate, requirePermission } from "@/middlewares/auth.middleware";
import * as documentController from "../../controllers/hr/document.controller";
import * as documentValidation from "../../validations/hr/document.validation";

const router: Router = Router();

router.use(authenticate);

router.get("/", validate(documentValidation.listDocumentsSchema), documentController.listDocuments);

// Search-in-file. Declared before "/:id" so "search" is not captured as a document id.
router.get(
  "/search",
  validate(documentValidation.searchDocumentsSchema),
  documentController.searchDocuments,
);

// Retention preview (documents due for auto-archiving). Before "/:id" for the same reason.
router.get(
  "/retention/preview",
  requirePermission("documents:manage"),
  documentController.previewRetention,
);

router.get(
  "/:id",
  validate(documentValidation.documentIdParamSchema),
  documentController.getDocument,
);

router.patch(
  "/:id/retention",
  requirePermission("documents:manage"),
  validate(documentValidation.setRetentionSchema),
  documentController.setRetention,
);

router.get(
  "/:id/download",
  validate(documentValidation.documentIdParamSchema),
  documentController.downloadDocument,
);

router.post(
  "/",
  requirePermission("documents:manage"),
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
