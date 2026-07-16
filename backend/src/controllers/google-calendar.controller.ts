import { Request, Response } from "express";
import { AppError } from "../middlewares";
import * as googleCalendarService from "../services/google-calendar.service";
import Logger from "../config/logger";

const logger = new Logger("GoogleCalendarController");

/**
 * @swagger
 * /google-calendar/auth-url:
 *   get:
 *     summary: Get Google Calendar OAuth URL
 *     tags: [Google Calendar]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OAuth URL generated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getAuthUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw new AppError("User not authenticated", 401);
    }

    // Use the logged-in user's email to pre-select their Google account
    const userEmail = req.user?.email;
    if (!userEmail) {
      logger.warn(`No email found for user ${req.user.id}`);
    }
    const authUrl = googleCalendarService.getGoogleCalendarAuthUrl(req.user.id, userEmail);

    logger.info(
      `Generating Google Calendar auth URL for user ${req.user.id} with email ${userEmail || "none"}`,
    );

    res.json({
      success: true,
      authUrl,
    });
  } catch (error: unknown) {
    logger.error("Error getting Google Calendar auth URL:", error);

    // Check if it's an AppError
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
      return;
    }

    // Handle regular Error or other errors
    const errorMessage =
      error instanceof Error ? error.message : "Failed to get Google Calendar auth URL";
    logger.error("Error details:", errorMessage);

    // Check if it's a configuration error
    if (errorMessage.includes("not configured")) {
      res.status(500).json({
        success: false,
        error: "Google Calendar is not configured. Please contact administrator.",
        message: errorMessage,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Failed to get Google Calendar auth URL",
      message: errorMessage,
    });
  }
};

/**
 * @swagger
 * /google-calendar/callback:
 *   get:
 *     summary: Handle Google Calendar OAuth callback
 *     tags: [Google Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Google Calendar connected successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const handleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, state, error: oauthError } = req.query;

    // Check if Google returned an error
    if (oauthError) {
      logger.error("Google OAuth error:", oauthError);
      const taskUrl = process.env.TASK_URL || "http://localhost:3003";
      res.redirect(
        `${taskUrl}/calendar?error=google_auth_failed&message=${encodeURIComponent(String(oauthError))}`,
      );
      return;
    }

    if (!code || typeof code !== "string") {
      logger.error("Authorization code is missing");
      throw new AppError("Authorization code is required", 400);
    }

    if (!state || typeof state !== "string") {
      logger.error("State parameter is missing");
      throw new AppError("State parameter is required", 400);
    }

    // Decode state to get userId
    let userId: string;
    try {
      const decodedState = JSON.parse(Buffer.from(state, "base64").toString());
      userId = decodedState.userId;
      logger.info(`Processing Google Calendar callback for user: ${userId}`);
    } catch (decodeError) {
      logger.error("Error decoding state parameter:", decodeError);
      throw new AppError("Invalid state parameter", 400);
    }

    // Note: We trust the userId from the state parameter since it was encoded by us
    // In production, you might want to add additional validation or use a signed state
    await googleCalendarService.exchangeGoogleCalendarCode(code, userId);

    logger.info(`Google Calendar connected successfully for user: ${userId}`);

    // Redirect back to calendar page (task app runs on port 3003)
    const taskUrl = process.env.TASK_URL || "http://localhost:3003";
    res.redirect(`${taskUrl}/calendar?google_calendar_connected=true`);
  } catch (error) {
    logger.error("Error handling Google Calendar callback:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error details:", errorMessage);
    const taskUrl = process.env.TASK_URL || "http://localhost:3003";
    res.redirect(
      `${taskUrl}/calendar?error=google_auth_failed&message=${encodeURIComponent(errorMessage)}`,
    );
  }
};

/**
 * @swagger
 * /google-calendar/status:
 *   get:
 *     summary: Check Google Calendar connection status
 *     tags: [Google Calendar]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Connection status retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getConnectionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw new AppError("User not authenticated", 401);
    }

    const { userIds } = req.query;

    // If userIds provided, check status for multiple users
    if (userIds && typeof userIds === "string") {
      const userIdArray = userIds.split(",").filter((id) => id.trim());
      const connectedIds = await googleCalendarService.getConnectedUserIds(userIdArray);

      res.json({
        success: true,
        connected: connectedIds.length > 0,
        connectedUserIds: connectedIds,
      });
      return;
    }

    // Single user (default behavior)
    const connected = await googleCalendarService.isGoogleCalendarConnected(req.user.id);

    res.json({
      success: true,
      connected,
    });
  } catch (error) {
    logger.error("Error getting Google Calendar connection status:", error);
    handleErrorResponse(error, res, "Failed to get connection status");
  }
};

/**
 * @swagger
 * /google-calendar/events:
 *   get:
 *     summary: Get Google Calendar events for a date range
 *     tags: [Google Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeMin
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: timeMax
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Events retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw new AppError("User not authenticated", 401);
    }

    const { timeMin, timeMax, userIds } = req.query;

    if (!timeMin || typeof timeMin !== "string" || !timeMax || typeof timeMax !== "string") {
      throw new AppError("timeMin and timeMax are required", 400);
    }

    // If userIds is provided (for managers viewing multiple users), fetch events for all users
    if (userIds && typeof userIds === "string") {
      const userIdArray = userIds.split(",").filter((id) => id.trim());
      logger.info(`Getting Google Calendar events for multiple users: ${userIdArray.join(", ")}`, {
        timeMin,
        timeMax,
      });

      const results = await googleCalendarService.getGoogleCalendarEventsForUsers(
        userIdArray,
        timeMin,
        timeMax,
      );

      // Flatten all events into a single array with userId attached
      const allEvents: any[] = [];
      results.forEach(({ userId, events }) => {
        events.forEach((event) => {
          allEvents.push({
            ...event,
            userId: userId,
          });
        });
      });

      logger.info(`Returning ${allEvents.length} events for ${userIdArray.length} users`);

      res.json({
        success: true,
        events: allEvents,
      });
      return;
    }

    // Single user (default behavior)
    logger.info(`Getting Google Calendar events for user ${req.user.id}`, {
      timeMin,
      timeMax,
    });

    const events = await googleCalendarService.getGoogleCalendarEvents(
      req.user.id,
      timeMin,
      timeMax,
    );

    logger.info(`Returning ${events.length} events to user ${req.user.id}`);

    res.json({
      success: true,
      events,
    });
  } catch (error) {
    logger.error("Error getting Google Calendar events:", error);
    handleErrorResponse(error, res, "Failed to get Google Calendar events");
  }
};

/**
 * @swagger
 * /google-calendar/disconnect:
 *   post:
 *     summary: Disconnect Google Calendar
 *     tags: [Google Calendar]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Google Calendar disconnected successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const disconnect = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw new AppError("User not authenticated", 401);
    }

    await googleCalendarService.disconnectGoogleCalendar(req.user.id);

    res.json({
      success: true,
      message: "Google Calendar disconnected successfully",
    });
  } catch (error) {
    logger.error("Error disconnecting Google Calendar:", error);
    handleErrorResponse(error, res, "Failed to disconnect Google Calendar");
  }
};

// Helper function for error handling
const handleErrorResponse = (error: unknown, res: Response, defaultMessage: string): void => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
  } else {
    logger.error(defaultMessage, error);
    res.status(500).json({
      success: false,
      error: defaultMessage,
    });
  }
};
