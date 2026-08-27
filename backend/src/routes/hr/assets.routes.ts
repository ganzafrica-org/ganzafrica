import { Router } from "express";
import { validate, authenticate, requirePermission } from "../../middlewares";
import { publicUpload } from "../../middlewares/upload";
import * as assetsController from "../../controllers/hr/assets.controller";
import * as assetsValidation from "../../validations/hr/assets.validation";

const router: Router = Router();

const read = requirePermission("assets:read", "assets:manage");
const manage = requirePermission("assets:manage");

router.use(authenticate);

// Category routes — mount BEFORE /:id to avoid route shadowing
router.get("/categories", read, assetsController.listCategories);
router.post(
  "/categories",
  manage,
  validate(assetsValidation.createCategorySchema),
  assetsController.createCategory,
);
router.get(
  "/categories/:id",
  read,
  validate(assetsValidation.categoryIdParamSchema),
  assetsController.getCategory,
);
router.patch(
  "/categories/:id",
  manage,
  validate(assetsValidation.updateCategorySchema),
  assetsController.updateCategory,
);
router.delete(
  "/categories/:id",
  manage,
  validate(assetsValidation.categoryIdParamSchema),
  assetsController.deactivateCategory,
);

// Maintenance routes — mount BEFORE /:id to avoid route shadowing (same reason as
// categories above: /:id would otherwise swallow GET/POST /maintenance with id="maintenance").
router.get("/maintenance", read, assetsController.listMaintenance);
router.post(
  "/maintenance",
  manage,
  validate(assetsValidation.createMaintenanceSchema),
  assetsController.createMaintenance,
);
router.patch(
  "/maintenance/:id",
  manage,
  validate(assetsValidation.updateMaintenanceSchema),
  assetsController.updateMaintenance,
);
router.delete(
  "/maintenance/:id",
  manage,
  validate(assetsValidation.maintenanceIdParamSchema),
  assetsController.deleteMaintenance,
);

// Asset routes
router.post(
  "/",
  manage,
  publicUpload.array("images", 10),
  validate(assetsValidation.createAssetSchema),
  assetsController.createAsset,
);
router.get("/", read, validate(assetsValidation.listAssetsSchema), assetsController.listAssets);
router.get("/:id", read, validate(assetsValidation.assetIdParamSchema), assetsController.getAsset);
router.patch(
  "/:id",
  manage,
  publicUpload.array("images", 10),
  validate(assetsValidation.updateAssetSchema),
  assetsController.updateAsset,
);
router.delete(
  "/:id",
  manage,
  validate(assetsValidation.assetIdParamSchema),
  assetsController.deleteAsset,
);

// Image management
router.delete(
  "/:id/images/:imageId",
  manage,
  validate(assetsValidation.deleteAssetImageSchema),
  assetsController.deleteAssetImage,
);

// Assignment / return / flags / history (MOD-04 §4)
router.post(
  "/:id/assign",
  manage,
  validate(assetsValidation.assignAssetSchema),
  assetsController.assignAsset,
);
router.post(
  "/:id/return",
  manage,
  validate(assetsValidation.returnAssetSchema),
  assetsController.returnAsset,
);
router.post(
  "/:id/flag",
  manage,
  validate(assetsValidation.flagAssetSchema),
  assetsController.flagAsset,
);
router.post(
  "/:id/unflag",
  manage,
  validate(assetsValidation.assetIdParamSchema),
  assetsController.unflagAsset,
);
router.get(
  "/:id/history",
  read,
  validate(assetsValidation.assetIdParamSchema),
  assetsController.getAssetHistory,
);

export default router;
