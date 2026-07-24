import { Router } from "express";
import {
  getJobStats,
  getTrendingSkills,
  getAllJobs,
  getJob,
  createJob,
  triggerJobScraping,
} from "../controllers/jobs";
import { authenticate, authorize } from "../middlewares";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job opportunities endpoints
 */

/**
 * @swagger
 * /jobs/stats:
 *   get:
 *     summary: Get job opportunities statistics
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Job statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalJobs:
 *                       type: integer
 *                     remoteJobs:
 *                       type: integer
 *                     internalJobs:
 *                       type: integer
 */
router.get("/stats", authenticate, authorize(["alumni", "admin"]), getJobStats);

/**
 * @swagger
 * /jobs/trending-skills:
 *   get:
 *     summary: Get trending skills across all jobs
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of trending skills
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       skill:
 *                         type: string
 *                       count:
 *                         type: integer
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 */
router.get("/trending-skills", authenticate, authorize(["alumni", "admin"]), getTrendingSkills);

/**
 * @swagger
 * /jobs/scrape:
 *   post:
 *     summary: Manually trigger job scraping
 *     description: Triggers the job scraping process that fetches jobs from ReliefWeb, Devex, and BrighterMonday. Also cleans up expired jobs. Use this endpoint for testing the scraper.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Scraping completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Job scraping completed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 *       500:
 *         description: Scraping failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.post("/scrape", authenticate, authorize(["alumni", "admin"]), triggerJobScraping);

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all job opportunities with pagination and filters
 *     tags: [Jobs]
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
 *         description: Search by title, company, or description
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filter by sector
 *       - in: query
 *         name: job_type
 *         schema:
 *           type: string
 *         description: Filter by job type
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: remote
 *         schema:
 *           type: boolean
 *         description: Filter remote only
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [internal, scraped]
 *         description: Filter by source
 *       - in: query
 *         name: experience_level
 *         schema:
 *           type: string
 *         description: Filter by experience level
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, salary-high, salary-low, company, views]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of jobs with pagination
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 */
router.get("/", authenticate, authorize(["alumni", "admin"]), getAllJobs);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get single job opportunity
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 *       404:
 *         description: Job not found
 */
router.get("/:id", authenticate, authorize(["alumni", "admin"]), getJob);

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Create a job opportunity
 *     tags: [Jobs]
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
 *               - company
 *               - sector
 *             properties:
 *               title:
 *                 type: string
 *               company:
 *                 type: string
 *               sector:
 *                 type: string
 *               location:
 *                 type: string
 *               jobType:
 *                 type: string
 *               isRemote:
 *                 type: boolean
 *               salaryMin:
 *                 type: integer
 *               salaryMax:
 *                 type: integer
 *               salaryCurrency:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               experienceLevel:
 *                 type: string
 *               applicationUrl:
 *                 type: string
 *               deadline:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job created successfully
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 */
router.post("/", authenticate, authorize(["alumni", "admin"]), createJob);

export default router;
