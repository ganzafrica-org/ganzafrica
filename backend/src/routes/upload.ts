// src/routes/upload.ts
import { Router, Request, Response } from "express";
import { publicUpload, getFileSubdirectory, getFileUrl } from "../middlewares/upload";
import { Logger } from "../config";

const logger = new Logger("UploadRoute");
const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: File upload endpoints
 */

/**
 * @swagger
 * /uploads/file:
 *   post:
 *     summary: Upload a single file
 *     tags: [Uploads]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: No file provided
 *       500:
 *         description: Server error
 */
router.post("/file", publicUpload.single("file"), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    // Get file details - multer-s3 provides different properties
    const file = req.file as any; // multer-s3 extends the standard multer file object
    const { key, originalname, size, mimetype, location } = file;

    // Get subdirectory based on file type
    const subdir = getFileSubdirectory(mimetype);

    // Extract filename from the key (removes the uploads/subdir/ prefix)
    const filename = key.split("/").pop();

    // Get the public URL (uses CDN if configured, otherwise direct Spaces URL)
    const fileUrl = getFileUrl(location);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      file: {
        name: originalname,
        filename,
        url: fileUrl,
        path: key, // S3 key acts as the path
        size,
        type: mimetype,
        category: subdir,
      },
    });
  } catch (error) {
    logger.error("Error uploading file", error);
    return res.status(500).json({
      success: false,
      message: "File upload failed",
    });
  }
});

/**
 * @swagger
 * /uploads/files:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Uploads]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *       400:
 *         description: No files provided
 *       500:
 *         description: Server error
 */
router.post("/files", publicUpload.array("files", 10), (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files provided",
      });
    }

    // Process uploaded files - multer-s3 provides different properties
    const files = (req.files as any[]).map((file) => {
      const { key, originalname, size, mimetype, location } = file;

      // Get subdirectory based on file type
      const subdir = getFileSubdirectory(mimetype);

      // Extract filename from the key
      const filename = key.split("/").pop();

      // Get the public URL (uses CDN if configured, otherwise direct Spaces URL)
      const fileUrl = getFileUrl(location);

      return {
        name: originalname,
        filename,
        url: fileUrl,
        path: key, // S3 key acts as the path
        size,
        type: mimetype,
        category: subdir,
      };
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      files,
    });
  } catch (error) {
    logger.error("Error uploading files", error);
    return res.status(500).json({
      success: false,
      message: "Files upload failed",
    });
  }
});

export default router;
