import { Router } from "express";
import { validate } from "@/middlewares";
import { authenticate, requirePermission } from "@/middlewares/auth.middleware";
import { privateUpload } from "@/middlewares/upload";
import * as documentController from "../../controllers/hr/document.controller";
import * as documentValidation from "../../validations/hr/document.validation";

const router: Router = Router();

const read = requirePermission("documents:read", "documents:manage");
const manage = requirePermission("documents:manage");

router.use(authenticate);

router.get(
  "/",
  read,
  validate(documentValidation.listDocumentsSchema),
  documentController.listDocuments,
);

// Search-in-file. Declared before "/:id" so "search" is not captured as a document id.
router.get(
  "/search",
  read,
  validate(documentValidation.searchDocumentsSchema),
  documentController.searchDocuments,
);

// Retention preview (documents due for auto-archiving). Before "/:id" for the same reason.
router.get("/retention/preview", manage, documentController.previewRetention);

router.get(
  "/:id",
  read,
  validate(documentValidation.documentIdParamSchema),
  documentController.getDocument,
);

router.patch(
  "/:id/retention",
  manage,
  validate(documentValidation.setRetentionSchema),
  documentController.setRetention,
);

router.get(
  "/:id/download",
  read,
  validate(documentValidation.documentIdParamSchema),
  documentController.downloadDocument,
);

router.get(
  "/:id/view-url",
  read,
  validate(documentValidation.documentIdParamSchema),
  documentController.getDocumentViewUrl,
);

router.get(
  "/:id/content",
  read,
  validate(documentValidation.documentIdParamSchema),
  documentController.getDocumentContent,
);

router.post(
  "/",
  manage,
  privateUpload.single("file"),
  validate(documentValidation.createDocumentSchema),
  documentController.createDocument,
);

router.patch(
  "/:id",
  manage,
  privateUpload.single("file"),
  validate(documentValidation.updateDocumentSchema),
  documentController.updateDocument,
);

router.delete(
  "/:id",
  manage,
  validate(documentValidation.documentIdParamSchema),
  documentController.deleteDocument,
);

export default router;
