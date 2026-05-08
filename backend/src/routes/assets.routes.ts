import { Router } from "express";
import { authenticate, requireRole, validate } from "@/middlewares";
import * as assetsController from "@/controllers/assets.controller";
import * as assetsValidation from "@/validations/assets.validation";

const router: Router = Router();

router.use(authenticate, requireRole("IT"));

router.get("/", validate(assetsValidation.listAssetsSchema), assetsController.listAssets);
router.get("/export", validate(assetsValidation.listAssetsSchema), assetsController.exportAssets);
router.get("/:id", validate(assetsValidation.assetIdParamSchema), assetsController.getAsset);
router.post("/", validate(assetsValidation.createAssetSchema), assetsController.createAsset);
router.patch("/:id", validate(assetsValidation.updateAssetSchema), assetsController.updateAsset);
router.delete("/:id", validate(assetsValidation.assetIdParamSchema), assetsController.deleteAsset);
router.patch("/:id/assign", validate(assetsValidation.assignAssetSchema), assetsController.assignAsset);
router.patch("/:id/flag", validate(assetsValidation.assetIdParamSchema), assetsController.toggleFlag);

export default router;

