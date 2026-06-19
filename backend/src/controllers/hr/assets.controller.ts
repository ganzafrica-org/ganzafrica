import { Request, Response } from "express";
/**
 * @swagger
 * /hr/assets:
 *   get:
 *     summary: List HR assets
 *     tags: [HR Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: hasIssue
 *         schema:
 *           type: string
 *       - in: query
 *         name: isFlagged
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Assets fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HrAsset'
 *   post:
 *     summary: Create HR asset
 *     tags: [HR Assets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HrAsset'
 *     responses:
 *       201:
 *         description: Asset created
 *
 * /hr/assets/{id}:
 *   get:
 *     summary: Get asset details
 *     tags: [HR Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Asset fetched
 *   patch:
 *     summary: Update asset
 *     tags: [HR Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HrAsset'
 *     responses:
 *       200:
 *         description: Asset updated
 *   delete:
 *     summary: Delete asset
 *     tags: [HR Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Asset deleted
 */
import { constants, Logger } from "../../config";
import { AppError } from "../../middlewares";
import * as assetsService from "../../services/hr/assets.service";

const logger = new Logger("AssetsController");

function handleErrorResponse(error: unknown, res: Response, errorType: string): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: errorType,
      message: error.message,
    });
  } else {
    res.status(500).json({
      error: errorType,
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
}

export const listAssets = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query as {
      assignedTo?: string;
      hasIssue?: assetsService.AssetIssue;
      isFlagged?: boolean;
    };

    const assets = await assetsService.listAssets({
      assignedTo: query.assignedTo,
      hasIssue: query.hasIssue,
      isFlagged: query.isFlagged,
    });

    res.status(200).json(assets);
  } catch (error) {
    logger.error("List assets error", error);
    handleErrorResponse(error, res, "List Assets Error");
  }
};

export const getAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const asset = await assetsService.getAssetById(req.params.id);
    res.status(200).json(asset);
  } catch (error) {
    logger.error("Get asset error", error);
    handleErrorResponse(error, res, "Get Asset Error");
  }
};

export const createAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const asset = await assetsService.createAsset(req.body);
    res.status(201).json(asset);
  } catch (error) {
    logger.error("Create asset error", error);
    handleErrorResponse(error, res, "Create Asset Error");
  }
};

export const updateAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const asset = await assetsService.updateAsset(req.params.id, req.body);
    res.status(200).json(asset);
  } catch (error) {
    logger.error("Update asset error", error);
    handleErrorResponse(error, res, "Update Asset Error");
  }
};

export const deleteAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    await assetsService.deleteAsset(req.params.id);
    res.status(200).json({ message: "Asset deleted successfully" });
  } catch (error) {
    logger.error("Delete asset error", error);
    handleErrorResponse(error, res, "Delete Asset Error");
  }
};
