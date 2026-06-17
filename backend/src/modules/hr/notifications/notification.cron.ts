import cron from "node-cron";
import { Logger } from "@/config";
import { scheduleContractExpiryCheck } from "./notification.service";

const logger = new Logger("NotificationCron");

/** Runs every day at 8:00 AM — contract expiry reminders. */
export function startNotificationCron(): void {
  cron.schedule("0 8 * * *", async () => {
    logger.info("[NotificationCron] Running contract expiry check...");
    try {
      await scheduleContractExpiryCheck();
    } catch (error) {
      logger.error("[NotificationCron] Contract expiry check failed", error);
    }
  });
  logger.info("HR notification cron scheduled: daily at 8:00 AM");
}
