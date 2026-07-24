import { Router } from "express";
import { authenticate, authorize } from "../middlewares";
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
 *     security:
 *       - bearerAuth: []
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
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 */
router.get("/stats", authenticate, authorize(["alumni", "admin"]), getResourceStats);

/**
 * @swagger
 * /resources:
 *   get:
 *     summary: Get all resources with pagination and filters
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
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
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 */
router.get("/", authenticate, authorize(["alumni", "admin"]), getAllResources);

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Get a single resource
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
 *         description: Resource details
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 *       404:
 *         description: Resource not found
 */
router.get("/:id", authenticate, authorize(["alumni", "admin"]), getResource);

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
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 */
router.post("/", authenticate, authorize(["alumni", "admin"]), createResource);

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
 *         description: Forbidden - not owner or requires alumni/admin role
 *       404:
 *         description: Resource not found
 */
router.put("/:id", authenticate, authorize(["alumni", "admin"]), updateResource);

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
 *         description: Forbidden - not owner or requires alumni/admin role
 *       404:
 *         description: Resource not found
 */
router.delete("/:id", authenticate, authorize(["alumni", "admin"]), deleteResource);

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
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 *       404:
 *         description: Resource not found
 */
router.post("/:id/like", authenticate, authorize(["alumni", "admin"]), toggleLike);

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
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 *       404:
 *         description: Resource not found
 */
router.post("/:id/download", authenticate, authorize(["alumni", "admin"]), trackDownload);

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
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 *       404:
 *         description: Resource not found
 */
router.post("/:id/rate", authenticate, authorize(["alumni", "admin"]), rateResource);

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
 *       403:
 *         description: Forbidden - Requires admin role
 *       404:
 *         description: Resource not found
 */
router.put("/:id/feature", authenticate, authorize(["admin"]), toggleFeatured);

export default router;
