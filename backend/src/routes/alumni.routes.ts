import { Router } from "express";
import {
  getAlumniStats,
  getAllAlumni,
  getAlumniProfile,
  updateAlumniProfile,
  getDashboardStats,
} from "../controllers/alumni";
import { authenticate } from "../middlewares";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Alumni
 *   description: Alumni directory and profile management endpoints
 */

/**
 * @swagger
 * /alumni/stats:
 *   get:
 *     summary: Get alumni directory statistics
 *     tags: [Alumni]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alumni statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalAlumni:
 *                       type: integer
 *                     countries:
 *                       type: integer
 *                     industries:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", authenticate, getAlumniStats);

/**
 * @swagger
 * /alumni/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Alumni]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     myMentorshipPairs:
 *                       type: integer
 *                     upcomingEvents:
 *                       type: integer
 *                     jobPostings:
 *                       type: integer
 *                     achievements:
 *                       type: integer
 */
router.get("/dashboard/stats", authenticate, getDashboardStats);

/**
 * @swagger
 * /alumni/profile:
 *   get:
 *     summary: Get current user's alumni profile
 *     tags: [Alumni]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's alumni profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     company:
 *                       type: string
 *                     title:
 *                       type: string
 *                     country:
 *                       type: string
 *                     industry:
 *                       type: string
 *                     graduationYear:
 *                       type: integer
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                     linkedinUrl:
 *                       type: string
 *                     twitterUrl:
 *                       type: string
 *                     websiteUrl:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.get("/profile", authenticate, getAlumniProfile);

/**
 * @swagger
 * /alumni/profile:
 *   put:
 *     summary: Update current user's alumni profile
 *     tags: [Alumni]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               company:
 *                 type: string
 *               title:
 *                 type: string
 *               country:
 *                 type: string
 *               industry:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               linkedinUrl:
 *                 type: string
 *               twitterUrl:
 *                 type: string
 *               websiteUrl:
 *                 type: string
 *               isAvailableForMentoring:
 *                 type: boolean
 *               isOpenToOpportunities:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.put("/profile", authenticate, updateAlumniProfile);

/**
 * @swagger
 * /alumni:
 *   get:
 *     summary: Get all alumni with pagination and filters
 *     tags: [Alumni]
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
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter by industry
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: integer
 *         description: Filter by graduation year
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, company, title, or skills
 *     responses:
 *       200:
 *         description: List of alumni with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alumni:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       company:
 *                         type: string
 *                       title:
 *                         type: string
 *                       country:
 *                         type: string
 *                       industry:
 *                         type: string
 *                       graduationYear:
 *                         type: integer
 *                       skills:
 *                         type: array
 *                         items:
 *                           type: string
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
 *                     countries:
 *                       type: array
 *                       items:
 *                         type: string
 *                     industries:
 *                       type: array
 *                       items:
 *                         type: string
 *                     graduationYears:
 *                       type: array
 *                       items:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, getAllAlumni);

export default router;
