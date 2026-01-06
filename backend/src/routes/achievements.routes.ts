import { Router } from "express";
import {
  getAchievementStats,
  getAllAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  toggleLike,
  addComment,
  deleteComment,
} from "../controllers/achievements";
import { authenticate, authorize } from "../middlewares";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Achievements
 *   description: Alumni achievements endpoints
 */

/**
 * @swagger
 * /achievements/stats:
 *   get:
 *     summary: Get achievements statistics
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Achievement statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalAchievements:
 *                       type: integer
 *                     myAchievements:
 *                       type: integer
 *                     categoriesCount:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/stats",
  authenticate,
  authorize(["alumni", "admin"]),
  getAchievementStats,
);

/**
 * @swagger
 * /achievements:
 *   get:
 *     summary: Get all achievements with pagination and filters
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 15
 *         description: Items per page (max 50)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title, description, or organization
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Recognition, Professional, Business Milestone, Academic, Competition, Community]
 *         description: Filter by category
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by type (Award, Funding, Publication, etc.)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, most-liked, most-viewed]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of achievements with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 achievements:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       type:
 *                         type: string
 *                       date:
 *                         type: string
 *                       organization:
 *                         type: string
 *                       location:
 *                         type: string
 *                       link:
 *                         type: string
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                       views:
 *                         type: integer
 *                       likes:
 *                         type: integer
 *                       comments:
 *                         type: integer
 *                       achiever:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalCount:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *                 filters:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                     types:
 *                       type: array
 *                       items:
 *                         type: string
 *                     years:
 *                       type: array
 *                       items:
 *                         type: integer
 */
router.get(
  "/",
  authenticate,
  authorize(["alumni", "admin"]),
  getAllAchievements,
);

/**
 * @swagger
 * /achievements/{id}:
 *   get:
 *     summary: Get single achievement with comments
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Achievement ID
 *     responses:
 *       200:
 *         description: Achievement details with comments
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 *       404:
 *         description: Achievement not found
 */
router.get(
  "/:id",
  authenticate,
  authorize(["alumni", "admin"]),
  getAchievement,
);

/**
 * @swagger
 * /achievements:
 *   post:
 *     summary: Share a new achievement
 *     tags: [Achievements]
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
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [Recognition, Professional, Business Milestone, Academic, Competition, Community]
 *               type:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               organization:
 *                 type: string
 *               location:
 *                 type: string
 *               link:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Achievement created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 */
router.post(
  "/",
  authenticate,
  authorize(["alumni", "admin"]),
  createAchievement,
);

/**
 * @swagger
 * /achievements/{id}:
 *   put:
 *     summary: Update an achievement (owner only)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Achievement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               type:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               organization:
 *                 type: string
 *               location:
 *                 type: string
 *               link:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Achievement updated successfully
 *       403:
 *         description: Forbidden - not owner or requires alumni/admin role
 *       404:
 *         description: Achievement not found
 */
router.put(
  "/:id",
  authenticate,
  authorize(["alumni", "admin"]),
  updateAchievement,
);

/**
 * @swagger
 * /achievements/{id}:
 *   delete:
 *     summary: Delete an achievement (owner only)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Achievement ID
 *     responses:
 *       200:
 *         description: Achievement deleted successfully
 *       403:
 *         description: Forbidden - not owner or requires alumni/admin role
 *       404:
 *         description: Achievement not found
 */
router.delete(
  "/:id",
  authenticate,
  authorize(["alumni", "admin"]),
  deleteAchievement,
);

/**
 * @swagger
 * /achievements/{id}/like:
 *   post:
 *     summary: Like or unlike an achievement
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Achievement ID
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 *                 likes:
 *                   type: integer
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 *       404:
 *         description: Achievement not found
 */
router.post(
  "/:id/like",
  authenticate,
  authorize(["alumni", "admin"]),
  toggleLike,
);

/**
 * @swagger
 * /achievements/{id}/comments:
 *   post:
 *     summary: Add a comment to an achievement
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Achievement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Content is required
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 *       404:
 *         description: Achievement not found
 */
router.post(
  "/:id/comments",
  authenticate,
  authorize(["alumni", "admin"]),
  addComment,
);

/**
 * @swagger
 * /achievements/{id}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment (owner only)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Achievement ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       403:
 *         description: Forbidden - not owner or requires alumni/admin role
 *       404:
 *         description: Comment not found
 */
router.delete(
  "/:id/comments/:commentId",
  authenticate,
  authorize(["alumni", "admin"]),
  deleteComment,
);

export default router;
