"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/upload.ts
const express_1 = require("express");
const upload_1 = __importDefault(require("../middlewares/upload"));
const router = (0, express_1.Router)();
/**
 * Helper function to determine subdirectory based on mimetype
 */
function getFileSubdirectory(mimetype) {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const allowedDocumentTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedImageTypes.includes(mimetype)) {
        return "image";
    }
    else if (allowedVideoTypes.includes(mimetype)) {
        return "video";
    }
    else if (allowedDocumentTypes.includes(mimetype)) {
        return "document";
    }
    return ""; // Default case, should not happen due to file filter
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
router.post("/file", upload_1.default.single("file"), (req, res) => {
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
        // Generate file URL with subdirectory
        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${subdir}/${filename}`;
        // Return success response
        return res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            file: {
                name: originalname,
                filename,
                url: fileUrl,
                size,
                type: mimetype,
                category: subdir // Adding category info can be useful
            }
        });
    }
    catch (error) {
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
router.post("/files", upload_1.default.array("files", 10), (req, res) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files provided"
            });
        }
        // Process uploaded files
        const files = req.files.map(file => {
            // Get subdirectory based on file type
            const subdir = getFileSubdirectory(file.mimetype);
            // Generate file URL with subdirectory
            const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${subdir}/${file.filename}`;
            return {
                name: file.originalname,
                filename: file.filename,
                url: fileUrl,
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
    }
    catch (error) {
        console.error("Error uploading files", error);
        return res.status(500).json({
            success: false,
            message: "Files upload failed"
        });
    }
});
exports.default = router;
