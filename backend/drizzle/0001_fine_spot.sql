CREATE TYPE "public"."document_category_template_border_style" AS ENUM('NONE', 'SIMPLE', 'DOUBLE', 'ACCENT');--> statement-breakpoint
CREATE TYPE "public"."document_category_template_logo_position" AS ENUM('TOP_LEFT', 'BOTTOM_LEFT');--> statement-breakpoint
ALTER TABLE "hr_document_category_templates" ADD COLUMN "title_color" text DEFAULT '#1a1a1a' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_document_category_templates" ADD COLUMN "border_style" "document_category_template_border_style" DEFAULT 'NONE' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_document_category_templates" ADD COLUMN "logo_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_document_category_templates" ADD COLUMN "logo_position" "document_category_template_logo_position" DEFAULT 'TOP_LEFT' NOT NULL;