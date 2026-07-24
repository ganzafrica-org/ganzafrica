CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"legacy_hr_user_id" uuid,
	"employee_number" text,
	"work_email" text,
	"personal_email" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text,
	"picture" text,
	"citizenship" text,
	"home_country" text,
	"home_city" text,
	"department" text,
	"job_title" text,
	"manager_id" uuid,
	"employment_type" text DEFAULT 'staff' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"hired_at" date,
	"exited_at" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employees_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "employees_legacy_hr_user_id_unique" UNIQUE("legacy_hr_user_id"),
	CONSTRAINT "employees_employee_number_unique" UNIQUE("employee_number"),
	CONSTRAINT "employees_work_email_unique" UNIQUE("work_email"),
	CONSTRAINT "employees_employment_type_check" CHECK ("employees"."employment_type" IN ('fellow','analyst','staff','contractor','intern')),
	CONSTRAINT "employees_status_check" CHECK ("employees"."status" IN ('onboarding','active','on_leave','offboarding','exited'))
);
--> statement-breakpoint
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permission_id_permissions_id_fk";
--> statement-breakpoint
ALTER TABLE "hr_asset_maintenance" ADD COLUMN "requester_employee_id" uuid;--> statement-breakpoint
ALTER TABLE "hr_assets" ADD COLUMN "assigned_to_employee_id" uuid;--> statement-breakpoint
ALTER TABLE "hr_contracts" ADD COLUMN "employee_ref_id" uuid;--> statement-breakpoint
ALTER TABLE "hr_documents" ADD COLUMN "created_by_employee_id" uuid;--> statement-breakpoint
ALTER TABLE "hr_helpdesk_tickets" ADD COLUMN "submitted_by_employee_id" uuid;--> statement-breakpoint
ALTER TABLE "hr_helpdesk_tickets" ADD COLUMN "assigned_to_employee_id" uuid;--> statement-breakpoint
ALTER TABLE "hr_leaves" ADD COLUMN "employee_id" uuid;--> statement-breakpoint
ALTER TABLE "hr_leaves" ADD COLUMN "reviewed_by_employee_id" uuid;--> statement-breakpoint
ALTER TABLE "hr_policies" ADD COLUMN "created_by_employee_id" uuid;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_manager_id_employees_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_asset_maintenance" ADD CONSTRAINT "hr_asset_maintenance_requester_employee_id_employees_id_fk" FOREIGN KEY ("requester_employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_assets" ADD CONSTRAINT "hr_assets_assigned_to_employee_id_employees_id_fk" FOREIGN KEY ("assigned_to_employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_contracts" ADD CONSTRAINT "hr_contracts_employee_ref_id_employees_id_fk" FOREIGN KEY ("employee_ref_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_documents" ADD CONSTRAINT "hr_documents_created_by_employee_id_employees_id_fk" FOREIGN KEY ("created_by_employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_helpdesk_tickets" ADD CONSTRAINT "hr_helpdesk_tickets_submitted_by_employee_id_employees_id_fk" FOREIGN KEY ("submitted_by_employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_helpdesk_tickets" ADD CONSTRAINT "hr_helpdesk_tickets_assigned_to_employee_id_employees_id_fk" FOREIGN KEY ("assigned_to_employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leaves" ADD CONSTRAINT "hr_leaves_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leaves" ADD CONSTRAINT "hr_leaves_reviewed_by_employee_id_employees_id_fk" FOREIGN KEY ("reviewed_by_employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_policies" ADD CONSTRAINT "hr_policies_created_by_employee_id_employees_id_fk" FOREIGN KEY ("created_by_employee_id") REFERENCES "public"."employees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_resource_action_idx" ON "permissions" USING btree ("resource","action");--> statement-breakpoint
CREATE UNIQUE INDEX "role_permissions_role_perm_idx" ON "role_permissions" USING btree ("role_id","permission_id");