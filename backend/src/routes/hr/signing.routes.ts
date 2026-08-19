import { Router } from "express";
import { authenticate, requirePermission } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validation.middleware";
import * as c from "@/controllers/signing";
import * as v from "@/validations/signing";

const router: Router = Router();

const manage = [authenticate, requirePermission("signing:manage", "documents:manage")];

// Templates
router.get("/templates", ...manage, c.listTemplates);
router.post("/templates", ...manage, validate(v.createTemplateSchema), c.createTemplate);
router.get("/templates/:id", ...manage, validate(v.idSchema), c.getTemplate);
router.post("/templates/:id/fields", ...manage, validate(v.addFieldSchema), c.addField);
router.delete(
  "/templates/:id/fields/:fieldId",
  ...manage,
  validate(v.fieldIdSchema),
  c.removeField,
);

// Requests
router.post("/requests", ...manage, validate(v.createRequestSchema), c.createRequest);
router.post("/requests/:id/send", ...manage, validate(v.idSchema), c.sendRequest);
router.post("/requests/:id/void", ...manage, validate(v.idSchema), c.voidRequest);
router.get("/requests/:id/audit", ...manage, validate(v.idSchema), c.auditTrail);
// Whole signer sequence for a reference (e.g. a contract). Ownership, not a bare permission:
// HR/admin see any sequence; anyone else only one they're a signer on (enforced in the service).
router.get("/requests", authenticate, validate(v.listByRefSchema), c.listByRef);

// Internal signer — any authenticated user sees + signs their own requests.
router.get("/my", authenticate, c.mySignatures);
router.post("/my/:id/sign", authenticate, validate(v.signSchema), c.signInternal);

export default router;
