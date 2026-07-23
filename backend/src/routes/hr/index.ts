import { Router } from "express";
import employeeRoutes from "./employee.routes";
import contractRoutes from "./contract.routes";
import assetsRoutes from "./assets.routes";
import leaveRoutes from "./leave.routes";
import documentRoutes from "./document.routes";
import helpdeskRoutes from "./helpdesk.routes";
import policyRoutes from "./policy.routes";
import recruitmentRoutes from "./recruitment.routes";
import signingRoutes from "./signing.routes";
import leaveCoreRoutes from "./leave-core.routes";
import processesRoutes from "./processes.routes";

const router = Router();

router.use("/employees", employeeRoutes);
router.use("/employees/:employeeId/contracts", contractRoutes);
router.use("/assets", assetsRoutes);
router.use("/leaves", leaveRoutes);
router.use("/documents", documentRoutes);
router.use("/helpdesk", helpdeskRoutes);
router.use("/policies", policyRoutes);
router.use("/signing", signingRoutes);
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
