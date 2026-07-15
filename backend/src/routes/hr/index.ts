import { Router } from "express";
import employeeRoutes from "./employee.routes";
import contractRoutes from "./contract.routes";
import assetsRoutes from "./assets.routes";
import leaveRoutes from "./leave.routes";
import documentRoutes from "./document.routes";
import helpdeskRoutes from "./helpdesk.routes";
import policyRoutes from "./policy.routes";

const router = Router();

router.use("/employees", employeeRoutes);
router.use("/employees/:employeeId/contracts", contractRoutes);
router.use("/assets", assetsRoutes);
router.use("/leaves", leaveRoutes);
router.use("/documents", documentRoutes);
router.use("/helpdesk", helpdeskRoutes);
router.use("/policies", policyRoutes);

// One-release redirect aliases for the renamed singular paths.
router.use("/leave", (req, res) =>
  res.redirect(308, `/api/hr/leaves${req.url === "/" ? "" : req.url}`),
);
router.use("/document", (req, res) =>
  res.redirect(308, `/api/hr/documents${req.url === "/" ? "" : req.url}`),
);

export default router;
