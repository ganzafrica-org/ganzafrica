import { pgEnum } from "drizzle-orm/pg-core";

export const hrRoleEnum = pgEnum("hr_role", ["EMPLOYEE", "IT", "HR"]);

/** Employee / HR user lifecycle status */
export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "ON_LEAVE",
  "INACTIVE",
  "TERMINATED",
]);

export const contractTypeEnum = pgEnum("contract_type", [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
]);

export const contractStatusEnum = pgEnum("contract_status", [
  "DRAFT",
  "ACTIVE",
  "EXPIRED",
  "TERMINATED",
]);

export const leaveTypeEnum = pgEnum("leave_type", [
  "ANNUAL",
  "SICK",
  "MATERNITY",
  "PATERNITY",
  "UNPAID",
  "OTHER",
]);

export const leaveStatusEnum = pgEnum("leave_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
]);

export const assetIssueEnum = pgEnum("asset_issue", ["YES", "NO"]);

export const assetStatusEnum = pgEnum("asset_status", [
  "AVAILABLE",
  "ASSIGNED",
  "UNDER_MAINTENANCE",
  "DISPOSED",
]);

export const documentStatusEnum = pgEnum("policy_status", ["PUBLISHED", "DRAFT", "ARCHIVED"]);

// Document category *templates* (additive, v1 — see document-category-template.ts): the four
// brand colors HR can pick when designing how a category should look. Deliberately a separate
// enum from documentCategoryEnum below — templates are a standalone entity, not a replacement
// for the fixed hr_documents.category enum.
export const documentCategoryTemplateColorEnum = pgEnum("document_category_template_color", [
  "green",
  "yellow",
  "blue",
  "orange",
]);

export const documentCategoryEnum = pgEnum("policy_category", [
  "Contract Templates",
  "Policies & Procedures",
  "Forms & Applications",
  "Training Materials",
  "Compliance & Legal",
  "Onboarding Materials",
]);

/** HR policies module (distinct PG types from document enums above) */
export const policyStatusEnum = pgEnum("hr_policy_status", ["PUBLISHED", "DRAFT"]);

export const policyCategoryEnum = pgEnum("hr_policy_category", [
  "GENERAL",
  "HR",
  "IT",
  "FINANCE",
  "COMPLIANCE",
  "OTHER",
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
]);

export const ticketPriorityEnum = pgEnum("ticket_priority", ["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "EMPLOYEE_CREATED",
  "EMPLOYEE_STATUS_CHANGED",
  "CONTRACT_CREATED",
  "CONTRACT_UPDATED",
  "CONTRACT_EXPIRING",
  "LEAVE_REQUESTED",
  "LEAVE_PENDING_APPROVAL",
  "LEAVE_APPROVED",
  "LEAVE_REJECTED",
  "LEAVE_CANCELLED",
  "TICKET_CREATED",
  "TICKET_STATUS_CHANGED",
  "TICKET_ASSIGNED",
  "ASSET_ASSIGNED",
  "ASSET_RETURNED",
  "ASSET_STATUS_CHANGED",
  "DOCUMENT_PUBLISHED",
  "PROCESS_TASK_ASSIGNED",
  "PROCESS_TASK_OVERDUE",
  "PROCESS_COMPLETED",
  "MANAGER_CHANGED",
]);

export const notificationStatusEnum = pgEnum("notification_status", ["UNREAD", "READ", "ARCHIVED"]);

export const notificationPriorityEnum = pgEnum("notification_priority", [
  "LOW",
  "NORMAL",
  "HIGH",
  "CRITICAL",
]);
