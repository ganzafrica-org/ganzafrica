CREATE TABLE "hr_asset_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"assigned_by" integer,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"returned_at" timestamp with time zone,
	"return_condition" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_asset_maintenance" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_asset_assignments" ADD CONSTRAINT "hr_asset_assignments_asset_id_hr_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."hr_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_asset_assignments" ADD CONSTRAINT "hr_asset_assignments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_asset_assignments" ADD CONSTRAINT "hr_asset_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_asset_assignments_asset_idx" ON "hr_asset_assignments" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "hr_asset_assignments_employee_idx" ON "hr_asset_assignments" USING btree ("employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_asset_assignments_one_open_per_asset" ON "hr_asset_assignments" USING btree ("asset_id") WHERE "hr_asset_assignments"."returned_at" IS NULL;