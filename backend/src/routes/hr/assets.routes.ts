import { Router } from "express";
import { validate } from "../../middlewares";
import * as assetsController from "../../controllers/hr/assets.controller";
import * as assetsValidation from "../../validations/hr/assets.validation";

const router: Router = Router();

router.post("/", validate(assetsValidation.createAssetSchema), assetsController.createAsset);
router.get("/", validate(assetsValidation.listAssetsSchema), assetsController.listAssets);
router.get("/:id", validate(assetsValidation.assetIdParamSchema), assetsController.getAsset);
router.patch("/:id", validate(assetsValidation.updateAssetSchema), assetsController.updateAsset);
router.delete("/:id", validate(assetsValidation.assetIdParamSchema), assetsController.deleteAsset);

export default router;
