import { Router } from "express";
import { authenticate } from "../middlewares";
import {
  getResourceStats,
  getAllResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  toggleLike,
  trackDownload,
  rateResource,
  toggleFeatured,
} from "../controllers/resources";

const router = Router();

/**
 * @swagger
 * /resources/stats:
 *   get:
 *     summary: Get resources statistics
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: Resource statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalResources:
 *                       type: integer
 *                     featuredResources:
 *                       type: integer
 *                     totalDownloads:
 *                       type: integer
 *                     categoriesCount:
 *                       type: integer
 */
router.get("/stats", getResourceStats);

/**
 * @swagger
 * /resources:
 *   get:
 *     summary: Get all resources with pagination and filters
 *     tags: [Resources]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 15
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, downloads, rating, views]
 *     responses:
 *       200:
 *         description: List of resources
 */
router.get("/", getAllResources);

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Get a single resource
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resource details
 *       404:
 *         description: Resource not found
 */
router.get("/:id", getResource);

/**
 * @swagger
 * /resources:
 *   post:
 *     summary: Create/contribute a new resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - type
 *               - category
 *               - fileUrl
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               category:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *               fileType:
 *                 type: string
 *               fileSize:
 *                 type: string
 *               thumbnailUrl:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               estimatedTime:
 *                 type: string
 *               pages:
 *                 type: integer
 *               duration:
 *                 type: string
 *               externalUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Resource created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, createResource);

/**
 * @swagger
 * /resources/{id}:
 *   put:
 *     summary: Update a resource (owner only)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Resource not found
 */
router.put("/:id", authenticate, updateResource);

/**
 * @swagger
 * /resources/{id}:
 *   delete:
 *     summary: Delete a resource (owner only)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Resource not found
 */
router.delete("/:id", authenticate, deleteResource);

/**
 * @swagger
 * /resources/{id}/like:
 *   post:
 *     summary: Like or unlike a resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *       404:
 *         description: Resource not found
 */
router.post("/:id/like", authenticate, toggleLike);

/**
 * @swagger
 * /resources/{id}/download:
 *   post:
 *     summary: Track a resource download
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Download tracked successfully
 *       404:
 *         description: Resource not found
 */
router.post("/:id/download", authenticate, trackDownload);

/**
 * @swagger
 * /resources/{id}/rate:
 *   post:
 *     summary: Rate a resource (1-5 stars)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               review:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rating added/updated successfully
 *       400:
 *         description: Invalid rating
 *       404:
 *         description: Resource not found
 */
router.post("/:id/rate", authenticate, rateResource);

/**
 * @swagger
 * /resources/{id}/feature:
 *   put:
 *     summary: Feature or unfeature a resource (admin only)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Featured status toggled successfully
 *       404:
 *         description: Resource not found
 */
router.put("/:id/feature", authenticate, toggleFeatured);

export default router;
