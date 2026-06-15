import { pgEnum } from "drizzle-orm/pg-core";

export const hrRoleEnum = pgEnum("hr_role", ["EMPLOYEE", "IT", "HR"]);

export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "ON_LEAVE",
  "INACTIVE",
]);

export const assetIssueEnum = pgEnum("asset_issue", ["YES", "NO"]);

export const policyStatusEnum = pgEnum("policy_status", ["PUBLISHED", "DRAFT"]);

export const leaveStatusEnum = pgEnum("leave_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const leaveTypeEnum = pgEnum("leave_type", [
  "ANNUAL",
  "SICK",
  "MATERNITY",
  "PATERNITY",
  "OTHER",
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
]);
