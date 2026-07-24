import { Router } from "express";
import {
  getMentorshipStats,
  getFellows,
  addMentee,
  getMyConnections,
  getConnection,
  updateConnection,
  addGoal,
  updateGoal,
  deleteGoal,
  scheduleSession,
  updateSession,
  deleteSession,
} from "../controllers/mentorship";
import { authenticate, authorize } from "../middlewares";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Mentorship
 *   description: Mentorship connections and session management endpoints
 */

/**
 * @swagger
 * /mentorship/stats:
 *   get:
 *     summary: Get mentorship statistics
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mentorship statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     activeMentorships:
 *                       type: integer
 *                     totalSessions:
 *                       type: integer
 *                     availableFellows:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", authenticate, authorize(["alumni", "admin"]), getMentorshipStats);

/**
 * @swagger
 * /mentorship/fellows:
 *   get:
 *     summary: Get all fellows (potential mentees) with pagination
 *     tags: [Mentorship]
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
 *         description: Search by name or fellow role
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter to only available fellows
 *     responses:
 *       200:
 *         description: List of fellows with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fellows:
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
 *                       email:
 *                         type: string
 *                       fellowRole:
 *                         type: string
 *                       hasMentor:
 *                         type: boolean
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 */
router.get("/fellows", authenticate, authorize(["alumni", "admin"]), getFellows);

/**
 * @swagger
 * /mentorship/add-mentee:
 *   post:
 *     summary: Add a fellow as mentee
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fellowId
 *             properties:
 *               fellowId:
 *                 type: integer
 *                 description: The ID of the fellow to add as mentee
 *     responses:
 *       201:
 *         description: Mentee added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 connection:
 *                   type: object
 *       400:
 *         description: Bad request or fellow already has a mentor
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 *       404:
 *         description: Fellow not found
 */
router.post("/add-mentee", authenticate, authorize(["alumni", "admin"]), addMentee);

/**
 * @swagger
 * /mentorship/connections:
 *   get:
 *     summary: Get current user's mentorship connections
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of mentorship connections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       menteeId:
 *                         type: integer
 *                       menteeName:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [active, completed, paused]
 *                       totalSessions:
 *                         type: integer
 *                       completedSessions:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 */
router.get("/connections", authenticate, authorize(["alumni", "admin"]), getMyConnections);

/**
 * @swagger
 * /mentorship/connections/{id}:
 *   get:
 *     summary: Get single mentorship connection details
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Connection ID
 *     responses:
 *       200:
 *         description: Mentorship connection details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connection:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     mentee:
 *                       type: object
 *                     status:
 *                       type: string
 *                     goals:
 *                       type: array
 *                       items:
 *                         type: object
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 *       404:
 *         description: Connection not found
 */
router.get("/connections/:id", authenticate, authorize(["alumni", "admin"]), getConnection);

/**
 * @swagger
 * /mentorship/connections/{id}:
 *   put:
 *     summary: Update mentorship settings
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Connection ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalSessions:
 *                 type: integer
 *                 description: Target number of sessions
 *               status:
 *                 type: string
 *                 enum: [active, completed, paused]
 *                 description: Mentorship status
 *     responses:
 *       200:
 *         description: Connection updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 *       404:
 *         description: Connection not found
 */
router.put("/connections/:id", authenticate, authorize(["alumni", "admin"]), updateConnection);

/**
 * @swagger
 * /mentorship/connections/{id}/goals:
 *   post:
 *     summary: Add a goal to a mentorship
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Connection ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Goal title
 *               description:
 *                 type: string
 *                 description: Goal description
 *     responses:
 *       201:
 *         description: Goal added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 *       404:
 *         description: Connection not found
 */
router.post("/connections/:id/goals", authenticate, authorize(["alumni", "admin"]), addGoal);

/**
 * @swagger
 * /mentorship/connections/{id}/goals/{goalId}:
 *   put:
 *     summary: Update a goal
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Connection ID
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Goal ID
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
 *               isCompleted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Goal updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 *       404:
 *         description: Goal not found
 */
router.put(
  "/connections/:id/goals/:goalId",
  authenticate,
  authorize(["alumni", "admin"]),
  updateGoal,
);

/**
 * @swagger
 * /mentorship/connections/{id}/goals/{goalId}:
 *   delete:
 *     summary: Delete a goal
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Connection ID
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Goal ID
 *     responses:
 *       200:
 *         description: Goal deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 *       404:
 *         description: Goal not found
 */
router.delete(
  "/connections/:id/goals/:goalId",
  authenticate,
  authorize(["alumni", "admin"]),
  deleteGoal,
);

/**
 * @swagger
 * /mentorship/connections/{id}/sessions:
 *   post:
 *     summary: Schedule a session
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Connection ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scheduledAt
 *             properties:
 *               title:
 *                 type: string
 *                 description: Session title
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 description: Session date and time (ISO string)
 *               durationMinutes:
 *                 type: integer
 *                 default: 60
 *                 description: Duration in minutes
 *               notes:
 *                 type: string
 *                 description: Session notes
 *     responses:
 *       201:
 *         description: Session scheduled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 *       404:
 *         description: Connection not found
 */
router.post(
  "/connections/:id/sessions",
  authenticate,
  authorize(["alumni", "admin"]),
  scheduleSession,
);

/**
 * @swagger
 * /mentorship/connections/{id}/sessions/{sessionId}:
 *   put:
 *     summary: Update a session
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Connection ID
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               durationMinutes:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled]
 *               notes:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Mentee satisfaction rating
 *               feedback:
 *                 type: string
 *                 description: Mentee feedback
 *     responses:
 *       200:
 *         description: Session updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 *       404:
 *         description: Session not found
 */
router.put(
  "/connections/:id/sessions/:sessionId",
  authenticate,
  authorize(["alumni", "admin"]),
  updateSession,
);

/**
 * @swagger
 * /mentorship/connections/{id}/sessions/{sessionId}:
 *   delete:
 *     summary: Delete a session
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Connection ID
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires alumni or admin role
 *       404:
 *         description: Session not found
 */
router.delete(
  "/connections/:id/sessions/:sessionId",
  authenticate,
  authorize(["alumni", "admin"]),
  deleteSession,
);

export default router;
