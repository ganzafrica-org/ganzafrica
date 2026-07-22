import { Request, Response } from "express";
import * as assetsService from "../../services/hr/assets.service";
import { getHrRequester } from "../../utils/hr-requester";

export const listAssets = async (req: Request, res: Response) => {
  const assets = await assetsService.listAssets(req.query);
  res.json({ success: true, data: assets });
};

export const getAsset = async (req: Request, res: Response) => {
  const asset = await assetsService.getAssetById(req.params.id);
  res.json({ success: true, data: asset });
};

export const createAsset = async (req: Request, res: Response) => {
  const asset = await assetsService.createAsset(req.body);
  res.status(201).json({ success: true, data: asset });
};

export const updateAsset = async (req: Request, res: Response) => {
  const asset = await assetsService.updateAsset(req.params.id, req.body);
  res.json({ success: true, data: asset });
};

export const deleteAsset = async (req: Request, res: Response) => {
  await assetsService.deleteAsset(req.params.id);
  res.json({ success: true, message: "Asset deleted successfully" });
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

export const assignAsset = async (req: Request, res: Response) => {
  const requester = await getHrRequester(req);
  const asset = await assetsService.assignAsset(
    req.params.id,
    req.body.employee_id,
    requester.id,
    req.body.notes,
  );
  res.json({ success: true, data: asset });
};

export const returnAsset = async (req: Request, res: Response) => {
  const asset = await assetsService.returnAsset(
    req.params.id,
    req.body.condition,
    req.body.notes ?? "",
    Boolean(req.body.has_issue),
  );
  res.json({ success: true, data: asset });
};

export const getAssetHistory = async (req: Request, res: Response) => {
  const history = await assetsService.getAssetHistory(req.params.id);
  res.json({ success: true, data: history });
};

export const getMyAssets = async (req: Request, res: Response) => {
  const requester = await getHrRequester(req);
  const assets = await assetsService.getEmployeeAssets(requester.id, { open: true });
  res.json({ success: true, data: assets });
};

export const getEmployeeAssets = async (req: Request, res: Response) => {
  const assets = await assetsService.getEmployeeAssets(req.params.id, {
    open: req.query.open === "true",
  });
  res.json({ success: true, data: assets });
};

// Maintenance controllers

export const listMaintenance = async (req: Request, res: Response) => {
  const { assetId } = req.query;
  const maintenance = await assetsService.listAssetMaintenance(assetId as string);
  res.json({ success: true, data: maintenance });
};

export const createMaintenance = async (req: Request, res: Response) => {
  const record = await assetsService.createAssetMaintenance({
    ...req.body,
    maintenanceDate: req.body.maintenanceDate ? new Date(req.body.maintenanceDate) : undefined,
  });
  res.status(201).json({ success: true, data: record });
};

export const updateMaintenance = async (req: Request, res: Response) => {
  const record = await assetsService.updateAssetMaintenance(req.params.id, {
    ...req.body,
    maintenanceDate: req.body.maintenanceDate ? new Date(req.body.maintenanceDate) : undefined,
  });
  res.json({ success: true, data: record });
};

export const deleteMaintenance = async (req: Request, res: Response) => {
  await assetsService.deleteAssetMaintenance(req.params.id);
  res.json({ success: true, message: "Maintenance record deleted successfully" });
};
