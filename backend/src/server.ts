import path from "path";

// Resolve the "@/*" path alias in the compiled output. tsc emits the aliases verbatim, so
// without this the built server crashes on the first "@/..." require. Only register it for the
// compiled build (dist/server.js): module-alias hooks Node's resolver globally, and since it
// remaps to dist/ unconditionally, registering it under `tsx watch` too makes any "@/..." import
// that already has a (possibly stale) dist/ counterpart resolve there instead of tsx's own,
// correct, live src/ resolution — silently serving stale compiled code in dev.
if (path.basename(__dirname) === "dist") {
  require("module-alias/register");
}
import app from "./app";
import { env, Logger } from "./config";
import cron from "node-cron";
import { runWeeklyJobTask } from "./services/job-scraper.service";
import { runRetentionSweep } from "./services/hr/document-retention.service";
import { startNotificationCron } from "./modules/hr/notifications/notification.cron";
import { registerOnboardingHooks } from "./services/hr/process.hooks";
import { notifyOverdueTasks } from "./services/hr/process.service";

const logger = new Logger("Server");
const PORT = env.API_PORT || 3002;

// REC-05 hands hires to LCM-01 through this seam; wire it before the first request lands.
registerOnboardingHooks();

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  logger.info(
    `API Documentation available at ${
      env.NODE_ENV === "production"
        ? "https://backend-cbx8.onrender.com/api/docs"
        : `http://localhost:${PORT}/api/docs`
    }`,
  );

  // Schedule weekly job-scraping task - runs every Sunday at 2:00 AM
  cron.schedule("0 2 * * 0", async () => {
    logger.info("Starting scheduled weekly job scraping task...");
    await runWeeklyJobTask();
  });
  logger.info("Job scraping cron scheduled: every Sunday at 2:00 AM");

  // Document retention sweep - runs daily at 3:00 AM. Soft-archives documents past retention
  // (never hard-deletes; legal-hold categories are excluded).
  cron.schedule("0 3 * * *", async () => {
    try {
      const { archived } = await runRetentionSweep();
      logger.info(`Retention sweep complete: ${archived} document(s) archived`);
    } catch (err) {
      logger.error("Retention sweep failed", err as Error);
    }
  });
  logger.info("Document retention sweep cron scheduled: daily at 3:00 AM");

  // HR notifications: contract expiry (daily) + MOD-06 leave carry-over (Jan 1).
  startNotificationCron();

  // Overdue lifecycle tasks - daily at 7:00 AM, before the workday starts.
  cron.schedule("0 7 * * *", async () => {
    try {
      const { notified } = await notifyOverdueTasks();
      if (notified) logger.info(`Overdue task sweep: notified ${notified} assignee(s)`);
    } catch (err) {
      logger.error("Overdue task sweep failed", err as Error);
    }
  });
  logger.info("Overdue lifecycle task cron scheduled: daily at 7:00 AM");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Promise Rejection:", err);
  // In production, we would alert DevOps team

  // Gracefully shutdown the server
  server.close(() => {
    logger.error("Server closed due to unhandled promise rejection");
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception:", err);
  // In production, we would alert DevOps team

  // Gracefully shutdown the server
  server.close(() => {
    logger.error("Server closed due to uncaught exception");
    process.exit(1);
  });
});

// Listen for SIGTERM signal
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
  });
});
