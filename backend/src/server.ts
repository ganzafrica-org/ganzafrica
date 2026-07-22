// Resolve the "@/*" path alias in the compiled output. tsc emits the aliases
// verbatim, so without this the built server crashes on the first "@/..." require.
// Dev (tsx) resolves them natively; this line is what makes `node dist/server.js` work.
import "module-alias/register";
import app from "./app";
import { env, Logger } from "./config";
import cron from "node-cron";
import { runWeeklyJobTask } from "./services/job-scraper.service";

const logger = new Logger("Server");
const PORT = env.API_PORT || 3002;

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
