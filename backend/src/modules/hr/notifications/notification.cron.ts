import cron from "node-cron";
import { Logger } from "@/config";
import { scheduleContractExpiryCheck } from "./notification.service";
import { applyCarryOver } from "@/services/hr/leave-core.service";

const logger = new Logger("NotificationCron");

/** Daily contract-expiry reminders, plus the Jan 1 leave carry-over (MOD-06). */
export function startNotificationCron(): void {
  cron.schedule("0 8 * * *", async () => {
    logger.info("[NotificationCron] Running contract expiry check...");
    try {
      await scheduleContractExpiryCheck();
    } catch (error) {
      logger.error("[NotificationCron] Contract expiry check failed", error);
    }
  });

  cron.schedule("30 0 1 1 *", async () => {
    const fromYear = new Date().getUTCFullYear() - 1;
    logger.info(`[NotificationCron] Applying leave carry-over from ${fromYear}...`);
    try {
      const { carried } = await applyCarryOver(fromYear);
      logger.info(`[NotificationCron] Carry-over applied to ${carried} balance(s)`);
    } catch (error) {
      logger.error("[NotificationCron] Leave carry-over failed", error);
    }
  });

  logger.info("HR notification cron scheduled: daily 8:00 AM, leave carry-over Jan 1");
}
