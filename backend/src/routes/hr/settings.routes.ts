import { Router } from "express";
import { authenticate, requirePermission } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validation.middleware";
import * as c from "@/controllers/hr/settings.controller";
import * as v from "@/validations/hr/settings.validation";

const router: Router = Router();

const manage = [authenticate, requirePermission("settings:manage")];

router.get("/:key", ...manage, validate(v.settingKeySchema), c.getSetting);
router.put("/:key", ...manage, validate(v.putSettingSchema), c.putSetting);

export default router;
