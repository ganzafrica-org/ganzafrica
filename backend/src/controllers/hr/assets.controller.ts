import { Request, Response } from "express";
import * as assetsService from "../../services/hr/assets.service";

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
