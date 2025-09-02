// src/routes/upload.ts
import { Router, Request, Response } from "express";
import upload from "../middlewares/upload";
import env from "../config/env";

const router: Router = Router();

/**
 * Helper function to determine subdirectory based on mimetype
 */
function getFileSubdirectory(mimetype: string): string {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  const allowedDocumentTypes = [
    'application/pdf',                                                      
    'application/msword',                                                   
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  
  if (allowedImageTypes.includes(mimetype)) {
    return "image";
  } else if (allowedVideoTypes.includes(mimetype)) {
    return "video";
  } else if (allowedDocumentTypes.includes(mimetype)) {
    return "document";
  }
  
  return ""; // Default case, should not happen due to file filter
}

// Build public base URL using env or proxy headers as fallback
function getPublicBaseUrl(req: Request): string {
  if (env.API_BASE_URL) {
    return env.API_BASE_URL.replace(/\/$/, "");
  }
  const forwardedProto = (req.headers["x-forwarded-proto"] as string) || req.protocol;
  const forwardedHost = (req.headers["x-forwarded-host"] as string) || (req.headers["host"] as string) || req.get("host") || "";
  const origin = `${forwardedProto}://${forwardedHost}`;
  return origin.replace(/\/$/, "");
}

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
router.post("/file", upload.single("file"), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided"
      });
    }

    // Get file details
    const { filename, originalname, size, mimetype } = req.file;
    
    // Get subdirectory based on file type
    const subdir = getFileSubdirectory(mimetype);
    
    // Build both absolute and relative URLs for robustness
    const relativePath = `/uploads/${subdir}/${filename}`;
    const fileUrl = `${getPublicBaseUrl(req)}${relativePath}`;

    // Generate file URL with subdirectory - prefer configured API_BASE_URL to ensure https
    const base = env.API_BASE_URL || `${req.protocol}://${req.get("host")}`;
    const fileUrl = `${base.replace(/\/$/, '')}/uploads/${subdir}/${filename}`;
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      file: {
        name: originalname,
        filename,
        url: fileUrl,
        path: relativePath,
        size,
        type: mimetype,
        category: subdir // Adding category info can be useful
      }
    });
  } catch (error) {
    console.error("Error uploading file", error);
    return res.status(500).json({
      success: false,
      message: "File upload failed"
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
router.post("/files", upload.array("files", 10), (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files provided"
      });
    }

    // Process uploaded files
    const files = (req.files as Express.Multer.File[]).map(file => {
      // Get subdirectory based on file type
      const subdir = getFileSubdirectory(file.mimetype);
      const relativePath = `/uploads/${subdir}/${file.filename}`;
      const fileUrl = `${getPublicBaseUrl(req)}${relativePath}`;

      const base = env.API_BASE_URL || `${req.protocol}://${req.get("host")}`;
      const fileUrl = `${base.replace(/\/$/, '')}/uploads/${subdir}/${file.filename}`;
      
      return {
        name: file.originalname,
        filename: file.filename,
        url: fileUrl,
        path: relativePath,
        size: file.size,
        type: file.mimetype,
        category: subdir 
      };
    });
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      files
    });
  } catch (error) {
    console.error("Error uploading files", error);
    return res.status(500).json({
      success: false,
      message: "Files upload failed"
    });
  }
});

export default router;