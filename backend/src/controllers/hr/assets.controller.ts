import { Request, Response } from "express";
import * as assetsService from "../../services/hr/assets.service";
import { getEmployeeForUser } from "../../services/hr/employee-context";
import { getFileUrl } from "../../middlewares/upload";

// multer-s3 augments each file with `location`/`key` (not part of Express.Multer.File) —
// same shape task.controller.ts's uploadTaskAttachments reads from req.files.
function buildImageInputs(files: unknown, markFirstPrimary: boolean) {
  if (!Array.isArray(files) || files.length === 0) return undefined;
  return (files as any[]).map((file, index) => ({
    url: getFileUrl(file.location),
    storageKey: file.key,
    isPrimary: markFirstPrimary && index === 0,
    sortOrder: index,
  }));
}

export const listAssets = async (req: Request, res: Response) => {
  const assets = await assetsService.listAssets(req.query);
  res.json({ success: true, data: assets });
};

export const getAsset = async (req: Request, res: Response) => {
  const asset = await assetsService.getAssetById(req.params.id);
  res.json({ success: true, data: asset });
};

export const createAsset = async (req: Request, res: Response) => {
  const images = buildImageInputs(req.files, true);
  const asset = await assetsService.createAsset({ ...req.body, images });
  res.status(201).json({ success: true, data: asset });
};

export const updateAsset = async (req: Request, res: Response) => {
  // Appended on update — never auto-marked primary, since the asset may already have one.
  const images = buildImageInputs(req.files, false);
  const asset = await assetsService.updateAsset(req.params.id, { ...req.body, images });
  res.json({ success: true, data: asset });
};

export const deleteAsset = async (req: Request, res: Response) => {
  const result = await assetsService.deleteAsset(req.params.id);
  res.json({
    success: true,
    message: result.disposed
      ? "Asset has assignment history — marked as disposed instead of deleted"
      : "Asset deleted successfully",
  });
};

export const listCategories = async (req: Request, res: Response) => {
  const categories = await assetsService.listAssetCategories();
  res.json({ success: true, data: categories });
};

export const createCategory = async (req: Request, res: Response) => {
  const category = await assetsService.createAssetCategory(req.body);
  res.status(201).json({ success: true, data: category });
};

export const getCategory = async (req: Request, res: Response) => {
  const category = await assetsService.getAssetCategory(req.params.id);
  res.json({ success: true, data: category });
};

export const updateCategory = async (req: Request, res: Response) => {
  const category = await assetsService.updateAssetCategory(req.params.id, req.body);
  res.json({ success: true, data: category });
};

export const deactivateCategory = async (req: Request, res: Response) => {
  await assetsService.deactivateAssetCategory(req.params.id);
  res.json({ success: true, message: "Category deactivated successfully" });
};

export const deleteAssetImage = async (req: Request, res: Response) => {
  const deleted = await assetsService.deleteAssetImage(req.params.imageId);
  res.json({ success: true, data: deleted });
};

// Maintenance controllers

export const listMaintenance = async (req: Request, res: Response) => {
  const { assetId } = req.query;
  const maintenance = await assetsService.listAssetMaintenance(assetId as string);
  res.json({ success: true, data: maintenance });
};

export const createMaintenance = async (req: Request, res: Response) => {
  const record = await assetsService.createAssetMaintenance(req.body);
  res.status(201).json({ success: true, data: record });
};

export const updateMaintenance = async (req: Request, res: Response) => {
  const record = await assetsService.updateAssetMaintenance(req.params.id, req.body);
  res.json({ success: true, data: record });
};

export const deleteMaintenance = async (req: Request, res: Response) => {
  await assetsService.deleteAssetMaintenance(req.params.id);
  res.json({ success: true, message: "Maintenance record deleted successfully" });
};

// ── Assignment / return / flags / history (MOD-04) ──────────────────────────

export const assignAsset = async (req: Request, res: Response) => {
  const asset = await assetsService.assignAsset(req.params.id, {
    employeeId: req.body.employeeId,
    notes: req.body.notes,
    assignedBy: Number(req.user!.id),
  });
  res.json({ success: true, data: asset });
};

export const returnAsset = async (req: Request, res: Response) => {
  const asset = await assetsService.returnAsset(req.params.id, {
    condition: req.body.condition,
    notes: req.body.notes,
    hasIssue: req.body.hasIssue,
  });
  res.json({ success: true, data: asset });
};

export const flagAsset = async (req: Request, res: Response) => {
  const asset = await assetsService.flagAsset(req.params.id, req.body.note);
  res.json({ success: true, data: asset });
};

export const unflagAsset = async (req: Request, res: Response) => {
  const asset = await assetsService.unflagAsset(req.params.id);
  res.json({ success: true, data: asset });
};

export const getAssetHistory = async (req: Request, res: Response) => {
  const history = await assetsService.getAssetHistory(req.params.id);
  res.json({ success: true, data: history });
};

// ── Self-service + LCM-02 gate ──────────────────────────────────────────────

/** GET /hr/me/assets — authenticate-only, same self-service pattern as /hr/employees/me. */
export const getMyAssets = async (req: Request, res: Response) => {
  const { employeeId } = await getEmployeeForUser(Number(req.user!.id));
  const assets = await assetsService.listMyAssets(employeeId);
  res.json({ success: true, data: assets });
};

/** POST /hr/me/assets/:id/report-issue — employee reports an issue on their own asset. */
export const reportAssetIssue = async (req: Request, res: Response) => {
  const { employeeId } = await getEmployeeForUser(Number(req.user!.id));
  const asset = await assetsService.reportAssetIssue(req.params.id, employeeId, req.body.note);
  res.json({ success: true, data: asset });
};

/** GET /hr/employees/:id/assets?open=true — the LCM-02 offboarding gate. */
export const getEmployeeAssets = async (req: Request, res: Response) => {
  const openOnly = req.query.open === "true";
  const rows = await assetsService.getAssetsForEmployee(req.params.id, openOnly);
  res.json({ success: true, data: rows });
};
