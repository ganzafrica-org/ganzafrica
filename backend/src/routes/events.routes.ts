import { Router } from "express";
import { authenticate } from "../middlewares";
import {
  getEventStats,
  getAllEvents,
  getEvent,
  toggleRegistration,
} from "../controllers/events";

const router = Router();

/**
 * @swagger
 * /events/stats:
 *   get:
 *     summary: Get events statistics
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Event statistics
 */
router.get("/stats", getEventStats);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events with pagination and filters
 *     tags: [Events]
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
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: myEvents
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of events
 */
router.get("/", getAllEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get a single event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 */
router.get("/:id", getEvent);

/**
 * @swagger
 * /events/{id}/register:
 *   post:
 *     summary: Register or unregister for an event
 *     tags: [Events]
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
 *         description: Registration toggled successfully
 *       400:
 *         description: Event is full or not open
 *       404:
 *         description: Event not found
 */
router.post("/:id/register", authenticate, toggleRegistration);

export default router;
