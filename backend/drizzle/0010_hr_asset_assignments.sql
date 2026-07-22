CREATE TABLE "hr_asset_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"assigned_by" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"returned_at" timestamp with time zone,
	"return_condition" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_asset_assignments" ADD CONSTRAINT "hr_asset_assignments_asset_id_hr_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."hr_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_asset_assignments" ADD CONSTRAINT "hr_asset_assignments_employee_id_hr_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_asset_assignments" ADD CONSTRAINT "hr_asset_assignments_assigned_by_hr_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."hr_users"("id") ON DELETE no action ON UPDATE no action;
