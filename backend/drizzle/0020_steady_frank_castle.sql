ALTER TYPE "public"."notification_type" ADD VALUE 'MANAGER_CHANGED';--> statement-breakpoint
CREATE TABLE "org_backfill_unresolved" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"raw_text" text NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "org_backfill_unresolved" ADD CONSTRAINT "org_backfill_unresolved_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;