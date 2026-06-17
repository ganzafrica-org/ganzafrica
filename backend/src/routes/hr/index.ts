import { Router } from "express";
import hrAuthRoutes from "./auth.routes";
import employeeRoutes from "./employee.routes";
import assetsRoutes from "./assets.routes";
import leaveRoutes from "./leave.routes";
import policyRoutes from "./policy.routes";
import helpdeskRoutes from "./helpdesk.routes";

const router = Router();

router.use("/auth", hrAuthRoutes);
router.use("/employees", employeeRoutes);
router.use("/assets", assetsRoutes);
router.use("/leave", leaveRoutes);
router.use("/policy", policyRoutes);
router.use("/helpdesk", helpdeskRoutes);

export default router;
