import { Router } from "express";
import hrAuthRoutes from "./auth.routes";
import employeeRoutes from "./employee.routes";
import contractRoutes from "./contract.routes";
import assetsRoutes from "./assets.routes";
import leaveRoutes from "./leave.routes";
import documentRoutes from "./document.routes";
import helpdeskRoutes from "./helpdesk.routes";
import policyRoutes from "./policy.routes";

const router = Router();

router.use("/auth", hrAuthRoutes);
router.use("/employees", employeeRoutes);
router.use("/employees/:employeeId/contracts", contractRoutes);
router.use("/assets", assetsRoutes);
router.use("/leave", leaveRoutes);
router.use("/document", documentRoutes);
router.use("/helpdesk", helpdeskRoutes);
router.use("/policies", policyRoutes);

export default router;
