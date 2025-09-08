import { Router } from 'express';
import { upload } from '../services/upload.service';
import {
  uploadFile,
  uploadFiles,
  deleteFileByUrl,
  getFileDetailsByUrl,
} from '../controllers/upload.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     MediaFile:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: File ID
 *         filename:
 *           type: string
 *           description: Original filename
 *         url:
 *           type: string
 *           description: File URL in Digital Ocean Spaces
 *         mimeType:
 *           type: string
 *           description: File MIME type
 *         size:
 *           type: integer
 *           description: File size in bytes
 *         altText:
 *           type: string
 *           description: Alternative text for accessibility
 *         description:
 *           type: string
 *           description: File description
 *         folder:
 *           type: string
 *           description: Folder/directory in Spaces
 *         uploadedBy:
 *           type: integer
 *           description: ID of user who uploaded the file
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/upload/single:
 *   post:
 *     summary: Upload a single file
 *     tags: [Media]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: File to upload
 *       - in: formData
 *         name: folder
 *         type: string
 *         description: Folder to upload to (default: uploads)
 *       - in: formData
 *         name: alt_text
 *         type: string
 *         description: Alternative text for accessibility
 *       - in: formData
 *         name: description
 *         type: string
 *         description: File description
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MediaFile'
 *       400:
 *         description: No file provided
 *       500:
 *         description: Upload failed
 */
router.post('/single', upload.single('file'), uploadFile);

/**
 * @swagger
 * /api/upload/multiple:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Media]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: files
 *         type: array
 *         items:
 *           type: file
 *         required: true
 *         description: Files to upload
 *       - in: formData
 *         name: folder
 *         type: string
 *         description: Folder to upload to (default: uploads)
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MediaFile'
 */
router.post('/multiple', upload.array('files', 10), uploadFiles);

/**
 * @swagger
 * /api/upload/delete:
 *   post:
 *     summary: Delete file by URL
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: File URL to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         description: URL is required
 *       500:
 *         description: Delete failed
 */
router.post('/delete', deleteFileByUrl);

/**
 * @swagger
 * /api/upload/info:
 *   get:
 *     summary: Get file information by URL
 *     tags: [Media]
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: File URL
 *     responses:
 *       200:
 *         description: File information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     lastModified:
 *                       type: string
 *                       format: date-time
 *                     contentType:
 *                       type: string
 *       400:
 *         description: URL is required
 *       500:
 *         description: Failed to get file info
 */
router.get('/info', getFileDetailsByUrl);

export default router;