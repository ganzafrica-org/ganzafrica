import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import employeeRoutes from "./employee.routes";
import contractRoutes from "./contract.routes";
import assetsRoutes from "./assets.routes";
// import meRoutes from "./me.routes";
import leaveRoutes from "./leave.routes";
import documentRoutes from "./document.routes";
import documentCategoryTemplateRoutes from "./document-category-template.routes";
import helpdeskRoutes from "./helpdesk.routes";
import policyRoutes from "./policy.routes";
import recruitmentRoutes from "./recruitment.routes";
import signingRoutes from "./signing.routes";
import leaveCoreRoutes from "./leave-core.routes";
import processesRoutes from "./processes.routes";
import orgRoutes from "./org.routes";
import notificationRoutes from "../../modules/hr/notifications/notification.routes";

const router = Router();

router.use("/employees", employeeRoutes);
router.use("/employees/:employeeId/contracts", contractRoutes);
// MOD-02: full tree + backfill worklist.
router.use("/org-chart", orgRoutes);
// Self-service: an authenticated employee reads/acts on their own assigned assets at
// /hr/me/assets — authenticate-only, same self-service pattern as /hr/employees/me. No
// assets:* permission grant is required (confirmed by
// tests/integration/assets.test.ts > permissions > "...with no assets:* permission granted");
// ownership/row-scoping is enforced in the service layer (getEmployeeForUser + the employeeId
// match in assetsService.reportAssetIssue), not via requirePermission.
import * as assetsController from "@/controllers/hr/assets.controller";
import * as assetsValidation from "@/validations/hr/assets.validation";
import { validate } from "@/middlewares";
import * as documentController from "@/controllers/hr/document.controller";
import * as contractController from "@/controllers/hr/contract.controller";
router.get("/me/assets", authenticate, assetsController.getMyAssets);
router.post(
  "/me/assets/:id/report-issue",
  authenticate,
  validate(assetsValidation.reportAssetIssueSchema),
  assetsController.reportAssetIssue,
);
// /hr/me/documents — same self-service pattern as /hr/me/assets above: authenticate-only,
// ACL-admitted + own-contract docs scoped in the service layer (listMyDocuments), no
// documents:* permission grant required.
router.get("/me/documents", authenticate, documentController.listMyDocuments);
// /hr/me/contracts — same self-service pattern: contracts:read/manage stay HR-only
// (seed-rbac.ts), an employee reads their own contract(s) scoped by getEmployeeForUser inside
// the controller.
router.get("/me/contracts", authenticate, contractController.getMyContracts);
router.get("/me/contracts/:contractId", authenticate, contractController.getMyContract);
router.use("/assets", assetsRoutes);
// router.use("/me", meRoutes);
router.use("/leaves", leaveRoutes);
router.use("/documents", documentRoutes);
// Additive, standalone v1 entity — see backend/src/db/schema/hr/document-category-template.ts.
// Not nested under /documents/categories since it's deliberately decoupled from hr_documents.
router.use("/document-category-templates", documentCategoryTemplateRoutes);
router.use("/helpdesk", helpdeskRoutes);
router.use("/policies", policyRoutes);
router.use("/signing", signingRoutes);
// Never mounted before this fix — the fully-built controller/service/routes were unreachable
// (404), and the id-resolution bug above would have 400'd every call anyway once mounted.
router.use("/notifications", notificationRoutes);
router.use("/", recruitmentRoutes);
// Must precede the /leave alias below, which would otherwise redirect MOD-06's own /leave/* paths.
router.use("/", leaveCoreRoutes);
router.use("/", processesRoutes);

// One-release redirect aliases for the renamed singular paths.
router.use("/leave", (req, res) =>
  res.redirect(308, `/api/hr/leaves${req.url === "/" ? "" : req.url}`),
);
router.use("/document", (req, res) =>
  res.redirect(308, `/api/hr/documents${req.url === "/" ? "" : req.url}`),
);

export default router;
