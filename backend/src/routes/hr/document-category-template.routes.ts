import { Router } from "express";
import { validate, authenticate, requirePermission } from "../../middlewares";
import * as documentCategoryTemplateController from "../../controllers/hr/document-category-template.controller";
import * as documentCategoryTemplateValidation from "../../validations/hr/document-category-template.validation";

const router: Router = Router();

// Same permission as the rest of the documents module (backend/src/routes/hr/document.routes.ts)
// — these category *templates* are additive HR-only CRUD, not a new permission surface.
const read = requirePermission("documents:read", "documents:manage");
const manage = requirePermission("documents:manage");

router.use(authenticate);

router.get("/", read, documentCategoryTemplateController.listDocumentCategoryTemplates);

router.post(
  "/",
  manage,
  validate(documentCategoryTemplateValidation.createDocumentCategoryTemplateSchema),
  documentCategoryTemplateController.createDocumentCategoryTemplate,
);

router.get(
  "/:id",
  read,
  validate(documentCategoryTemplateValidation.documentCategoryTemplateIdParamSchema),
  documentCategoryTemplateController.getDocumentCategoryTemplate,
);

router.patch(
  "/:id",
  manage,
  validate(documentCategoryTemplateValidation.updateDocumentCategoryTemplateSchema),
  documentCategoryTemplateController.updateDocumentCategoryTemplate,
);

router.delete(
  "/:id",
  manage,
  validate(documentCategoryTemplateValidation.documentCategoryTemplateIdParamSchema),
  documentCategoryTemplateController.deleteDocumentCategoryTemplate,
);

export default router;
