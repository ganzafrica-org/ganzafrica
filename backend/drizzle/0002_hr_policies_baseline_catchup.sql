CREATE TYPE "public"."hr_policy_category" AS ENUM('GENERAL', 'HR', 'IT', 'FINANCE', 'COMPLIANCE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."hr_policy_status" AS ENUM('PUBLISHED', 'DRAFT');--> statement-breakpoint
CREATE TABLE "hr_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"category" text NOT NULL,
	"policy_category" "hr_policy_category" DEFAULT 'GENERAL',
	"version" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" text NOT NULL,
	"downloads" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"status" "hr_policy_status" DEFAULT 'PUBLISHED' NOT NULL,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_policies" ADD CONSTRAINT "hr_policies_created_by_id_hr_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."hr_users"("id") ON DELETE restrict ON UPDATE no action;