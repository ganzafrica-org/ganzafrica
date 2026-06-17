import { Router } from "express";
import { authenticateHr, enforceHrPasswordPolicy, validate } from "@/middlewares";
import * as notificationController from "./notification.controller";
import * as notificationValidation from "./notification.validation";

const router: Router = Router();

router.use(authenticateHr, enforceHrPasswordPolicy);

router.get(
  "/unread-count",
  notificationController.getUnreadCount,
);
router.patch(
  "/read-all",
  notificationController.markAllNotificationsRead,
);
router.get(
  "/preferences",
  notificationController.getNotificationPreferences,
);
router.patch(
  "/preferences",
  validate(notificationValidation.updatePreferencesBodySchema),
  notificationController.updateNotificationPreferences,
);
router.get(
  "/",
  validate(notificationValidation.getNotificationsQuerySchema),
  notificationController.listNotifications,
);
router.patch(
  "/:id/read",
  validate(notificationValidation.notificationIdParamSchema),
  notificationController.markNotificationRead,
);
router.patch(
  "/:id/archive",
  validate(notificationValidation.notificationIdParamSchema),
  notificationController.archiveNotification,
);

export default router;
