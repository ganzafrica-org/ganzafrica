ALTER TABLE "hr_asset_assignments" DROP CONSTRAINT "hr_asset_assignments_employee_id_employees_id_fk";
--> statement-breakpoint
ALTER TABLE "hr_asset_assignments" DROP CONSTRAINT "hr_asset_assignments_hr_user_id_hr_users_id_fk";
--> statement-breakpoint
ALTER TABLE "hr_asset_assignments" ALTER COLUMN "employee_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_asset_assignments" ADD CONSTRAINT "hr_asset_assignments_employee_id_hr_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_asset_assignments" DROP COLUMN "hr_user_id";