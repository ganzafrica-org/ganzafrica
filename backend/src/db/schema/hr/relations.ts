import { relations } from "drizzle-orm";
import { users } from "../users";
import { hr_assets } from "./assets";
import { hr_contracts } from "./contract";
import { hr_otps, hr_users } from "./employee";
import { hr_helpdesk_tickets } from "./helpdesk";
import { hr_leaves } from "./leave";
import { hr_notification_preferences, hr_notifications } from "./notification";
import { hr_documents } from "./document";

export const hrUsersRelations = relations(hr_users, ({ one, many }) => ({
  platformUser: one(users, {
    fields: [hr_users.platform_user_id],
    references: [users.id],
  }),
  createdOtps: many(hr_otps, { relationName: "created_otps" }),
  contracts: many(hr_contracts),
  leaves: many(hr_leaves, { relationName: "employee_leaves" }),
  reviewedLeaves: many(hr_leaves, { relationName: "reviewed_leaves" }),
  submittedTickets: many(hr_helpdesk_tickets, { relationName: "submitted_tickets" }),
  assignedTickets: many(hr_helpdesk_tickets, { relationName: "assigned_tickets" }),
  assignedAssets: many(hr_assets),
  policiesCreated: many(hr_documents),
}));

export const usersHrRelations = relations(users, ({ one, many }) => ({
  hrEmployee: one(hr_users, {
    fields: [users.id],
    references: [hr_users.platform_user_id],
  }),
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

export const hrOtpsRelations = relations(hr_otps, ({ one }) => ({
  createdBy: one(hr_users, {
    fields: [hr_otps.created_by_id],
    references: [hr_users.id],
    relationName: "created_otps",
  }),
}));

export const hrContractsRelations = relations(hr_contracts, ({ one }) => ({
  employee: one(hr_users, {
    fields: [hr_contracts.employee_id],
    references: [hr_users.id],
  }),
}));

export const hrLeavesRelations = relations(hr_leaves, ({ one }) => ({
  employee: one(hr_users, {
    fields: [hr_leaves.user_id],
    references: [hr_users.id],
    relationName: "employee_leaves",
  }),
  reviewedBy: one(hr_users, {
    fields: [hr_leaves.reviewed_by_id],
    references: [hr_users.id],
    relationName: "reviewed_leaves",
  }),
}));

export const hrPoliciesRelations = relations(hr_documents, ({ one }) => ({
  createdBy: one(hr_users, {
    fields: [hr_documents.created_by_id],
    references: [hr_users.id],
  }),
}));

export const hrHelpdeskRelations = relations(hr_helpdesk_tickets, ({ one }) => ({
  submittedBy: one(hr_users, {
    fields: [hr_helpdesk_tickets.submitted_by_id],
    references: [hr_users.id],
    relationName: "submitted_tickets",
  }),
  assignedTo: one(hr_users, {
    fields: [hr_helpdesk_tickets.assigned_to_id],
    references: [hr_users.id],
    relationName: "assigned_tickets",
  }),
}));

export const hrAssetsRelations = relations(hr_assets, ({ one }) => ({
  assignedTo: one(hr_users, {
    fields: [hr_assets.assigned_to_id],
    references: [hr_users.id],
  }),
}));
