CREATE TYPE "public"."ticket_category" AS ENUM('IT', 'HR', 'FACILITIES', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."ticket_source" AS ENUM('manual', 'asset_issue');--> statement-breakpoint
ALTER TYPE "public"."ticket_status" ADD VALUE 'REOPENED';--> statement-breakpoint
CREATE TABLE "hr_helpdesk_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"author_employee_id" uuid,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_helpdesk_tickets" ADD COLUMN "category" "ticket_category" DEFAULT 'OTHER' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_helpdesk_tickets" ADD COLUMN "source" "ticket_source" DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_helpdesk_tickets" ADD COLUMN "asset_id" uuid;--> statement-breakpoint
ALTER TABLE "hr_helpdesk_tickets" ADD COLUMN "closed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_helpdesk_comments" ADD CONSTRAINT "hr_helpdesk_comments_ticket_id_hr_helpdesk_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."hr_helpdesk_tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_helpdesk_comments" ADD CONSTRAINT "hr_helpdesk_comments_author_employee_id_employees_id_fk" FOREIGN KEY ("author_employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_helpdesk_tickets" ADD CONSTRAINT "hr_helpdesk_tickets_asset_id_hr_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."hr_assets"("id") ON DELETE set null ON UPDATE no action;