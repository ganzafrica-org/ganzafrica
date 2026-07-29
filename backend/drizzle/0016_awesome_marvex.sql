-- hr_otps RLS disable skipped (table dropped IF EXISTS below)--> statement-breakpoint
-- hr_users RLS disable skipped (table dropped IF EXISTS below)--> statement-breakpoint
DROP TABLE IF EXISTS "hr_otps" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "hr_users" CASCADE;--> statement-breakpoint
ALTER TABLE "employees" DROP CONSTRAINT IF EXISTS "employees_legacy_hr_user_id_unique";--> statement-breakpoint
ALTER TABLE "hr_asset_maintenance" DROP CONSTRAINT IF EXISTS "hr_asset_maintenance_requester_id_hr_users_id_fk";
--> statement-breakpoint
ALTER TABLE "hr_assets" DROP CONSTRAINT IF EXISTS "hr_assets_assigned_to_id_hr_users_id_fk";
--> statement-breakpoint
ALTER TABLE "hr_contracts" DROP CONSTRAINT IF EXISTS "hr_contracts_employee_id_hr_users_id_fk";
--> statement-breakpoint
ALTER TABLE "hr_documents" DROP CONSTRAINT IF EXISTS "hr_documents_created_by_id_hr_users_id_fk";
--> statement-breakpoint
ALTER TABLE "hr_helpdesk_tickets" DROP CONSTRAINT IF EXISTS "hr_helpdesk_tickets_submitted_by_id_hr_users_id_fk";
--> statement-breakpoint
ALTER TABLE "hr_helpdesk_tickets" DROP CONSTRAINT IF EXISTS "hr_helpdesk_tickets_assigned_to_id_hr_users_id_fk";
--> statement-breakpoint
ALTER TABLE "hr_leaves" DROP CONSTRAINT IF EXISTS "hr_leaves_user_id_hr_users_id_fk";
--> statement-breakpoint
ALTER TABLE "hr_leaves" DROP CONSTRAINT IF EXISTS "hr_leaves_reviewed_by_id_hr_users_id_fk";
--> statement-breakpoint
ALTER TABLE "hr_policies" DROP CONSTRAINT IF EXISTS "hr_policies_created_by_id_hr_users_id_fk";
--> statement-breakpoint
ALTER TABLE "hr_asset_maintenance" DROP COLUMN IF EXISTS "requester_id";--> statement-breakpoint
ALTER TABLE "hr_assets" DROP COLUMN IF EXISTS "assigned_to_id";--> statement-breakpoint
ALTER TABLE "hr_contracts" DROP COLUMN IF EXISTS "employee_id";--> statement-breakpoint
ALTER TABLE "hr_documents" DROP COLUMN IF EXISTS "created_by_id";--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN IF EXISTS "legacy_hr_user_id";--> statement-breakpoint
ALTER TABLE "hr_helpdesk_tickets" DROP COLUMN IF EXISTS "submitted_by_id";--> statement-breakpoint
ALTER TABLE "hr_helpdesk_tickets" DROP COLUMN IF EXISTS "assigned_to_id";--> statement-breakpoint
ALTER TABLE "hr_leaves" DROP COLUMN IF EXISTS "user_id";--> statement-breakpoint
ALTER TABLE "hr_leaves" DROP COLUMN IF EXISTS "reviewed_by_id";--> statement-breakpoint
ALTER TABLE "hr_policies" DROP COLUMN IF EXISTS "created_by_id";