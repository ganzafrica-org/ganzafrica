import { relations } from "drizzle-orm";
import { users } from "../users";
import { hr_notification_preferences, hr_notifications } from "./notification";

/**
 * The hr_users-based relations were removed with the hr_users retirement (MOD-01). HR tables link
 * to the employees model via their *_employee_id columns; nothing queries those through drizzle's
 * relational API, so no relations are declared for them. Only the notification → users relations
 * remain.
 */
export const usersHrRelations = relations(users, ({ many, one }) => ({
  hrNotifications: many(hr_notifications),
  hrNotificationPreferences: one(hr_notification_preferences),
}));

export const hrNotificationsRelations = relations(hr_notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [hr_notifications.recipient_id],
    references: [users.id],
  }),
}));

export const hrNotificationPreferencesRelations = relations(
  hr_notification_preferences,
  ({ one }) => ({
    user: one(users, {
      fields: [hr_notification_preferences.user_id],
      references: [users.id],
    }),
  }),
);
