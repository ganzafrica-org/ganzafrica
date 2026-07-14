import { Router } from "express";
import { validate } from "../../middlewares";
import upload from "../../middlewares/upload";
import * as assetsController from "../../controllers/hr/assets.controller";
import * as assetsValidation from "../../validations/hr/assets.validation";

const router: Router = Router();

// Category routes — mount BEFORE /:id to avoid route shadowing
router.get("/categories", assetsController.listCategories);
router.post("/categories", validate(assetsValidation.createCategorySchema), assetsController.createCategory);
router.get("/categories/:id", validate(assetsValidation.categoryIdParamSchema), assetsController.getCategory);
router.patch("/categories/:id", validate(assetsValidation.updateCategorySchema), assetsController.updateCategory);
router.delete("/categories/:id", validate(assetsValidation.categoryIdParamSchema), assetsController.deactivateCategory);

// Asset routes
router.post("/", upload.array("images", 10), validate(assetsValidation.createAssetSchema), assetsController.createAsset);
router.get("/", validate(assetsValidation.listAssetsSchema), assetsController.listAssets);
router.get("/:id", validate(assetsValidation.assetIdParamSchema), assetsController.getAsset);
router.patch("/:id", upload.array("images", 10), validate(assetsValidation.updateAssetSchema), assetsController.updateAsset);
router.delete("/:id", validate(assetsValidation.assetIdParamSchema), assetsController.deleteAsset);

// Image management
router.delete("/:id/images/:imageId", validate(assetsValidation.deleteAssetImageSchema), assetsController.deleteAssetImage);

// Maintenance routes
router.get("/maintenance", assetsController.listMaintenance);
router.post("/maintenance", validate(assetsValidation.createMaintenanceSchema), assetsController.createMaintenance);
router.patch("/maintenance/:id", validate(assetsValidation.updateMaintenanceSchema), assetsController.updateMaintenance);
router.delete("/maintenance/:id", validate(assetsValidation.maintenanceIdParamSchema), assetsController.deleteMaintenance);

export default router;
