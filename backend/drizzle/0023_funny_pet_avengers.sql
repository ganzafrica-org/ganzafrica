CREATE TYPE "public"."document_category_template_color" AS ENUM('green', 'yellow', 'blue', 'orange');--> statement-breakpoint
CREATE TABLE "hr_document_category_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"color" "document_category_template_color" NOT NULL,
	"header_text" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hr_document_category_templates_name_unique" UNIQUE("name")
);
