import { Router } from "express";
import * as googleCalendarController from "../controllers/google-calendar.controller";
import { authenticate } from "../middlewares";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Google Calendar
 *   description: Google Calendar integration endpoints
 */

// Google Calendar routes
router.get("/auth-url", authenticate, googleCalendarController.getAuthUrl);
// Callback route is public (Google redirects here)
router.get("/callback", googleCalendarController.handleCallback);
router.get("/status", authenticate, googleCalendarController.getConnectionStatus);
router.get("/events", authenticate, googleCalendarController.getEvents);
router.post("/disconnect", authenticate, googleCalendarController.disconnect);

export default router;

